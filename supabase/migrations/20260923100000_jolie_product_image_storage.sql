-- JOLIE product image storage.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('jolie-product-images','jolie-product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "jolie product images public read" on storage.objects;
create policy "jolie product images public read" on storage.objects for select to public using (bucket_id='jolie-product-images');
drop policy if exists "jolie product images staff insert" on storage.objects;
create policy "jolie product images staff insert" on storage.objects for insert to authenticated with check (bucket_id='jolie-product-images');
drop policy if exists "jolie product images staff update" on storage.objects;
create policy "jolie product images staff update" on storage.objects for update to authenticated using (bucket_id='jolie-product-images') with check (bucket_id='jolie-product-images');
drop policy if exists "jolie product images staff delete" on storage.objects;
create policy "jolie product images staff delete" on storage.objects for delete to authenticated using (bucket_id='jolie-product-images');