-- Tassionero — indicadores do painel e relatórios financeiros.
-- Princípios (SPEC §8): reserva não é receita; receita = pagamento registrado como recebido.

-- Indicadores do dashboard para um período [p_from, p_to) em datas locais.
create or replace function public.owner_dashboard(p_from date, p_to date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  s public.business_settings := public._settings();
  v_from timestamptz := p_from::timestamp at time zone s.timezone;
  v_to timestamptz := p_to::timestamp at time zone s.timezone;
  v_today date := (now() at time zone s.timezone)::date;
  v_today_start timestamptz := v_today::timestamp at time zone s.timezone;
  v jsonb;
begin
  perform public._assert_owner();

  select jsonb_build_object(
    'period', jsonb_build_object('from', p_from, 'to', p_to),
    'today_count', (
      select count(*) from public.appointments
       where starts_at >= v_today_start and starts_at < v_today_start + interval '1 day'
         and status in ('pending', 'confirmed', 'in_progress', 'completed')
    ),
    'pending_count', (select count(*) from public.appointments where status = 'pending'),
    'pending_stale_count', (
      select count(*) from public.appointments
       where status = 'pending' and created_at < now() - make_interval(hours => s.pending_alert_hours)
    ),
    'completed_count', (
      select count(*) from public.appointments
       where status = 'completed' and starts_at >= v_from and starts_at < v_to
    ),
    'appointments_count', (
      select count(*) from public.appointments
       where starts_at >= v_from and starts_at < v_to and status not in ('rejected', 'cancelled')
    ),
    'income_paid', (
      select coalesce(sum(case type when 'income' then amount else -amount end), 0)
        from public.transactions
       where status = 'paid' and type in ('income', 'refund') and paid_at >= v_from and paid_at < v_to
    ),
    'expenses_paid', (
      select coalesce(sum(amount), 0) from public.transactions
       where status = 'paid' and type = 'expense' and paid_at >= v_from and paid_at < v_to
    ),
    'expenses_due', (
      select coalesce(sum(amount), 0) from public.transactions
       where status = 'pending' and type = 'expense'
    ),
    -- Valor previsto ainda não recebido de serviços confirmados/realizados.
    'receivable', (
      select coalesce(sum(greatest(coalesce(final_total, reference_total, 0) - amount_paid, 0)), 0)
        from public.appointments
       where status in ('confirmed', 'in_progress', 'completed')
    ),
    'expected_in_period', (
      select coalesce(sum(coalesce(final_total, reference_total, 0)), 0)
        from public.appointments
       where status in ('pending', 'confirmed', 'in_progress', 'completed')
         and starts_at >= v_from and starts_at < v_to
    ),
    'monthly', (
      select coalesce(jsonb_agg(jsonb_build_object('month', m.month, 'income', m.income, 'expense', m.expense) order by m.month), '[]'::jsonb)
      from (
        select to_char(g, 'YYYY-MM') as month,
          (select coalesce(sum(case t.type when 'income' then t.amount else -t.amount end), 0)
             from public.transactions t
            where t.status = 'paid' and t.type in ('income', 'refund')
              and (t.paid_at at time zone s.timezone) >= g and (t.paid_at at time zone s.timezone) < g + interval '1 month') as income,
          (select coalesce(sum(t.amount), 0)
             from public.transactions t
            where t.status = 'paid' and t.type = 'expense'
              and (t.paid_at at time zone s.timezone) >= g and (t.paid_at at time zone s.timezone) < g + interval '1 month') as expense
        from generate_series(date_trunc('month', v_today::timestamp) - interval '11 months', date_trunc('month', v_today::timestamp), interval '1 month') g
      ) m
    ),
    'top_services', (
      select coalesce(jsonb_agg(x order by x.count desc, x.name), '[]'::jsonb)
      from (
        select i.service_name_snapshot as name, count(*) as count
          from public.appointment_items i
          join public.appointments a on a.id = i.appointment_id
         where a.status = 'completed' and a.starts_at >= v_from and a.starts_at < v_to
         group by i.service_name_snapshot
         order by count(*) desc
         limit 6
      ) x
    ),
    'by_week', (
      select coalesce(jsonb_agg(jsonb_build_object('week', w.week, 'count', w.count) order by w.week), '[]'::jsonb)
      from (
        select to_char(date_trunc('week', starts_at at time zone s.timezone), 'YYYY-MM-DD') as week, count(*) as count
          from public.appointments
         where starts_at >= v_from and starts_at < v_to and status not in ('rejected', 'cancelled')
         group by 1
      ) w
    )
  ) into v;
  return v;
end $$;

-- Relatório financeiro: receita por serviço (rateio proporcional ao preço do item)
-- e despesas por categoria, no período [p_from, p_to) em datas locais.
create or replace function public.owner_finance_report(p_from date, p_to date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  s public.business_settings := public._settings();
  v_from timestamptz := p_from::timestamp at time zone s.timezone;
  v_to timestamptz := p_to::timestamp at time zone s.timezone;
  v jsonb;
begin
  perform public._assert_owner();
  with pay as (
    select t.appointment_id, sum(case t.type when 'income' then t.amount else -t.amount end) as amount
      from public.transactions t
     where t.status = 'paid' and t.type in ('income', 'refund') and t.appointment_id is not null
       and t.paid_at >= v_from and t.paid_at < v_to
     group by t.appointment_id
  ),
  items as (
    select i.appointment_id, i.service_name_snapshot as name,
           coalesce(i.final_price, i.reference_price_snapshot) as weight,
           count(*) over (partition by i.appointment_id) as n,
           sum(coalesce(i.final_price, i.reference_price_snapshot)) over (partition by i.appointment_id) as total_weight
      from public.appointment_items i
     where i.appointment_id in (select appointment_id from pay)
  ),
  alloc as (
    select it.name,
           p.amount * case
             when coalesce(it.total_weight, 0) > 0 then coalesce(it.weight, 0) / it.total_weight
             else 1.0 / it.n
           end as amount
      from items it join pay p on p.appointment_id = it.appointment_id
  )
  select jsonb_build_object(
    'income_by_service', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'amount', round(total, 2)) order by total desc), '[]'::jsonb)
      from (select name, sum(amount) as total from alloc group by name) x
    ),
    'income_manual', (
      select coalesce(sum(amount), 0) from public.transactions
       where status = 'paid' and type = 'income' and appointment_id is null
         and paid_at >= v_from and paid_at < v_to
    ),
    'expenses_by_category', (
      select coalesce(jsonb_agg(jsonb_build_object('category', category, 'amount', total) order by total desc), '[]'::jsonb)
      from (
        select coalesce(nullif(category, ''), 'Sem categoria') as category, sum(amount) as total
          from public.transactions
         where status = 'paid' and type = 'expense' and paid_at >= v_from and paid_at < v_to
         group by 1
      ) e
    ),
    'by_method', (
      select coalesce(jsonb_agg(jsonb_build_object('method', method, 'amount', total) order by total desc), '[]'::jsonb)
      from (
        select coalesce(payment_method::text, 'other') as method,
               sum(case type when 'income' then amount else -amount end) as total
          from public.transactions
         where status = 'paid' and type in ('income', 'refund') and paid_at >= v_from and paid_at < v_to
         group by 1
      ) m
    )
  ) into v;
  return v;
end $$;
