-- JOLIE Integration Hub: hardware, printing, payments and digital services foundation
alter table public.products
  add column if not exists product_type text not null default 'physical'
    check (product_type in ('physical','digital','service')),
  add column if not exists barcode_value text;

create unique index if not exists products_org_barcode_uidx
  on public.products(organization_id, barcode_value)
  where barcode_value is not null;

create table if not exists public.device_registry (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  device_code text not null, name text not null,
  device_type text not null check (device_type in ('barcode_scanner','barcode_printer','thermal_printer','label_printer','cash_drawer','edc','customer_display','other')),
  connection_type text not null default 'browser' check (connection_type in ('browser','usb','bluetooth','network','serial','local_agent','api','other')),
  location text,
  status text not null default 'offline' check (status in ('offline','online','ready','busy','error','disabled')),
  capabilities jsonb not null default '{}'::jsonb, settings jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz, created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id, device_code)
);
create index if not exists device_registry_org_type_idx on public.device_registry(organization_id,device_type,status);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  device_id uuid references public.device_registry(id) on delete set null,
  job_type text not null check (job_type in ('receipt','label','barcode','invoice','report','other')),
  reference_type text, reference_id uuid, payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','processing','printed','failed','cancelled')),
  attempts integer not null default 0 check (attempts >= 0), error_message text,
  requested_by uuid references auth.users(id), printed_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists print_jobs_org_created_idx on public.print_jobs(organization_id,created_at desc);
create index if not exists print_jobs_status_idx on public.print_jobs(organization_id,status);

create table if not exists public.payment_provider_adapters (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  provider_code text not null, provider_name text not null,
  method text not null check (method in ('qris','bank_transfer','virtual_account','e_wallet','edc','other')),
  mode text not null default 'manual' check (mode in ('manual','api','local_agent','sdk')),
  is_enabled boolean not null default false, capabilities jsonb not null default '{}'::jsonb,
  public_config jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique(organization_id,provider_code,method)
);
create index if not exists payment_provider_adapters_org_method_idx on public.payment_provider_adapters(organization_id,method,is_enabled);

create table if not exists public.ppob_transactions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  service_type text not null check (service_type in ('pulsa','data','pln_token','pln_postpaid','ewallet_topup','voucher_digital','other')),
  provider_code text not null, customer_reference text not null, product_code text,
  selling_price numeric(18,2) not null check (selling_price >= 0), provider_cost numeric(18,2) check (provider_cost is null or provider_cost >= 0),
  fee numeric(18,2) not null default 0 check (fee >= 0),
  status text not null default 'pending' check (status in ('pending','processing','success','failed','expired','refunded','cancelled')),
  provider_reference text, idempotency_key text not null, metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(organization_id,idempotency_key)
);
create index if not exists ppob_org_created_idx on public.ppob_transactions(organization_id,created_at desc);
create index if not exists ppob_status_idx on public.ppob_transactions(organization_id,status);

alter table public.device_registry enable row level security;
alter table public.print_jobs enable row level security;
alter table public.payment_provider_adapters enable row level security;
alter table public.ppob_transactions enable row level security;

revoke all on public.device_registry,public.print_jobs,public.payment_provider_adapters,public.ppob_transactions from anon;
grant select,insert,update,delete on public.device_registry to authenticated;
grant select,insert,update on public.print_jobs,public.payment_provider_adapters,public.ppob_transactions to authenticated;

create policy device_registry_staff_select on public.device_registry for select to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','inventory','procurement','finance'])));
create policy device_registry_staff_insert on public.device_registry for insert to authenticated with check ((select private.jolie_has_role(organization_id,array['owner','admin','manager'])) and created_by=(select auth.uid()));
create policy device_registry_staff_update on public.device_registry for update to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager']))) with check ((select private.jolie_has_role(organization_id,array['owner','admin','manager'])));
create policy device_registry_staff_delete on public.device_registry for delete to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager'])));

create policy print_jobs_staff_select on public.print_jobs for select to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','inventory','procurement','finance'])));
create policy print_jobs_staff_insert on public.print_jobs for insert to authenticated with check ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','inventory','procurement','finance'])) and requested_by=(select auth.uid()));
create policy print_jobs_staff_update on public.print_jobs for update to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','inventory','procurement','finance']))) with check ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','inventory','procurement','finance'])));

create policy payment_adapters_staff_select on public.payment_provider_adapters for select to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager','finance'])));
create policy payment_adapters_staff_insert on public.payment_provider_adapters for insert to authenticated with check ((select private.jolie_has_role(organization_id,array['owner','admin','manager','finance'])));
create policy payment_adapters_staff_update on public.payment_provider_adapters for update to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager','finance']))) with check ((select private.jolie_has_role(organization_id,array['owner','admin','manager','finance'])));

create policy ppob_staff_select on public.ppob_transactions for select to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','finance'])));
create policy ppob_staff_insert on public.ppob_transactions for insert to authenticated with check ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','finance'])) and created_by=(select auth.uid()));
create policy ppob_staff_update on public.ppob_transactions for update to authenticated using ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','finance']))) with check ((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','finance'])));
