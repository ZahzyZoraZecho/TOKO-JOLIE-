-- Public storefront catalog read access for JOLIE.
-- RLS still limits rows to active catalog records; anon receives SELECT only.
revoke all on table public.products, public.product_categories from anon;
grant usage on schema public to anon;
grant select on table public.products, public.product_categories to anon;
