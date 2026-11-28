-- Tassionero — motor de agenda e operações críticas
--
-- Regras centrais (CLAUDE.md / SPEC §6):
--   * Horário válido = início + duração total cabe inteiro no expediente local,
--     sem sobrepor bloqueio nem reserva ativa (pending, confirmed, in_progress).
--   * Toda criação/alteração de horário roda sob um lock transacional único da
--     agenda (um só recurso) e a constraint de exclusão é a barreira final.
--   * Erros de negócio saem como `raise exception '<codigo>'` (SQLSTATE P0001);
--     o app traduz o código para uma mensagem amigável.

-- ---------------------------------------------------------------------------
-- Auxiliares internos (não expostos)
-- ---------------------------------------------------------------------------
create or replace function public._settings()
returns public.business_settings
language sql stable security definer set search_path = public as $$
  select * from public.business_settings where id
$$;

create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner'
  )
$$;

create or replace function public._assert_owner()
returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_owner() then
    raise exception 'not_authorized';
  end if;
end $$;

create or replace function public._lock_agenda()
returns void
language sql as $$
  select pg_advisory_xact_lock(hashtext('tassionero:agenda'))
$$;

-- Telefone brasileiro -> E.164 (+55DDNNNNNNNNN). Retorna null se inválido.
create or replace function public.normalize_br_phone(p text)
returns text
language plpgsql immutable as $$
declare
  d text := regexp_replace(coalesce(p, ''), '\D', '', 'g');
begin
  if length(d) in (12, 13) and left(d, 2) = '55' then
    d := substr(d, 3);
  end if;
  if length(d) not in (10, 11) then
    return null;
  end if;
  if substr(d, 1, 1) = '0' or substr(d, 2, 1) = '0' then
    return null; -- DDD inválido
  end if;
  if length(d) = 11 and substr(d, 3, 1) <> '9' then
    return null; -- celular com 9 dígitos começa com 9
  end if;
  return '+55' || d;
end $$;

-- Linhas de serviço com duração e preço de referência para uma categoria.
-- Regras de preço (SPEC §4.3):
--   fixed            -> base_price
--   vehicle_category -> preço da categoria (sem preço = sob avaliação)
--   quote            -> sob avaliação (null)
--   mixed            -> preço da categoria, senão base_price (sempre sujeito a avaliação)
--   categoria "sob avaliação" (is_quote_only) -> null em qualquer modalidade
create or replace function public._service_lines(
  p_service_ids uuid[],
  p_vehicle_category_id uuid,
  p_require_online boolean
)
returns table (
  service_id uuid,
  item_position smallint,
  service_name text,
  duration_minutes integer,
  pricing_mode public.pricing_mode,
  reference_price numeric
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_category public.vehicle_categories;
  v_count integer;
begin
  if p_service_ids is null or cardinality(p_service_ids) = 0 then
    raise exception 'services_required';
  end if;
  if cardinality(p_service_ids) > 6 then
    raise exception 'too_many_services';
  end if;
  if (select count(distinct x) from unnest(p_service_ids) x) <> cardinality(p_service_ids) then
    raise exception 'duplicate_services';
  end if;

  select * into v_category from public.vehicle_categories
   where id = p_vehicle_category_id and is_active;
  if not found then
    raise exception 'invalid_vehicle_category';
  end if;

  select count(*) into v_count from public.services s
   where s.id = any (p_service_ids)
     and s.is_active
     and (not p_require_online or s.booking_mode = 'online');
  if v_count <> cardinality(p_service_ids) then
    raise exception 'invalid_services';
  end if;

  return query
  select
    s.id,
    (o.ord - 1)::smallint,
    s.name,
    s.duration_minutes,
    s.pricing_mode,
    case
      when v_category.is_quote_only then null
      when s.pricing_mode = 'fixed' then s.base_price
      when s.pricing_mode = 'vehicle_category' then scp.price
      when s.pricing_mode = 'mixed' then coalesce(scp.price, s.base_price)
      else null
    end::numeric
  from unnest(p_service_ids) with ordinality as o (sid, ord)
  join public.services s on s.id = o.sid
  left join public.service_category_prices scp
    on scp.service_id = s.id and scp.vehicle_category_id = v_category.id
  order by o.ord;
end $$;

-- Algum compromisso ativo ou bloqueio ocupa o intervalo?
create or replace function public._is_occupied(
  p_start timestamptz,
  p_end timestamptz,
  p_ignore_appointment uuid default null
)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.appointments a
     where a.status in ('pending', 'confirmed', 'in_progress')
       and (p_ignore_appointment is null or a.id <> p_ignore_appointment)
       and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start, p_end, '[)')
  ) or exists (
    select 1 from public.blocked_periods b
     where tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_start, p_end, '[)')
  )
