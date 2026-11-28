-- Tassionero Estética Automotiva — schema base
-- Convenções:
--   * Dinheiro em numeric(10,2); nunca float.
--   * Datas/horas em timestamptz; expediente em hora local (America/Sao_Paulo).
--   * weekday: 0 = domingo ... 6 = sábado (mesma convenção de extract(dow)).
--   * Uma única agenda/recurso: toda reserva ativa compete pelo mesmo intervalo.

create extension if not exists btree_gist with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('owner');
create type public.appointment_status as enum
  ('pending', 'confirmed', 'in_progress', 'completed', 'rejected', 'cancelled');
create type public.booking_payment_method as enum ('pix', 'cash');
create type public.payment_status as enum ('unpaid', 'partially_paid', 'paid', 'refunded');
create type public.pricing_mode as enum ('fixed', 'vehicle_category', 'quote', 'mixed');
create type public.booking_mode as enum ('online', 'whatsapp');
create type public.transaction_type as enum ('income', 'expense', 'refund');
create type public.transaction_status as enum ('pending', 'paid', 'cancelled');
create type public.money_method as enum ('pix', 'cash', 'card', 'other');
create type public.pix_key_type as enum ('cpf', 'cnpj', 'email', 'phone', 'random');
create type public.appointment_source as enum ('site', 'admin');
create type public.history_kind as enum ('created', 'status', 'reschedule', 'price', 'payment', 'note');

-- ---------------------------------------------------------------------------
-- Utilitário: updated_at
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Perfis (proprietário)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.app_role,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Só pode existir um proprietário no escopo atual.
create unique index profiles_single_owner on public.profiles (role) where role = 'owner';

-- ---------------------------------------------------------------------------
-- Configurações do negócio (linha única)
-- ---------------------------------------------------------------------------
create table public.business_settings (
  id boolean primary key default true check (id),
  business_name text not null default 'Tassionero Estética Automotiva',
  tagline text not null default 'Cuidado em cada detalhe',
  public_description text not null default '',
  whatsapp_phone text not null default '' check (whatsapp_phone = '' or whatsapp_phone ~ '^\+[1-9][0-9]{10,14}$'),
  address text not null default '',
  city text not null default 'União do Oeste/SC',
  map_url text not null default '',
  instagram_url text not null default '',
  facebook_url text not null default '',
  tiktok_url text not null default '',
  pix_key text not null default '',
  pix_key_type public.pix_key_type,
  pix_holder_name text not null default '',
  payment_instructions text not null default '',
  booking_policy text not null default '',
  timezone text not null default 'America/Sao_Paulo',
  slot_interval_minutes integer not null default 15 check (slot_interval_minutes between 5 and 120),
  min_advance_minutes integer not null default 120 check (min_advance_minutes between 0 and 10080),
  max_advance_days integer not null default 60 check (max_advance_days between 1 and 365),
  max_pending_per_phone integer not null default 2 check (max_pending_per_phone between 1 and 10),
  pending_alert_hours integer not null default 24 check (pending_alert_hours between 1 and 720),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger business_settings_touch before update on public.business_settings
  for each row execute function public.touch_updated_at();

create table public.business_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  is_open boolean not null default false,
  opens_at time,
  closes_at time,
  constraint business_hours_valid check (
    (not is_open) or (opens_at is not null and closes_at is not null and closes_at > opens_at)
  )
);

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
create table public.vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 40),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text not null default '',
  -- Categoria sempre "sob avaliação" (ex.: Outros).
  is_quote_only boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger vehicle_categories_touch before update on public.vehicle_categories
  for each row execute function public.touch_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  summary text not null default '',
  description text not null default '',
  category text not null default '',
  duration_minutes integer not null check (duration_minutes between 5 and 720),
  pricing_mode public.pricing_mode not null default 'fixed',
  base_price numeric(10, 2) check (base_price is null or base_price >= 0),
  booking_mode public.booking_mode not null default 'online',
  cover_image_path text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  -- Dados de referência criados pelo sistema, a revisar pelo proprietário.
  is_demo boolean not null default false,
  sort_order integer not null default 0,
  internal_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_fixed_needs_price check (pricing_mode <> 'fixed' or base_price is not null)
);
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();
create index services_public_idx on public.services (is_active, sort_order);

create table public.service_category_prices (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  vehicle_category_id uuid not null references public.vehicle_categories (id) on delete cascade,
  price numeric(10, 2) not null check (price >= 0),
  unique (service_id, vehicle_category_id)
);

