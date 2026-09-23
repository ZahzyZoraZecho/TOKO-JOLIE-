-- Separate anonymous storefront policy from authenticated staff policy.
-- Anonymous catalog reads never invoke the private role helper.
drop policy if exists "catalog products public active or staff all" on public.products;
create policy "catalog products public active" on public.products for select to anon using (is_active = true);
create policy "catalog products staff all" on public.products for select to authenticated using (
  is_active = true or (select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','inventory']))
);
drop policy if exists "catalog categories public active or staff all" on public.product_categories;
create policy "catalog categories public active" on public.product_categories for select to anon using (is_active = true);
create policy "catalog categories staff all" on public.product_categories for select to authenticated using (
  is_active = true or (select private.jolie_has_role(organization_id, array['owner','admin','manager','sales','inventory']))
);
