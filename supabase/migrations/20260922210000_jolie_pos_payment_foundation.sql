-- JOLIE POS + Payment Ledger foundation
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  order_id uuid not null references public.sales_orders(id) on delete restrict,
  method text not null check (method in ('cash','qris','bank_transfer','virtual_account','e_wallet','edc','other')),
  status text not null default 'pending' check (status in ('pending','processing','paid','failed','expired','refunded','cancelled','settled')),
  amount numeric(14,2) not null check (amount >= 0),
  provider_ref text,
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id,idempotency_key)
);

create index if not exists payment_transactions_order_idx on public.payment_transactions(order_id,created_at desc);
create index if not exists payment_transactions_org_status_idx on public.payment_transactions(organization_id,status,created_at desc);

create table if not exists public.pos_cash_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  opened_by uuid not null references auth.users(id),
  opened_at timestamptz not null default now(),
  closed_by uuid references auth.users(id),
  closed_at timestamptz,
  opening_cash numeric(14,2) not null default 0 check (opening_cash >= 0),
  closing_cash numeric(14,2) check (closing_cash >= 0),
  status text not null default 'open' check (status in ('open','closed','void')),
  note text
);

create index if not exists pos_cash_sessions_org_status_idx on public.pos_cash_sessions(organization_id,status,opened_at desc);

alter table public.payment_transactions enable row level security;
alter table public.pos_cash_sessions enable row level security;
revoke all on public.payment_transactions from anon,public;
revoke all on public.pos_cash_sessions from anon,public;
grant select,insert,update on public.payment_transactions to authenticated;
grant select,insert,update on public.pos_cash_sessions to authenticated;

drop policy if exists payment_transactions_staff_select on public.payment_transactions;
create policy payment_transactions_staff_select on public.payment_transactions for select to authenticated using (private.jolie_has_role(organization_id,array['owner','admin','manager','sales','finance']));
drop policy if exists payment_transactions_staff_insert on public.payment_transactions;
create policy payment_transactions_staff_insert on public.payment_transactions for insert to authenticated with check (private.jolie_has_role(organization_id,array['owner','admin','manager','sales','finance']) and created_by=auth.uid());

drop policy if exists pos_cash_sessions_staff_select on public.pos_cash_sessions;
create policy pos_cash_sessions_staff_select on public.pos_cash_sessions for select to authenticated using (private.jolie_has_role(organization_id,array['owner','admin','manager','sales']));
drop policy if exists pos_cash_sessions_staff_insert on public.pos_cash_sessions;
create policy pos_cash_sessions_staff_insert on public.pos_cash_sessions for insert to authenticated with check (private.jolie_has_role(organization_id,array['owner','admin','manager','sales']) and opened_by=auth.uid());
drop policy if exists pos_cash_sessions_staff_update on public.pos_cash_sessions;
create policy pos_cash_sessions_staff_update on public.pos_cash_sessions for update to authenticated using (private.jolie_has_role(organization_id,array['owner','admin','manager','sales'])) with check (private.jolie_has_role(organization_id,array['owner','admin','manager','sales']));

create or replace function public.jolie_pos_create_sale(p_items jsonb,p_payment_method text default 'cash',p_amount numeric default null,p_customer_id uuid default null,p_idempotency_key text default null)
returns table(order_id uuid,order_number text,payment_id uuid,total numeric,payment_status text)
language plpgsql security invoker set search_path='public'
as $$
declare v_uid uuid:=auth.uid(); v_org uuid; v_order public.sales_orders; v_payment public.payment_transactions; v_subtotal numeric(14,2); v_amount numeric(14,2); v_key text:=coalesce(nullif(p_idempotency_key,''),gen_random_uuid()::text);
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
 select id into v_org from public.organizations where slug='jolie-toko-pakan-jolie-gebang' limit 1;
 if v_org is null then raise exception 'ORGANIZATION_NOT_FOUND'; end if;
 if not private.jolie_has_role(v_org,array['owner','admin','manager','sales']) then raise exception 'POS_ACCESS_DENIED'; end if;
 if p_customer_id is not null and not exists(select 1 from public.customers c where c.id=p_customer_id and c.organization_id=v_org) then raise exception 'INVALID_CUSTOMER'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'EMPTY_CART'; end if;
 if p_payment_method not in ('cash','qris','bank_transfer','virtual_account','e_wallet','edc','other') then raise exception 'INVALID_PAYMENT_METHOD'; end if;
 if exists(select 1 from public.payment_transactions where organization_id=v_org and idempotency_key=v_key) then
   select pt.order_id,so.order_number,pt.id,pt.amount,pt.status into order_id,order_number,payment_id,total,payment_status
   from public.payment_transactions pt join public.sales_orders so on so.id=pt.order_id
   where pt.organization_id=v_org and pt.idempotency_key=v_key limit 1;
   return next; return;
 end if;
 with requested as (select (x->>'product_id')::uuid product_id,greatest(1,(x->>'quantity')::numeric) quantity from jsonb_array_elements(p_items) x)
 select coalesce(sum(p.price*r.quantity),0) into v_subtotal from requested r join public.products p on p.id=r.product_id
 where p.organization_id=v_org and p.is_active=true and p.price is not null;
 if v_subtotal<=0 then raise exception 'NO_VALID_PRODUCTS'; end if;
 if exists(select 1 from jsonb_array_elements(p_items) x left join public.products p on p.id=(x->>'product_id')::uuid and p.organization_id=v_org and p.is_active=true and p.price is not null where p.id is null) then raise exception 'INVALID_PRODUCT'; end if;
 v_amount:=coalesce(p_amount,v_subtotal); if v_amount<>v_subtotal then raise exception 'PAYMENT_AMOUNT_MISMATCH'; end if;
 insert into public.sales_orders(organization_id,customer_id,user_id,order_number,status,payment_status,subtotal,shipping_fee,discount,total)
 values(v_org,p_customer_id,v_uid,'POS-'||to_char(now(),'YYYYMMDDHH24MISS')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),case when p_payment_method='cash' then 'completed' else 'pending' end,case when p_payment_method='cash' then 'paid' else 'pending' end,v_subtotal,0,0,v_subtotal)
 returning * into v_order;
 insert into public.sales_order_items(order_id,product_id,product_name,quantity,unit_price,line_total)
 select v_order.id,p.id,p.name,r.quantity,p.price,p.price*r.quantity from jsonb_array_elements(p_items) x
 cross join lateral (select (x->>'product_id')::uuid product_id,greatest(1,(x->>'quantity')::numeric) quantity) r
 join public.products p on p.id=r.product_id;
 insert into public.payment_transactions(organization_id,order_id,method,status,amount,idempotency_key,created_by)
 values(v_org,v_order.id,p_payment_method,case when p_payment_method='cash' then 'paid' else 'pending' end,v_amount,v_key,v_uid)
 returning * into v_payment;
 return query select v_order.id,v_order.order_number,v_payment.id,v_order.total,v_payment.status;
end; $$;
revoke all on function public.jolie_pos_create_sale(jsonb,text,numeric,uuid,text) from public,anon;
grant execute on function public.jolie_pos_create_sale(jsonb,text,numeric,uuid,text) to authenticated;