-- ---------------------------------------------------------------------------
-- Clientes e veículos (privados)
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 80),
  phone text not null check (phone ~ '^\+[1-9][0-9]{10,14}$'),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();
create index customers_phone_idx on public.customers (phone);
create index customers_name_idx on public.customers (lower(name));

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  vehicle_category_id uuid not null references public.vehicle_categories (id),
  make text not null default '',
  model text not null check (length(trim(model)) between 2 and 80),
  year smallint check (year is null or year between 1900 and 2100),
  color text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger vehicles_touch before update on public.vehicles
  for each row execute function public.touch_updated_at();
create index vehicles_customer_idx on public.vehicles (customer_id);

-- ---------------------------------------------------------------------------
-- Agendamentos
-- ---------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  customer_id uuid not null references public.customers (id),
  vehicle_id uuid not null references public.vehicles (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  payment_method public.booking_payment_method not null,
  payment_status public.payment_status not null default 'unpaid',
  -- Soma dos preços de referência; null quando algum item é "sob avaliação".
  reference_total numeric(10, 2) check (reference_total is null or reference_total >= 0),
  -- Valor combinado pelo proprietário; nunca altera o catálogo.
  final_total numeric(10, 2) check (final_total is null or final_total >= 0),
  amount_paid numeric(10, 2) not null default 0,
  -- Fotografia do que o cliente informou no pedido.
  customer_name_snapshot text not null,
  customer_phone_snapshot text not null,
  vehicle_snapshot text not null,
  customer_notes text not null default '' check (length(customer_notes) <= 500),
  internal_notes text not null default '',
  source public.appointment_source not null default 'site',
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_range_valid check (ends_at > starts_at),
  -- Barreira final contra sobreposição: duas reservas ativas nunca ocupam o mesmo tempo.
  constraint appointments_no_overlap exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed', 'in_progress'))
);
create trigger appointments_touch before update on public.appointments
  for each row execute function public.touch_updated_at();
create index appointments_starts_idx on public.appointments (starts_at);
create index appointments_status_idx on public.appointments (status);
create index appointments_customer_idx on public.appointments (customer_id);

create table public.appointment_items (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  position smallint not null default 0,
  service_name_snapshot text not null,
  duration_minutes_snapshot integer not null check (duration_minutes_snapshot > 0),
  pricing_mode_snapshot public.pricing_mode not null,
  reference_price_snapshot numeric(10, 2) check (reference_price_snapshot is null or reference_price_snapshot >= 0),
  final_price numeric(10, 2) check (final_price is null or final_price >= 0)
);
create index appointment_items_appt_idx on public.appointment_items (appointment_id);
create index appointment_items_service_idx on public.appointment_items (service_id);

create table public.appointment_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  kind public.history_kind not null,
  old_value text,
  new_value text,
  note text not null default '',
  changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index appointment_history_appt_idx on public.appointment_history (appointment_id, created_at);

create table public.blocked_periods (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint blocked_periods_range_valid check (ends_at > starts_at)
);
create index blocked_periods_range_idx on public.blocked_periods using gist (tstzrange(starts_at, ends_at, '[)'));

-- ---------------------------------------------------------------------------
-- Financeiro
-- ---------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments (id) on delete restrict,
  type public.transaction_type not null,
  description text not null check (length(trim(description)) between 2 and 160),
  category text not null default '',
  amount numeric(10, 2) not null check (amount > 0),
  payment_method public.money_method,
  status public.transaction_status not null default 'paid',
  due_date date,
  paid_at timestamptz,
  notes text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_paid_has_date check (status <> 'paid' or paid_at is not null),
  constraint transactions_refund_has_appointment check (type <> 'refund' or appointment_id is not null)
);
create trigger transactions_touch before update on public.transactions
  for each row execute function public.touch_updated_at();
create index transactions_paid_idx on public.transactions (type, status, paid_at);
create index transactions_appt_idx on public.transactions (appointment_id);

-- ---------------------------------------------------------------------------
-- Galeria
-- ---------------------------------------------------------------------------
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 2 and 120),
  description text not null default '',
  image_path text not null,
  before_image_path text,
  after_image_path text,
  service_id uuid references public.services (id) on delete set null,
  -- Imagem ilustrativa (não é trabalho real da empresa).
  is_illustrative boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger gallery_items_touch before update on public.gallery_items
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Antiabuso do formulário público
-- ---------------------------------------------------------------------------
create table public.booking_attempts (
  id bigint generated always as identity primary key,
  client_hash text not null,
  created_at timestamptz not null default now()
);
create index booking_attempts_idx on public.booking_attempts (client_hash, created_at);
