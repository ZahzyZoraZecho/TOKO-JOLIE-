-- Consolidate overlapping permissive policies for production RLS.
drop policy if exists "users can read own customer record" on public.customers;
drop policy if exists "staff can read organization customers" on public.customers;
create policy "customers can read own or staff can read organization" on public.customers for select to authenticated
using ((select auth.uid()) = user_id or (select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','crm'])));

drop policy if exists "users can update own customer record" on public.customers;
drop policy if exists "staff can update organization customers" on public.customers;
create policy "customers can update own or staff can update organization" on public.customers for update to authenticated
using ((select auth.uid()) = user_id or (select private.jolie_has_role(organization_id, array['owner','admin','manager','crm'])))
with check ((select auth.uid()) = user_id or (select private.jolie_has_role(organization_id, array['owner','admin','manager','crm'])));

drop policy if exists "members can read own membership" on public.organization_members;
drop policy if exists "admins can read organization memberships" on public.organization_members;
create policy "members can read own or admins can read organization memberships" on public.organization_members for select to authenticated
using ((select auth.uid()) = user_id or (select private.jolie_has_role(organization_id, array['owner','admin'])));

drop policy if exists "public can read active categories" on public.product_categories;
drop policy if exists "staff can read all categories" on public.product_categories;
create policy "catalog categories public active or staff all" on public.product_categories for select to anon, authenticated
using (is_active = true or (select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','inventory'])));

drop policy if exists "public can read active products" on public.products;
drop policy if exists "staff can read all products" on public.products;
create policy "catalog products public active or staff all" on public.products for select to anon, authenticated
using (is_active = true or (select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','inventory'])));

drop policy if exists "users can read own orders" on public.sales_orders;
drop policy if exists "staff can read organization orders" on public.sales_orders;
create policy "orders own or staff organization read" on public.sales_orders for select to authenticated
using ((select auth.uid()) = user_id or (select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','finance'])));

drop policy if exists "users can read own order items" on public.sales_order_items;
drop policy if exists "staff can read organization order items" on public.sales_order_items;
create policy "order items own or staff organization read" on public.sales_order_items for select to authenticated
using (exists (
  select 1 from public.sales_orders o
  where o.id = sales_order_items.order_id
    and (o.user_id = (select auth.uid()) or (select private.jolie_has_role(o.organization_id, array['owner','admin','manager','sales','finance'])))
));
