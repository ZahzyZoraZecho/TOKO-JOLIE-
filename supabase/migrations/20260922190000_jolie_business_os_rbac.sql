-- JOLIE Business OS RBAC baseline
-- Applied to production Supabase project through the migration API.
-- Client writes to organization_members are intentionally disabled.

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

create index if not exists organization_members_user_org_idx
  on public.organization_members(user_id, organization_id)
  where is_active = true;

create index if not exists organization_members_org_role_idx
  on public.organization_members(organization_id, role)
  where is_active = true;

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
create policy "members can read own membership" on public.organization_members
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "admins can read organization memberships" on public.organization_members;
create policy "admins can read organization memberships" on public.organization_members
for select to authenticated using ((select private.jolie_has_role(organization_id, array['owner','admin'])));

revoke insert, update, delete on public.organization_members from anon, authenticated;

-- Staff access policies are intentionally role-scoped.
-- Public catalog policies remain unchanged.
