-- Tassionero — RLS, permissões, Storage e Realtime.
-- Visitante (anon): lê só catálogo ativo, categorias ativas, expediente e galeria publicada;
-- cria reserva apenas via create_public_appointment.
-- Proprietário (authenticated + profiles.role = 'owner'): administra tudo.

-- ---------------------------------------------------------------------------
-- Perfil automático para usuários do Auth. O primeiro usuário vira proprietário.
-- (O cadastro público fica desativado; o usuário é criado pelo painel do backend.)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when exists (select 1 from public.profiles where role = 'owner') then null else 'owner'::public.app_role end
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS em todas as tabelas
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.business_settings enable row level security;
alter table public.business_hours enable row level security;
alter table public.vehicle_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_category_prices enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_items enable row level security;
alter table public.appointment_history enable row level security;
alter table public.blocked_periods enable row level security;
alter table public.transactions enable row level security;
alter table public.gallery_items enable row level security;
alter table public.booking_attempts enable row level security;

-- Perfis
create policy profiles_self_read on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_owner());
create policy profiles_owner_update on public.profiles
  for update to authenticated using (id = auth.uid() and public.is_owner())
  with check (id = auth.uid());

-- Configurações (dados públicos saem por get_public_business_info)
create policy settings_owner_read on public.business_settings
  for select to authenticated using (public.is_owner());
create policy settings_owner_update on public.business_settings
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

-- Expediente
create policy hours_public_read on public.business_hours
  for select to anon, authenticated using (true);
create policy hours_owner_write on public.business_hours
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Categorias de veículo
create policy categories_public_read on public.vehicle_categories
  for select to anon, authenticated using (is_active or public.is_owner());
create policy categories_owner_write on public.vehicle_categories
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Serviços
create policy services_public_read on public.services
  for select to anon, authenticated using (is_active or public.is_owner());
create policy services_owner_write on public.services
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy prices_public_read on public.service_category_prices
  for select to anon, authenticated using (
    public.is_owner() or exists (select 1 from public.services s where s.id = service_id and s.is_active)
  );
create policy prices_owner_write on public.service_category_prices
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Dados privados: somente proprietário
create policy customers_owner on public.customers
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy vehicles_owner on public.vehicles
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy appointments_owner_read on public.appointments
  for select to authenticated using (public.is_owner());
create policy appointments_owner_notes on public.appointments
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

create policy items_owner_read on public.appointment_items
  for select to authenticated using (public.is_owner());
create policy history_owner_read on public.appointment_history
  for select to authenticated using (public.is_owner());

create policy blocks_owner_read on public.blocked_periods
  for select to authenticated using (public.is_owner());
create policy blocks_owner_delete on public.blocked_periods
  for delete to authenticated using (public.is_owner());

create policy transactions_owner on public.transactions
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Galeria
create policy gallery_public_read on public.gallery_items
  for select to anon, authenticated using (is_published or public.is_owner());
create policy gallery_owner_write on public.gallery_items
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- booking_attempts: sem políticas (acesso só pelas funções security definer).

-- ---------------------------------------------------------------------------
-- Permissões de tabela (defesa em profundidade além da RLS)
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
grant select on public.business_hours, public.vehicle_categories, public.services,
  public.service_category_prices, public.gallery_items to anon;

-- Agendamentos: horário, status, preço e pagamento só mudam pelas funções owner_*.
revoke insert, update, delete on public.appointments from authenticated;
grant update (internal_notes) on public.appointments to authenticated;
revoke insert, update, delete on public.appointment_items, public.appointment_history from authenticated;
revoke insert, update on public.blocked_periods from authenticated;
revoke all on public.booking_attempts from authenticated;
-- Saldo pago é calculado pelo banco.
revoke insert, delete on public.business_settings from authenticated;
revoke insert, delete on public.profiles from authenticated;

-- ---------------------------------------------------------------------------
-- Funções: internas fechadas; públicas e do proprietário explícitas
-- ---------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.is_owner() to anon, authenticated;
grant execute on function public.normalize_br_phone(text) to anon, authenticated;
grant execute on function public.get_public_business_info() to anon, authenticated;
grant execute on function public.quote_services(uuid[], uuid) to anon, authenticated;
grant execute on function public.get_available_slots(date, uuid[], uuid) to anon, authenticated;
grant execute on function public.create_public_appointment(jsonb) to anon, authenticated;
grant execute on function public.get_public_appointment(text) to anon, authenticated;

grant execute on function public.owner_available_slots(date, integer, uuid) to authenticated;
grant execute on function public.owner_update_appointment_status(uuid, public.appointment_status, text) to authenticated;
grant execute on function public.owner_reschedule_appointment(uuid, timestamptz, boolean, text) to authenticated;
grant execute on function public.owner_update_final_price(uuid, numeric, jsonb, text) to authenticated;
grant execute on function public.owner_register_payment(uuid, numeric, public.money_method, timestamptz, text) to authenticated;
grant execute on function public.owner_register_refund(uuid, numeric, public.money_method, timestamptz, text) to authenticated;
grant execute on function public.owner_create_appointment(jsonb) to authenticated;
grant execute on function public.owner_block_conflicts(timestamptz, timestamptz) to authenticated;
grant execute on function public.owner_create_block(timestamptz, timestamptz, text, jsonb) to authenticated;
grant execute on function public.owner_dashboard(date, date) to authenticated;
grant execute on function public.owner_finance_report(date, date) to authenticated;

-- Triggers precisam executar as funções de gatilho.
grant execute on function public.touch_updated_at() to authenticated;
grant execute on function public._transactions_refresh_trigger() to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: bucket público para catálogo/galeria; escrita só do proprietário
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy media_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
create policy media_owner_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_owner());
create policy media_owner_update on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_owner());
create policy media_owner_delete on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_owner());

-- ---------------------------------------------------------------------------
-- Realtime: novas reservas aparecem no painel (RLS continua valendo)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.appointments;
  end if;
end $$;
