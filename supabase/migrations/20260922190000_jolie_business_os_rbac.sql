-- JOLIE Business OS RBAC baseline
create schema if not exists private;

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','sales','inventory','procurement','finance','crm')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_org_idx on public.organization_members(user_id, organization_id) where is_active = true;
create index if not exists organization_members_org_role_idx on public.organization_members(organization_id, role) where is_active = true;
alter table public.organization_members enable row level security;

create or replace function private.jolie_has_role(p_organization_id uuid, p_roles text[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
      and m.is_active = true
      and (m.role = any(p_roles) or m.role in ('owner','admin'))
  );
$$;

revoke execute on function private.jolie_has_role(uuid,text[]) from public;
revoke execute on function private.jolie_has_role(uuid,text[]) from anon, authenticated;

create or replace function public.jolie_my_access()
returns table (organization_id uuid, organization_name text, role text, is_active boolean)
language sql stable security invoker set search_path = ''
as $$
  select m.organization_id, o.name, m.role, m.is_active
  from public.organization_members m
  join public.organizations o on o.id = m.organization_id
  where m.user_id = (select auth.uid()) and m.is_active = true;
$$;

revoke execute on function public.jolie_my_access() from public;
revoke execute on function public.jolie_my_access() from anon;
grant execute on function public.jolie_my_access() to authenticated;

drop policy if exists "members can read own membership" on public.organization_members;
create policy "members can read own membership" on public.organization_members for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "admins can read organization memberships" on public.organization_members;
create policy "admins can read organization memberships" on public.organization_members for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin'])));

revoke insert, update, delete on public.organization_members from anon, authenticated;

drop policy if exists "staff can read all products" on public.products;
create policy "staff can read all products" on public.products for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','inventory'])));

drop policy if exists "staff can insert products" on public.products;
create policy "staff can insert products" on public.products for insert to authenticated
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));

drop policy if exists "staff can update products" on public.products;
create policy "staff can update products" on public.products for update to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])))
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));

drop policy if exists "staff can delete products" on public.products;
create policy "staff can delete products" on public.products for delete to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager'])));

drop policy if exists "staff can read all categories" on public.product_categories;
create policy "staff can read all categories" on public.product_categories for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','inventory'])));

drop policy if exists "staff can insert categories" on public.product_categories;
create policy "staff can insert categories" on public.product_categories for insert to authenticated
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));

drop policy if exists "staff can update categories" on public.product_categories;
create policy "staff can update categories" on public.product_categories for update to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])))
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));

drop policy if exists "staff can delete categories" on public.product_categories;
create policy "staff can delete categories" on public.product_categories for delete to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager'])));

drop policy if exists "staff can read organization customers" on public.customers;
create policy "staff can read organization customers" on public.customers for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','crm'])));

drop policy if exists "staff can update organization customers" on public.customers;
create policy "staff can update organization customers" on public.customers for update to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','crm'])))
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','crm'])));

drop policy if exists "staff can read organization orders" on public.sales_orders;
create policy "staff can read organization orders" on public.sales_orders for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','finance'])));

drop policy if exists "staff can update organization orders" on public.sales_orders;
create policy "staff can update organization orders" on public.sales_orders for update to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','finance'])))
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','finance'])));

drop policy if exists "staff can read organization order items" on public.sales_order_items;
create policy "staff can read organization order items" on public.sales_order_items for select to authenticated
using (exists (
  select 1 from public.sales_orders o
  where o.id = sales_order_items.order_id
    and (select private.jolie_has_role(o.organization_id, array['owner','admin','manager','sales','finance']))
));

drop policy if exists "deny internal inventory access" on public.inventory;
create policy "staff can read inventory" on public.inventory for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));
create policy "staff can insert inventory" on public.inventory for insert to authenticated
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));
create policy "staff can update inventory" on public.inventory for update to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])))
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));
create policy "staff can delete inventory" on public.inventory for delete to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager'])));

drop policy if exists "deny internal inventory movement access" on public.inventory_movements;
create policy "staff can read inventory movements" on public.inventory_movements for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));
create policy "staff can insert inventory movements" on public.inventory_movements for insert to authenticated
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory']))
  and (created_by is null or created_by = (select auth.uid())));

drop policy if exists "deny internal warehouse access" on public.warehouses;
create policy "staff can read warehouses" on public.warehouses for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));
create policy "staff can insert warehouses" on public.warehouses for insert to authenticated
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));
create policy "staff can update warehouses" on public.warehouses for update to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])))
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','inventory'])));
create policy "staff can delete warehouses" on public.warehouses for delete to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager'])));

drop policy if exists "deny internal supplier access" on public.suppliers;
create policy "staff can read suppliers" on public.suppliers for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','procurement'])));
create policy "staff can insert suppliers" on public.suppliers for insert to authenticated
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','procurement'])));
create policy "staff can update suppliers" on public.suppliers for update to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','procurement'])))
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','procurement'])));
create policy "staff can delete suppliers" on public.suppliers for delete to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager'])));

drop policy if exists "deny internal purchase order access" on public.purchase_orders;
create policy "staff can read purchase orders" on public.purchase_orders for select to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','procurement','finance'])));
create policy "staff can insert purchase orders" on public.purchase_orders for insert to authenticated
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','procurement']))
  and (created_by is null or created_by = (select auth.uid())));
create policy "staff can update purchase orders" on public.purchase_orders for update to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager','procurement'])))
with check ((select private.jolie_has_role(organization_id, array['owner','admin','manager','procurement'])));
create policy "staff can delete purchase orders" on public.purchase_orders for delete to authenticated
using ((select private.jolie_has_role(organization_id, array['owner','admin','manager'])));

drop policy if exists "deny internal purchase item access" on public.purchase_order_items;
create policy "staff can read purchase order items" on public.purchase_order_items for select to authenticated
using (exists (
  select 1 from public.purchase_orders p
  where p.id = purchase_order_items.purchase_order_id
    and (select private.jolie_has_role(p.organization_id, array['owner','admin','manager','procurement','finance']))
));
create policy "staff can insert purchase order items" on public.purchase_order_items for insert to authenticated
with check (exists (
  select 1 from public.purchase_orders p
  where p.id = purchase_order_items.purchase_order_id
    and (select private.jolie_has_role(p.organization_id, array['owner','admin','manager','procurement']))
));
create policy "staff can update purchase order items" on public.purchase_order_items for update to authenticated
using (exists (
  select 1 from public.purchase_orders p
  where p.id = purchase_order_items.purchase_order_id
    and (select private.jolie_has_role(p.organization_id, array['owner','admin','manager','procurement']))
))
with check (exists (
  select 1 from public.purchase_orders p
  where p.id = purchase_order_items.purchase_order_id
    and (select private.jolie_has_role(p.organization_id, array['owner','admin','manager','procurement']))
));
create policy "staff can delete purchase order items" on public.purchase_order_items for delete to authenticated
using (exists (
  select 1 from public.purchase_orders p
  where p.id = purchase_order_items.purchase_order_id
    and (select private.jolie_has_role(p.organization_id, array['owner','admin','manager']))
));

comment on table public.organization_members is 'JOLIE Business OS organization membership and application role assignments. Client writes are intentionally disabled.';