$$;

-- Inícios possíveis num dia local para uma duração.
--   p_enforce_window: aplica antecedência mínima/máxima (fluxo público).
--   Sempre exige início no futuro.
create or replace function public._slot_candidates(
  p_date date,
  p_duration_minutes integer,
  p_ignore_appointment uuid,
  p_enforce_window boolean
)
returns setof timestamptz
language plpgsql stable security definer set search_path = public as $$
declare
  s public.business_settings := public._settings();
  h public.business_hours;
  v_today date := (now() at time zone s.timezone)::date;
  v_day_start timestamptz;
  v_day_end timestamptz;
  v_duration interval := make_interval(mins => p_duration_minutes);
  v_step interval := make_interval(mins => s.slot_interval_minutes);
  v_earliest timestamptz := now();
begin
  if p_duration_minutes is null or p_duration_minutes <= 0 then
    return;
  end if;
  if p_enforce_window then
    if p_date < v_today or p_date > v_today + s.max_advance_days then
      return;
    end if;
    v_earliest := now() + make_interval(mins => s.min_advance_minutes);
  end if;

  select * into h from public.business_hours where weekday = extract(dow from p_date)::smallint;
  if not found or not h.is_open then
    return;
  end if;

  v_day_start := (p_date + h.opens_at) at time zone s.timezone;
  v_day_end := (p_date + h.closes_at) at time zone s.timezone;

  -- Candidatos: grade a partir da abertura + término de cada reserva/bloqueio do dia
  -- (assim um serviço que termina 08:40 libera um início às 08:40, sem buracos).
  return query
  select distinct c.g
    from (
      select g from generate_series(v_day_start, v_day_end - v_duration, v_step) as g
      union
      select a.ends_at from public.appointments a
       where a.status in ('pending', 'confirmed', 'in_progress')
         and (p_ignore_appointment is null or a.id <> p_ignore_appointment)
         and a.ends_at >= v_day_start and a.ends_at <= v_day_end - v_duration
      union
      select b.ends_at from public.blocked_periods b
       where b.ends_at >= v_day_start and b.ends_at <= v_day_end - v_duration
    ) c
   where c.g >= v_earliest
     and not public._is_occupied(c.g, c.g + v_duration, p_ignore_appointment)
   order by c.g;
end $$;

create or replace function public._new_public_code()
returns text
language plpgsql volatile set search_path = public, extensions as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  bytes bytea := extensions.gen_random_bytes(8);
  code text := '';
  i integer;
begin
  for i in 0..7 loop
    code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return substr(code, 1, 4) || '-' || substr(code, 5, 4);
end $$;

create or replace function public._client_hash()
returns text
language plpgsql stable set search_path = public, extensions as $$
declare
  headers json;
  ip text;
begin
  begin
    headers := current_setting('request.headers', true)::json;
  exception when others then
    headers := null;
  end;
  ip := coalesce(
    split_part(headers ->> 'x-forwarded-for', ',', 1),
    headers ->> 'x-real-ip',
    headers ->> 'cf-connecting-ip',
    'unknown'
  );
  return encode(extensions.digest(trim(ip), 'sha256'), 'hex');
end $$;

