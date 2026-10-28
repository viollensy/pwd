create extension if not exists pgcrypto with schema extensions;

create table if not exists public.rental_car_rates (
  car_name text primary key,
  daily_price bigint not null check (daily_price > 0),
  active boolean not null default true
);

insert into public.rental_car_rates (car_name, daily_price) values
  ('Suzuki Ertiga', 350000),
  ('Honda Brio', 275000),
  ('Honda HR-V e:HEV RS', 450000),
  ('Toyota Innova Zenix', 650000),
  ('Toyota Rush', 425000),
  ('Toyota Camry', 1200000)
on conflict (car_name) do update
set daily_price = excluded.daily_price, active = true;

create table if not exists public.rental_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  customer_phone text not null,
  car_name text not null references public.rental_car_rates(car_name),
  pickup_date date not null,
  return_date date not null,
  rental_days integer not null check (rental_days > 0),
  daily_price bigint not null check (daily_price > 0),
  total_amount bigint not null check (total_amount = daily_price * rental_days),
  payment_method text not null check (payment_method in (
    'Virtual Account',
    'QRIS',
    'E-wallet',
    'Kartu kredit / debit',
    'PayLater',
    'Bayar saat pengambilan'
  )),
  payment_bank text check (payment_bank is null or payment_bank in ('BCA', 'BNI', 'BRI', 'Mandiri')),
  payment_status text not null default 'unverified' check (payment_status in ('unverified', 'pending', 'paid', 'failed', 'expired')),
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint rental_order_dates_valid check (return_date > pickup_date),
  constraint rental_order_va_bank check (
    (payment_method = 'Virtual Account' and payment_bank is not null)
    or (payment_method <> 'Virtual Account' and payment_bank is null)
  )
);

create index if not exists rental_orders_created_at_idx on public.rental_orders (created_at desc);
create index if not exists rental_orders_customer_lookup_idx on public.rental_orders (reference, customer_phone);

alter table public.rental_orders enable row level security;
alter table public.rental_car_rates enable row level security;

drop policy if exists "Admins can read rental orders" on public.rental_orders;
create policy "Admins can read rental orders"
on public.rental_orders
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

revoke all on public.rental_orders from anon, authenticated;
grant select on public.rental_orders to authenticated;
revoke all on public.rental_car_rates from anon, authenticated;

create or replace function public.create_rental_order(
  p_customer_name text,
  p_customer_phone text,
  p_car_name text,
  p_pickup_date date,
  p_return_date date,
  p_payment_method text,
  p_payment_bank text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_daily_price bigint;
  v_rental_days integer;
  v_reference text;
  v_total bigint;
begin
  if length(trim(coalesce(p_customer_name, ''))) < 2 or length(trim(p_customer_name)) > 120 then
    raise exception 'Nama pelanggan tidak valid.';
  end if;
  if length(regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g')) < 8
     or length(regexp_replace(p_customer_phone, '[^0-9]', '', 'g')) > 16 then
    raise exception 'Nomor WhatsApp tidak valid.';
  end if;
  if p_pickup_date is null or p_return_date is null or p_return_date <= p_pickup_date then
    raise exception 'Periode sewa tidak valid.';
  end if;
  if p_pickup_date < current_date then
    raise exception 'Tanggal mulai tidak boleh di masa lalu.';
  end if;
  if p_payment_method not in ('Virtual Account', 'QRIS', 'E-wallet', 'Kartu kredit / debit', 'PayLater', 'Bayar saat pengambilan') then
    raise exception 'Metode pembayaran tidak valid.';
  end if;
  if p_payment_method = 'Virtual Account' and p_payment_bank not in ('BCA', 'BNI', 'BRI', 'Mandiri') then
    raise exception 'Bank Virtual Account tidak valid.';
  end if;
  if p_payment_method <> 'Virtual Account' then
    p_payment_bank := null;
  end if;

  select daily_price into v_daily_price
  from public.rental_car_rates
  where car_name = trim(p_car_name) and active = true;
  if v_daily_price is null then
    raise exception 'Mobil tidak tersedia.';
  end if;

  v_rental_days := p_return_date - p_pickup_date;
  if v_rental_days > 90 then
    raise exception 'Durasi rental maksimal 90 hari.';
  end if;
  v_total := v_daily_price * v_rental_days;
  v_reference := 'RR-' || upper(encode(gen_random_bytes(8), 'hex'));

  insert into public.rental_orders (
    reference, customer_name, customer_phone, car_name, pickup_date, return_date,
    rental_days, daily_price, total_amount, payment_method, payment_bank
  ) values (
    v_reference, trim(p_customer_name), trim(p_customer_phone), trim(p_car_name),
    p_pickup_date, p_return_date, v_rental_days, v_daily_price, v_total,
    p_payment_method, p_payment_bank
  );

  return jsonb_build_object(
    'reference', v_reference,
    'car_name', trim(p_car_name),
    'pickup_date', p_pickup_date,
    'return_date', p_return_date,
    'rental_days', v_rental_days,
    'daily_price', v_daily_price,
    'total_amount', v_total,
    'payment_method', p_payment_method,
    'payment_bank', p_payment_bank,
    'payment_status', 'unverified',
    'order_status', 'pending'
  );
end;
$$;

create or replace function public.lookup_rental_order(p_reference text, p_phone text)
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'reference', o.reference,
    'customer_name', o.customer_name,
    'car_name', o.car_name,
    'pickup_date', o.pickup_date,
    'return_date', o.return_date,
    'rental_days', o.rental_days,
    'daily_price', o.daily_price,
    'total_amount', o.total_amount,
    'payment_method', o.payment_method,
    'payment_bank', o.payment_bank,
    'payment_status', o.payment_status,
    'order_status', o.order_status,
    'created_at', o.created_at
  )
  from public.rental_orders o
  where upper(o.reference) = upper(trim(p_reference))
    and regexp_replace(o.customer_phone, '[^0-9]', '', 'g')
      = regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')
  limit 1;
$$;

revoke all on function public.create_rental_order(text, text, text, date, date, text, text) from public;
revoke all on function public.lookup_rental_order(text, text) from public;
grant execute on function public.create_rental_order(text, text, text, date, date, text, text) to anon, authenticated;
grant execute on function public.lookup_rental_order(text, text) to anon, authenticated;

-- After creating the admin user in Supabase Auth, promote that user from the SQL Editor:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin@example.com';
-- Sign out and sign in again so the new app_metadata role is included in the JWT.
