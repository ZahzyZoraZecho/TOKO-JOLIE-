-- JOLIE Device Adapter Contract
alter table public.print_jobs add column if not exists adapter_code text;
alter table public.print_jobs add column if not exists output_format text not null default 'browser'
  check (output_format in ('browser','escpos','raw','json'));
alter table public.print_jobs add column if not exists external_job_ref text;

alter table public.print_jobs drop constraint if exists print_jobs_job_type_check;
alter table public.print_jobs add constraint print_jobs_job_type_check
  check (job_type in ('receipt','label','barcode','invoice','report','cash_drawer','other'));

create index if not exists print_jobs_adapter_idx on public.print_jobs(organization_id,adapter_code,status);