-- Recalcula valor pago e status de pagamento de um agendamento.
create or replace function public._refresh_payment(p_appointment_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_income numeric := 0;
  v_refund numeric := 0;
  v_paid numeric;
  v_target numeric;
  v_status public.payment_status;
begin
  if p_appointment_id is null then
    return;
  end if;
  select
    coalesce(sum(amount) filter (where type = 'income'), 0),
    coalesce(sum(amount) filter (where type = 'refund'), 0)
    into v_income, v_refund
    from public.transactions
   where appointment_id = p_appointment_id and status = 'paid';

  v_paid := v_income - v_refund;
  select coalesce(final_total, reference_total) into v_target
    from public.appointments where id = p_appointment_id;

  v_status := case
    when v_paid <= 0 and v_refund > 0 then 'refunded'
    when v_paid <= 0 then 'unpaid'
    when v_target is not null and v_paid >= v_target then 'paid'
    else 'partially_paid'
  end;

  update public.appointments
     set amount_paid = greatest(v_paid, 0), payment_status = v_status
   where id = p_appointment_id
     and (amount_paid is distinct from greatest(v_paid, 0) or payment_status is distinct from v_status);
end $$;

create or replace function public._transactions_refresh_trigger()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public._refresh_payment(old.appointment_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public._refresh_payment(new.appointment_id);
  end if;
  return null;
end $$;

create trigger transactions_refresh_payment
  after insert or update or delete on public.transactions
  for each row execute function public._transactions_refresh_trigger();

create or replace function public._log(
  p_appointment_id uuid,
  p_kind public.history_kind,
  p_old text,
  p_new text,
  p_note text
)
returns void
language sql security definer set search_path = public as $$
  insert into public.appointment_history (appointment_id, kind, old_value, new_value, note, changed_by)
  values (p_appointment_id, p_kind, p_old, p_new, coalesce(p_note, ''), auth.uid())
$$;

-- Cria o agendamento e seus itens (sem checagens de horário; quem chama valida).
create or replace function public._insert_appointment(
  p_customer_id uuid,
  p_vehicle_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_vehicle_snapshot text,
  p_service_ids uuid[],
  p_vehicle_category_id uuid,
  p_require_online boolean,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_status public.appointment_status,
  p_payment_method public.booking_payment_method,
  p_final_total numeric,
  p_customer_notes text,
  p_internal_notes text,
  p_source public.appointment_source
)
returns public.appointments
language plpgsql security definer set search_path = public as $$
declare
  v_appt public.appointments;
  v_ref numeric;
  v_has_quote boolean;
  v_attempt integer := 0;
begin
  select sum(reference_price), bool_or(reference_price is null)
    into v_ref, v_has_quote
    from public._service_lines(p_service_ids, p_vehicle_category_id, p_require_online);

  loop
    begin
      insert into public.appointments (
        public_code, customer_id, vehicle_id, starts_at, ends_at, status, payment_method,
        reference_total, final_total, customer_name_snapshot, customer_phone_snapshot,
        vehicle_snapshot, customer_notes, internal_notes, source
      ) values (
        public._new_public_code(), p_customer_id, p_vehicle_id, p_starts_at, p_ends_at, p_status,
        p_payment_method, case when v_has_quote then null else v_ref end, p_final_total,
        p_customer_name, p_customer_phone, p_vehicle_snapshot,
        coalesce(p_customer_notes, ''), coalesce(p_internal_notes, ''), p_source
      ) returning * into v_appt;
      exit;
    exception when unique_violation then
      v_attempt := v_attempt + 1;
      if v_attempt > 5 then
        raise;
      end if;
    end;
  end loop;

  insert into public.appointment_items (
    appointment_id, service_id, position, service_name_snapshot, duration_minutes_snapshot,
    pricing_mode_snapshot, reference_price_snapshot
  )
  select v_appt.id, l.service_id, l.item_position, l.service_name, l.duration_minutes,
         l.pricing_mode, l.reference_price
    from public._service_lines(p_service_ids, p_vehicle_category_id, p_require_online) l;

  perform public._log(v_appt.id, 'created', null, p_status::text,
    case p_source when 'site' then 'Solicitado pelo site' else 'Criado no painel' end);
  return v_appt;
end $$;

-- ---------------------------------------------------------------------------
-- API pública (anon)
-- ---------------------------------------------------------------------------

-- Dados públicos da empresa. Não inclui chave Pix.
create or replace function public.get_public_business_info()
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'business_name', s.business_name,
    'tagline', s.tagline,
    'public_description', s.public_description,
    'whatsapp_phone', s.whatsapp_phone,
    'address', s.address,
    'city', s.city,
    'map_url', s.map_url,
    'instagram_url', s.instagram_url,
    'facebook_url', s.facebook_url,
    'tiktok_url', s.tiktok_url,
    'payment_instructions', s.payment_instructions,
    'booking_policy', s.booking_policy,
    'timezone', s.timezone,
    'slot_interval_minutes', s.slot_interval_minutes,
    'min_advance_minutes', s.min_advance_minutes,
    'max_advance_days', s.max_advance_days,
    'today', (now() at time zone s.timezone)::date,
    'hours', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'weekday', h.weekday, 'is_open', h.is_open,
        'opens_at', to_char(h.opens_at, 'HH24:MI'), 'closes_at', to_char(h.closes_at, 'HH24:MI')
      ) order by h.weekday), '[]'::jsonb)
      from public.business_hours h
    )
  )
  from public.business_settings s
  where s.id
