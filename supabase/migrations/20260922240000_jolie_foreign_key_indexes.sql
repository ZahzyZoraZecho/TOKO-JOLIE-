-- Performance indexes for foreign keys introduced by the Integration Hub.
create index if not exists device_registry_created_by_idx on public.device_registry(created_by);
create index if not exists ppob_transactions_created_by_idx on public.ppob_transactions(created_by);
create index if not exists print_jobs_device_idx on public.print_jobs(device_id);
create index if not exists print_jobs_requested_by_idx on public.print_jobs(requested_by);