$$;

-- Prévia de preço/duração para o resumo do agendamento (regra única no servidor).
create or replace function public.quote_services(
  p_service_ids uuid[],
  p_vehicle_category_id uuid
)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v jsonb;
begin
  select jsonb_build_object(
    'duration_minutes', sum(l.duration_minutes),
    'reference_total', case when bool_or(l.reference_price is null) then null else sum(l.reference_price) end,
    'has_quote_items', bool_or(l.reference_price is null),
    'is_estimate', bool_or(l.pricing_mode in ('mixed', 'quote') or l.reference_price is null),
    'items', jsonb_agg(jsonb_build_object(
      'service_id', l.service_id, 'name', l.service_name,
      'duration_minutes', l.duration_minutes, 'pricing_mode', l.pricing_mode,
      'reference_price', l.reference_price
    ) order by l.item_position)
  ) into v
  from public._service_lines(p_service_ids, p_vehicle_category_id, true) l;
  return v;
end $$;

create or replace function public.get_available_slots(
  p_date date,
  p_service_ids uuid[],
  p_vehicle_category_id uuid
)
returns table (starts_at timestamptz, ends_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare
  v_duration integer;
begin
  select sum(l.duration_minutes) into v_duration
    from public._service_lines(p_service_ids, p_vehicle_category_id, true) l;
  return query
  select c, c + make_interval(mins => v_duration)
    from public._slot_candidates(p_date, v_duration, null, true) c;
end $$;

-- Cria a solicitação de agendamento do site (status pending), de forma atômica.
-- payload: { name, phone, vehicle_category_id, vehicle_model, service_ids[],
--            starts_at, payment_method, notes?, website? (honeypot) }
create or replace function public.create_public_appointment(p jsonb)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  s public.business_settings := public._settings();
  v_name text := trim(regexp_replace(coalesce(p ->> 'name', ''), '\s+', ' ', 'g'));
  v_phone text := public.normalize_br_phone(p ->> 'phone');
  v_model text := trim(regexp_replace(coalesce(p ->> 'vehicle_model', ''), '\s+', ' ', 'g'));
  v_notes text := trim(coalesce(p ->> 'notes', ''));
  v_category_id uuid;
  v_category public.vehicle_categories;
  v_service_ids uuid[];
  v_start timestamptz;
  v_duration integer;
  v_end timestamptz;
  v_method public.booking_payment_method;
  v_client text := public._client_hash();
  v_customer_id uuid;
  v_vehicle_id uuid;
  v_appt public.appointments;
begin
  -- Honeypot: humanos não preenchem este campo.
  if coalesce(p ->> 'website', '') <> '' then
    raise exception 'invalid_request';
  end if;

  if length(v_name) < 2 or length(v_name) > 80 then
    raise exception 'invalid_name';
  end if;
  if v_phone is null then
    raise exception 'invalid_phone';
  end if;
  if length(v_model) < 2 or length(v_model) > 80 then
    raise exception 'invalid_vehicle_model';
  end if;
  if length(v_notes) > 500 then
    raise exception 'notes_too_long';
  end if;

  begin
    v_category_id := (p ->> 'vehicle_category_id')::uuid;
    v_service_ids := array(select jsonb_array_elements_text(p -> 'service_ids'))::uuid[];
    v_start := (p ->> 'starts_at')::timestamptz;
    v_method := (p ->> 'payment_method')::public.booking_payment_method;
  exception when others then
    raise exception 'invalid_request';
  end;
  if v_start is null or v_method is null then
    raise exception 'invalid_request';
  end if;

  select * into v_category from public.vehicle_categories where id = v_category_id and is_active;
  if not found then
    raise exception 'invalid_vehicle_category';
  end if;

  select sum(l.duration_minutes) into v_duration
    from public._service_lines(v_service_ids, v_category_id, true) l;
  v_end := v_start + make_interval(mins => v_duration);

  -- Seção crítica: uma reserva por vez na agenda.
  perform public._lock_agenda();

  -- Antiabuso.
  if (select count(*) from public.appointments
       where customer_phone_snapshot = v_phone and status = 'pending') >= s.max_pending_per_phone then
    raise exception 'too_many_pending';
  end if;
  if (select count(*) from public.booking_attempts
       where client_hash = v_client and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;

  -- Revalida no servidor: o horário precisa estar entre os horários livres agora.
  if not exists (
    select 1 from public._slot_candidates((v_start at time zone s.timezone)::date, v_duration, null, true) c
     where c = v_start
  ) then
    raise exception 'slot_unavailable';
  end if;

  insert into public.customers (name, phone) values (v_name, v_phone)
  returning id into v_customer_id;
  insert into public.vehicles (customer_id, vehicle_category_id, model)
  values (v_customer_id, v_category_id, v_model)
  returning id into v_vehicle_id;

  begin
    v_appt := public._insert_appointment(
      v_customer_id, v_vehicle_id, v_name, v_phone,
      v_category.name || ' · ' || v_model,
      v_service_ids, v_category_id, true,
      v_start, v_end, 'pending', v_method, null, v_notes, '', 'site'
    );
  exception when exclusion_violation then
    raise exception 'slot_unavailable';
  end;

  insert into public.booking_attempts (client_hash) values (v_client);

  return jsonb_build_object('public_code', v_appt.public_code);
end $$;

-- Resumo público de uma solicitação pelo código (não sequencial, ~10^12 combinações).
create or replace function public.get_public_appointment(p_code text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'public_code', a.public_code,
    'status', a.status,
    'starts_at', a.starts_at,
    'ends_at', a.ends_at,
    'duration_minutes', (extract(epoch from (a.ends_at - a.starts_at)) / 60)::integer,
    'customer_first_name', split_part(a.customer_name_snapshot, ' ', 1),
    'vehicle', a.vehicle_snapshot,
    'payment_method', a.payment_method,
    'reference_total', a.reference_total,
    'final_total', a.final_total,
    'is_estimate', exists (
      select 1 from public.appointment_items i
       where i.appointment_id = a.id and (i.pricing_mode_snapshot in ('mixed', 'quote') or i.reference_price_snapshot is null)
    ),
    'items', (
      select jsonb_agg(jsonb_build_object(
        'name', i.service_name_snapshot,
        'duration_minutes', i.duration_minutes_snapshot,
        'reference_price', i.reference_price_snapshot
      ) order by i.position)
      from public.appointment_items i where i.appointment_id = a.id
    ),
    'whatsapp_phone', s.whatsapp_phone,
    'payment_instructions', s.payment_instructions,
    -- Chave Pix só é entregue para pedidos com Pix.
    'pix', case when a.payment_method = 'pix' and s.pix_key <> '' then jsonb_build_object(
      'key', s.pix_key, 'key_type', s.pix_key_type, 'holder_name', s.pix_holder_name
    ) end
  )
  from public.appointments a
  cross join public.business_settings s
  where a.public_code = upper(trim(p_code)) and s.id
$$;

-- ---------------------------------------------------------------------------
-- API do proprietário (authenticated + is_owner)
-- ---------------------------------------------------------------------------

create or replace function public.owner_available_slots(
  p_date date,
  p_duration_minutes integer,
  p_ignore_appointment uuid default null
)
returns setof timestamptz
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._assert_owner();
  return query select * from public._slot_candidates(p_date, p_duration_minutes, p_ignore_appointment, false);
end $$;

create or replace function public.owner_update_appointment_status(
  p_appointment_id uuid,
  p_status public.appointment_status,
  p_note text default ''
)
returns public.appointments
language plpgsql volatile security definer set search_path = public as $$
declare
  v public.appointments;
  v_allowed boolean;
  v_old public.appointment_status;
begin
  perform public._assert_owner();
  select * into v from public.appointments where id = p_appointment_id for update;
  if not found then
    raise exception 'not_found';
  end if;
  if v.status = p_status then
    return v;
  end if;
  v_old := v.status;

  v_allowed := case v.status
    when 'pending' then p_status in ('confirmed', 'rejected', 'cancelled')
    when 'confirmed' then p_status in ('in_progress', 'completed', 'cancelled')
    when 'in_progress' then p_status in ('completed', 'cancelled')
    else false
  end;
  if not v_allowed then
    raise exception 'invalid_transition';
  end if;

  update public.appointments
     set status = p_status,
         status_changed_at = now(),
         -- Concluído antes do previsto: registra o término real e libera o restante.
         ends_at = case
           when p_status = 'completed' and now() > starts_at and now() < ends_at then now()
           else ends_at
         end
   where id = p_appointment_id
  returning * into v;

  perform public._log(v.id, 'status', v_old::text, p_status::text, p_note);
  return v;
end $$;

create or replace function public.owner_reschedule_appointment(
  p_appointment_id uuid,
  p_new_start timestamptz,
  p_allow_outside_hours boolean default false,
  p_note text default ''
)
returns public.appointments
language plpgsql volatile security definer set search_path = public as $$
declare
  s public.business_settings := public._settings();
  v public.appointments;
  v_duration integer;
  v_new_end timestamptz;
begin
  perform public._assert_owner();
  perform public._lock_agenda();
  select * into v from public.appointments where id = p_appointment_id for update;
  if not found then
    raise exception 'not_found';
  end if;
  if v.status not in ('pending', 'confirmed') then
    raise exception 'invalid_transition';
  end if;

  select sum(duration_minutes_snapshot) into v_duration
    from public.appointment_items where appointment_id = v.id;
  -- Agendamentos criados no painel podem ter duração própria (ex.: serviços longos).
  v_duration := greatest(coalesce(v_duration, 0), (extract(epoch from (v.ends_at - v.starts_at)) / 60)::integer);
  v_new_end := p_new_start + make_interval(mins => v_duration);

  if p_allow_outside_hours then
    if public._is_occupied(p_new_start, v_new_end, v.id) then
      raise exception 'slot_unavailable';
    end if;
  elsif not exists (
    select 1 from public._slot_candidates((p_new_start at time zone s.timezone)::date, v_duration, v.id, false) c
     where c = p_new_start
  ) then
    raise exception 'slot_unavailable';
  end if;

  begin
    update public.appointments set starts_at = p_new_start, ends_at = v_new_end
     where id = v.id returning * into v;
  exception when exclusion_violation then
    raise exception 'slot_unavailable';
  end;

  perform public._log(v.id, 'reschedule', null, p_new_start::text, p_note);
  return v;
end $$;

-- Define o valor final combinado. Não altera o preço do catálogo.
-- p_item_prices: [{ "item_id": uuid, "final_price": number|null }] (opcional)
create or replace function public.owner_update_final_price(
  p_appointment_id uuid,
  p_final_total numeric,
  p_item_prices jsonb default null,
  p_note text default ''
)
returns public.appointments
language plpgsql volatile security definer set search_path = public as $$
declare
  v public.appointments;
  v_old numeric;
begin
  perform public._assert_owner();
  if p_final_total is not null and p_final_total < 0 then
    raise exception 'invalid_amount';
  end if;
  select * into v from public.appointments where id = p_appointment_id for update;
  if not found then
    raise exception 'not_found';
  end if;
  v_old := v.final_total;

  if p_item_prices is not null then
    update public.appointment_items i
       set final_price = (x ->> 'final_price')::numeric
      from jsonb_array_elements(p_item_prices) x
     where i.appointment_id = v.id and i.id = (x ->> 'item_id')::uuid;
  end if;

  update public.appointments set final_total = p_final_total where id = v.id returning * into v;
  perform public._refresh_payment(v.id);
  perform public._log(v.id, 'price', v_old::text, p_final_total::text, p_note);
  select * into v from public.appointments where id = v.id;
  return v;
end $$;

create or replace function public.owner_register_payment(
  p_appointment_id uuid,
  p_amount numeric,
  p_method public.money_method,
  p_paid_at timestamptz default now(),
  p_notes text default ''
)
returns public.transactions
language plpgsql volatile security definer set search_path = public as $$
declare
  v public.appointments;
  t public.transactions;
begin
  perform public._assert_owner();
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  select * into v from public.appointments where id = p_appointment_id;
  if not found then
    raise exception 'not_found';
  end if;
  if v.status in ('rejected') then
    raise exception 'invalid_transition';
  end if;

  insert into public.transactions (appointment_id, type, description, category, amount, payment_method, status, paid_at, notes, created_by)
  values (v.id, 'income', 'Pagamento ' || v.public_code || ' · ' || v.customer_name_snapshot, 'Serviços',
          p_amount, p_method, 'paid', coalesce(p_paid_at, now()), coalesce(p_notes, ''), auth.uid())
  returning * into t;

  perform public._log(v.id, 'payment', null, p_amount::text, coalesce(p_method::text, ''));
  return t;
end $$;

-- Estorno explícito (nunca automático).
create or replace function public.owner_register_refund(
  p_appointment_id uuid,
  p_amount numeric,
  p_method public.money_method,
  p_paid_at timestamptz default now(),
  p_notes text default ''
)
returns public.transactions
language plpgsql volatile security definer set search_path = public as $$
declare
  v public.appointments;
  t public.transactions;
begin
  perform public._assert_owner();
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  select * into v from public.appointments where id = p_appointment_id;
  if not found then
    raise exception 'not_found';
  end if;
  if p_amount > v.amount_paid then
    raise exception 'refund_exceeds_paid';
  end if;
  insert into public.transactions (appointment_id, type, description, category, amount, payment_method, status, paid_at, notes, created_by)
  values (v.id, 'refund', 'Estorno ' || v.public_code || ' · ' || v.customer_name_snapshot, 'Estornos',
          p_amount, p_method, 'paid', coalesce(p_paid_at, now()), coalesce(p_notes, ''), auth.uid())
  returning * into t;
  perform public._log(v.id, 'payment', null, '-' || p_amount::text, 'Estorno');
  return t;
end $$;

-- Agendamento criado pelo proprietário (ex.: serviço combinado pelo WhatsApp).
-- payload: { customer_id? | customer: {name, phone}, vehicle_id? | vehicle: {vehicle_category_id, make?, model},
--            service_ids[], starts_at, ends_at?, payment_method, status?, final_total?, internal_notes?,
--            allow_outside_hours? }
create or replace function public.owner_create_appointment(p jsonb)
returns public.appointments
language plpgsql volatile security definer set search_path = public as $$
declare
  s public.business_settings := public._settings();
  v_customer public.customers;
  v_vehicle public.vehicles;
  v_category public.vehicle_categories;
  v_service_ids uuid[];
  v_start timestamptz;
  v_end timestamptz;
  v_duration integer;
  v_status public.appointment_status := coalesce((p ->> 'status')::public.appointment_status, 'confirmed');
  v_method public.booking_payment_method := coalesce((p ->> 'payment_method')::public.booking_payment_method, 'cash');
  v_phone text;
  v_appt public.appointments;
begin
  perform public._assert_owner();
  if v_status not in ('pending', 'confirmed') then
    raise exception 'invalid_transition';
  end if;

  if p ? 'customer_id' and nullif(p ->> 'customer_id', '') is not null then
    select * into v_customer from public.customers where id = (p ->> 'customer_id')::uuid;
    if not found then raise exception 'not_found'; end if;
  else
    v_phone := public.normalize_br_phone(p -> 'customer' ->> 'phone');
    if v_phone is null then raise exception 'invalid_phone'; end if;
    insert into public.customers (name, phone)
    values (trim(p -> 'customer' ->> 'name'), v_phone)
    returning * into v_customer;
  end if;

  if p ? 'vehicle_id' and nullif(p ->> 'vehicle_id', '') is not null then
    select * into v_vehicle from public.vehicles
     where id = (p ->> 'vehicle_id')::uuid and customer_id = v_customer.id;
    if not found then raise exception 'not_found'; end if;
  else
    insert into public.vehicles (customer_id, vehicle_category_id, make, model)
    values (v_customer.id, (p -> 'vehicle' ->> 'vehicle_category_id')::uuid,
            coalesce(trim(p -> 'vehicle' ->> 'make'), ''), trim(p -> 'vehicle' ->> 'model'))
    returning * into v_vehicle;
  end if;
  select * into v_category from public.vehicle_categories where id = v_vehicle.vehicle_category_id;

  v_service_ids := array(select jsonb_array_elements_text(p -> 'service_ids'))::uuid[];
  select sum(l.duration_minutes) into v_duration
    from public._service_lines(v_service_ids, v_vehicle.vehicle_category_id, false) l;
  v_start := (p ->> 'starts_at')::timestamptz;
  v_end := coalesce((p ->> 'ends_at')::timestamptz, v_start + make_interval(mins => v_duration));
  if v_end <= v_start then
    raise exception 'invalid_range';
  end if;

  perform public._lock_agenda();
  if coalesce((p ->> 'allow_outside_hours')::boolean, false) or p ? 'ends_at' then
    if public._is_occupied(v_start, v_end, null) then
      raise exception 'slot_unavailable';
    end if;
  elsif not exists (
    select 1 from public._slot_candidates((v_start at time zone s.timezone)::date, v_duration, null, false) c
     where c = v_start
  ) then
    raise exception 'slot_unavailable';
  end if;

  begin
    v_appt := public._insert_appointment(
      v_customer.id, v_vehicle.id, v_customer.name, v_customer.phone,
      v_category.name || ' · ' || trim(both ' ' from v_vehicle.make || ' ' || v_vehicle.model),
      v_service_ids, v_vehicle.vehicle_category_id, false,
      v_start, v_end, v_status, v_method,
      nullif(p ->> 'final_total', '')::numeric, '', coalesce(p ->> 'internal_notes', ''), 'admin'
    );
  exception when exclusion_violation then
    raise exception 'slot_unavailable';
  end;
  return v_appt;
end $$;

-- Reservas ativas que conflitam com um período.
create or replace function public.owner_block_conflicts(p_start timestamptz, p_end timestamptz)
returns table (
  id uuid, public_code text, starts_at timestamptz, ends_at timestamptz,
  status public.appointment_status, customer_name text, vehicle text
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._assert_owner();
  return query
  select a.id, a.public_code, a.starts_at, a.ends_at, a.status, a.customer_name_snapshot, a.vehicle_snapshot
    from public.appointments a
   where a.status in ('pending', 'confirmed', 'in_progress')
     and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start, p_end, '[)')
   order by a.starts_at;
end $$;

-- Cria bloqueio. Cada reserva em conflito precisa de uma resolução explícita;
-- se sobrar conflito, nada é gravado (transação inteira desfeita).
-- p_resolutions: [{ "appointment_id": uuid, "action": "cancel" | "reschedule", "new_start"?: timestamptz }]
create or replace function public.owner_create_block(
  p_start timestamptz,
  p_end timestamptz,
  p_reason text default '',
  p_resolutions jsonb default '[]'::jsonb
)
returns public.blocked_periods
language plpgsql volatile security definer set search_path = public as $$
declare
  r jsonb;
  v_block public.blocked_periods;
  v_id uuid;
  v_action text;
begin
  perform public._assert_owner();
  if p_end <= p_start then
    raise exception 'invalid_range';
  end if;
  perform public._lock_agenda();

  -- Cancelamentos primeiro (liberam espaço para reagendamentos).
  for r in select * from jsonb_array_elements(coalesce(p_resolutions, '[]'::jsonb)) loop
    v_id := (r ->> 'appointment_id')::uuid;
    v_action := r ->> 'action';
    if v_action = 'cancel' then
      perform public.owner_update_appointment_status(v_id, 'cancelled', coalesce(nullif(p_reason, ''), 'Período bloqueado'));
    elsif v_action <> 'reschedule' then
      raise exception 'invalid_request';
    end if;
  end loop;

  -- Bloqueio entra antes dos reagendamentos para que nenhum caia dentro dele.
  insert into public.blocked_periods (starts_at, ends_at, reason, created_by)
  values (p_start, p_end, coalesce(p_reason, ''), auth.uid())
  returning * into v_block;

  for r in select * from jsonb_array_elements(coalesce(p_resolutions, '[]'::jsonb)) loop
    if r ->> 'action' = 'reschedule' then
      perform public.owner_reschedule_appointment(
        (r ->> 'appointment_id')::uuid, (r ->> 'new_start')::timestamptz,
        coalesce((r ->> 'allow_outside_hours')::boolean, false), 'Reagendado por bloqueio'
      );
    end if;
  end loop;

  if exists (
    select 1 from public.appointments a
     where a.status in ('pending', 'confirmed', 'in_progress')
       and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_start, p_end, '[)')
  ) then
    raise exception 'block_conflicts';
  end if;

  return v_block;
end $$;
