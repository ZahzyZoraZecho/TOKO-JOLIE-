-- JOLIE multi-application foundation
create table if not exists public.business_apps (
 id text primary key,label text not null,description text,route text not null unique,icon text,
 sort_order integer not null default 0,is_active boolean not null default true,created_at timestamptz not null default now()
);
insert into public.business_apps(id,label,description,route,icon,sort_order) values
('launcher','JOLIE Launcher','Pusat pemilihan aplikasi operasional','/business-os/','LayoutDashboard',10),
('pos','JOLIE POS','Kasir dan transaksi toko','/business-os/pos/','ShoppingCart',20),
('warehouse','JOLIE Warehouse','Stok, gudang, mutasi dan opname','/business-os/warehouse/','Boxes',30),
('sales','JOLIE Sales','Penjualan, order dan fulfillment','/business-os/sales/','ShoppingBag',40),
('procurement','JOLIE Procurement','Supplier, pembelian dan penerimaan','/business-os/procurement/','ClipboardList',50),
('finance','JOLIE Finance','Payment ledger dan keuangan','/business-os/finance/','CircleDollarSign',60),
('crm','JOLIE CRM','Pelanggan, aktivitas dan follow-up','/business-os/crm/','Users',70),
('ai','JOLIE AI','Intelligence layer lintas aplikasi','/business-os/ai/','BrainCircuit',80),
('commerce','JOLIE Commerce','Kanal e-commerce/storefront','/','Store',90),
('erp','JOLIE ERP','Command center lintas fungsi','/business-os/erp/','Database',100)
on conflict(id) do update set label=excluded.label,description=excluded.description,route=excluded.route,icon=excluded.icon,sort_order=excluded.sort_order;

create table if not exists public.crm_activities(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id) on delete cascade,
 customer_id uuid not null references public.customers(id) on delete cascade,
 activity_type text not null check(activity_type in('note','call','whatsapp','email','follow_up','sale','complaint','other')),
 subject text not null,body text,due_at timestamptz,completed_at timestamptz,created_by uuid references auth.users(id),created_at timestamptz not null default now()
);
create index if not exists crm_activities_org_customer_idx on public.crm_activities(organization_id,customer_id,created_at desc);
create index if not exists crm_activities_created_by_idx on public.crm_activities(created_by);
alter table public.crm_activities enable row level security;
revoke all on public.crm_activities from anon; grant select,insert,update on public.crm_activities to authenticated;
create policy crm_activities_staff_select on public.crm_activities for select to authenticated using((select private.jolie_has_role(organization_id,array['owner','admin','manager','crm'])));
create policy crm_activities_staff_insert on public.crm_activities for insert to authenticated with check((select private.jolie_has_role(organization_id,array['owner','admin','manager','crm'])) and created_by=(select auth.uid()));
create policy crm_activities_staff_update on public.crm_activities for update to authenticated using((select private.jolie_has_role(organization_id,array['owner','admin','manager','crm']))) with check((select private.jolie_has_role(organization_id,array['owner','admin','manager','crm'])));

create table if not exists public.finance_ledger(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id) on delete cascade,
 entry_type text not null check(entry_type in('sale','payment','expense','refund','purchase','adjustment','other')),
 direction text not null check(direction in('debit','credit')),amount numeric(18,2) not null check(amount>=0),account_code text not null,
 reference_type text,reference_id uuid,description text,metadata jsonb not null default '{}'::jsonb,created_by uuid references auth.users(id),created_at timestamptz not null default now()
);
create index if not exists finance_ledger_org_created_idx on public.finance_ledger(organization_id,created_at desc);
create index if not exists finance_ledger_reference_idx on public.finance_ledger(reference_type,reference_id);
alter table public.finance_ledger enable row level security;
revoke all on public.finance_ledger from anon; grant select,insert on public.finance_ledger to authenticated;
create policy finance_ledger_staff_select on public.finance_ledger for select to authenticated using((select private.jolie_has_role(organization_id,array['owner','admin','manager','finance'])));
create policy finance_ledger_staff_insert on public.finance_ledger for insert to authenticated with check((select private.jolie_has_role(organization_id,array['owner','admin','manager','finance'])) and created_by=(select auth.uid()));

create table if not exists public.purchase_receipts(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id) on delete cascade,
 purchase_order_id uuid not null references public.purchase_orders(id) on delete restrict,warehouse_id uuid not null references public.warehouses(id) on delete restrict,
 received_by uuid not null references auth.users(id),received_at timestamptz not null default now(),note text,idempotency_key text,created_at timestamptz not null default now(),
 unique(organization_id,idempotency_key)
);
create index if not exists purchase_receipts_org_created_idx on public.purchase_receipts(organization_id,received_at desc);
alter table public.purchase_receipts enable row level security;
revoke all on public.purchase_receipts from anon; grant select,insert on public.purchase_receipts to authenticated;
create policy purchase_receipts_staff_select on public.purchase_receipts for select to authenticated using((select private.jolie_has_role(organization_id,array['owner','admin','manager','procurement','inventory'])));
create policy purchase_receipts_staff_insert on public.purchase_receipts for insert to authenticated with check((select private.jolie_has_role(organization_id,array['owner','admin','manager','procurement','inventory'])) and received_by=(select auth.uid()));

create table if not exists public.business_audit_events(
 id uuid primary key default gen_random_uuid(),organization_id uuid references public.organizations(id) on delete cascade,actor_id uuid references auth.users(id),
 application text not null,action text not null,entity_type text,entity_id uuid,severity text not null default 'info' check(severity in('info','warning','critical')),
 payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now()
);
create index if not exists business_audit_org_created_idx on public.business_audit_events(organization_id,created_at desc);
create index if not exists business_audit_entity_idx on public.business_audit_events(entity_type,entity_id);
alter table public.business_audit_events enable row level security;
revoke all on public.business_audit_events from anon; grant select,insert on public.business_audit_events to authenticated;
create policy business_audit_staff_select on public.business_audit_events for select to authenticated using((select private.jolie_has_role(organization_id,array['owner','admin','manager'])));
create policy business_audit_staff_insert on public.business_audit_events for insert to authenticated with check((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','inventory','procurement','finance','crm'])) and actor_id=(select auth.uid()));

create index if not exists payment_transactions_created_by_idx on public.payment_transactions(created_by);
create index if not exists pos_cash_sessions_opened_by_idx on public.pos_cash_sessions(opened_by);
create index if not exists pos_cash_sessions_closed_by_idx on public.pos_cash_sessions(closed_by);

drop policy if exists payment_transactions_staff_insert on public.payment_transactions;
create policy payment_transactions_staff_insert on public.payment_transactions for insert to authenticated with check((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales','finance'])) and created_by=(select auth.uid()));
drop policy if exists pos_cash_sessions_staff_insert on public.pos_cash_sessions;
create policy pos_cash_sessions_staff_insert on public.pos_cash_sessions for insert to authenticated with check((select private.jolie_has_role(organization_id,array['owner','admin','manager','sales'])) and opened_by=(select auth.uid()));

drop function if exists public.jolie_inventory_adjust(uuid,uuid,numeric,text,text,text,uuid);
create function public.jolie_inventory_adjust(p_product_id uuid,p_warehouse_id uuid,p_quantity_delta numeric,p_movement_type text default 'adjustment',p_note text default null,p_reference_type text default null,p_reference_id uuid default null)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_org uuid;v_row public.inventory%rowtype;v_product public.products%rowtype;v_user uuid:=(select auth.uid());
begin
 if v_user is null then raise exception 'AUTH_REQUIRED';end if;
 select organization_id into v_org from public.organizations where slug='jolie-toko-pakan-jolie-gebang' limit 1;
 if v_org is null or not private.jolie_has_role(v_org,array['owner','admin','manager','inventory']) then raise exception 'INVENTORY_ACCESS_DENIED';end if;
 select * into v_product from public.products where id=p_product_id and organization_id=v_org and is_active=true for update;
 if not found then raise exception 'PRODUCT_NOT_FOUND';end if;
 if not exists(select 1 from public.warehouses where id=p_warehouse_id and organization_id=v_org and is_active=true) then raise exception 'WAREHOUSE_NOT_FOUND';end if;
 insert into public.inventory(organization_id,warehouse_id,product_id,quantity,reserved_quantity,reorder_point) values(v_org,p_warehouse_id,p_product_id,0,0,v_product.min_stock_qty) on conflict(organization_id,warehouse_id,product_id) do nothing;
 select * into v_row from public.inventory where organization_id=v_org and warehouse_id=p_warehouse_id and product_id=p_product_id for update;
 if v_row.quantity+p_quantity_delta<0 then raise exception 'INSUFFICIENT_STOCK';end if;
 update public.inventory set quantity=quantity+p_quantity_delta,updated_at=now() where id=v_row.id;
 update public.products set stock_qty=greatest(0,stock_qty+p_quantity_delta),updated_at=now() where id=p_product_id;
 insert into public.inventory_movements(organization_id,warehouse_id,product_id,movement_type,quantity_delta,reference_type,reference_id,note,created_by) values(v_org,p_warehouse_id,p_product_id,p_movement_type,p_quantity_delta,p_reference_type,p_reference_id,p_note,v_user);
 insert into public.business_audit_events(organization_id,actor_id,application,action,entity_type,entity_id,payload) values(v_org,v_user,'warehouse','inventory.adjust','product',p_product_id,jsonb_build_object('warehouse_id',p_warehouse_id,'quantity_delta',p_quantity_delta,'movement_type',p_movement_type));
 return jsonb_build_object('product_id',p_product_id,'warehouse_id',p_warehouse_id,'quantity',v_row.quantity+p_quantity_delta);
end;$$;
revoke all on function public.jolie_inventory_adjust(uuid,uuid,numeric,text,text,text,uuid) from public,anon;
grant execute on function public.jolie_inventory_adjust(uuid,uuid,numeric,text,text,text,uuid) to authenticated;

drop function if exists public.jolie_crm_add_activity(uuid,text,text,text,timestamptz);
create function public.jolie_crm_add_activity(p_customer_id uuid,p_activity_type text,p_subject text,p_body text default null,p_due_at timestamptz default null)
returns public.crm_activities language plpgsql security invoker set search_path=public as $$
declare v_org uuid;v_row public.crm_activities%rowtype;v_user uuid:=(select auth.uid());
begin
 if v_user is null then raise exception 'AUTH_REQUIRED';end if;
 select organization_id into v_org from public.customers where id=p_customer_id;
 if v_org is null or not private.jolie_has_role(v_org,array['owner','admin','manager','crm']) then raise exception 'CRM_ACCESS_DENIED';end if;
 insert into public.crm_activities(organization_id,customer_id,activity_type,subject,body,due_at,created_by) values(v_org,p_customer_id,p_activity_type,p_subject,p_body,p_due_at,v_user) returning * into v_row;
 insert into public.business_audit_events(organization_id,actor_id,application,action,entity_type,entity_id,payload) values(v_org,v_user,'crm','activity.create','crm_activity',v_row.id,jsonb_build_object('customer_id',p_customer_id,'activity_type',p_activity_type));
 return v_row;
end;$$;
revoke all on function public.jolie_crm_add_activity(uuid,text,text,text,timestamptz) from public,anon;
grant execute on function public.jolie_crm_add_activity(uuid,text,text,text,timestamptz) to authenticated;

drop function if exists public.jolie_pos_create_sale(jsonb,text,numeric,uuid,text);
create function public.jolie_pos_create_sale(p_items jsonb,p_payment_method text default 'cash',p_amount numeric default null,p_customer_id uuid default null,p_idempotency_key text default null)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_org uuid;v_user uuid:=(select auth.uid());v_order public.sales_orders%rowtype;v_payment public.payment_transactions%rowtype;v_item jsonb;v_product public.products%rowtype;v_qty numeric;v_subtotal numeric:=0;v_customer_org uuid;v_warehouse uuid;
begin
 if v_user is null then raise exception 'AUTH_REQUIRED';end if;
 select id into v_org from public.organizations where slug='jolie-toko-pakan-jolie-gebang' limit 1;
 if v_org is null or not private.jolie_has_role(v_org,array['owner','admin','manager','sales']) then raise exception 'POS_ACCESS_DENIED';end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'CART_EMPTY';end if;
 if p_payment_method not in('cash','qris','bank_transfer','virtual_account','e_wallet','edc','other') then raise exception 'PAYMENT_METHOD_INVALID';end if;
 if p_customer_id is not null then select organization_id into v_customer_org from public.customers where id=p_customer_id;if v_customer_org is distinct from v_org then raise exception 'CUSTOMER_TENANT_MISMATCH';end if;end if;
 if p_idempotency_key is not null then select * into v_payment from public.payment_transactions where organization_id=v_org and idempotency_key=p_idempotency_key limit 1;if found then select * into v_order from public.sales_orders where id=v_payment.order_id;return jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'payment_id',v_payment.id,'payment_status',v_payment.status,'replayed',true);end if;end if;
 select id into v_warehouse from public.warehouses where organization_id=v_org and is_active=true order by created_at limit 1;
 for v_item in select * from jsonb_array_elements(p_items) loop
  if coalesce(v_item->>'product_id','')='' or coalesce(v_item->>'quantity','')='' then raise exception 'CART_ITEM_INVALID';end if;
  v_qty:=(v_item->>'quantity')::numeric;if v_qty<=0 then raise exception 'QUANTITY_INVALID';end if;
  select * into v_product from public.products where id=(v_item->>'product_id')::uuid and organization_id=v_org and is_active=true for update;
  if not found then raise exception 'PRODUCT_NOT_FOUND';end if;
  if v_product.price is null then raise exception 'PRODUCT_PRICE_MISSING';end if;
  if v_product.stock_qty<v_qty then raise exception using message='INSUFFICIENT_STOCK: '||v_product.name;end if;
  v_subtotal:=v_subtotal+v_product.price*v_qty;
 end loop;
 if p_amount is not null and p_amount<>v_subtotal then raise exception 'PAYMENT_AMOUNT_MISMATCH';end if;
 insert into public.sales_orders(organization_id,customer_id,user_id,order_number,status,payment_status,subtotal,shipping_fee,discount,total) values(v_org,p_customer_id,null,'POS-'||to_char(now(),'YYYYMMDDHH24MISS')||'-'||substr(gen_random_uuid()::text,1,6),case when p_payment_method='cash' then 'completed' else 'pending' end,case when p_payment_method='cash' then 'paid' else 'unpaid' end,v_subtotal,0,0,v_subtotal) returning * into v_order;
 for v_item in select * from jsonb_array_elements(p_items) loop
  v_qty:=(v_item->>'quantity')::numeric;select * into v_product from public.products where id=(v_item->>'product_id')::uuid and organization_id=v_org for update;
  insert into public.sales_order_items(order_id,product_id,product_name,quantity,unit_price,line_total) values(v_order.id,v_product.id,v_product.name,v_qty,v_product.price,v_product.price*v_qty);
  update public.products set stock_qty=stock_qty-v_qty,updated_at=now() where id=v_product.id;
  if v_warehouse is not null then
   insert into public.inventory(organization_id,warehouse_id,product_id,quantity,reserved_quantity,reorder_point) values(v_org,v_warehouse,v_product.id,0,0,v_product.min_stock_qty) on conflict(organization_id,warehouse_id,product_id) do nothing;
   update public.inventory set quantity=quantity-v_qty,updated_at=now() where organization_id=v_org and warehouse_id=v_warehouse and product_id=v_product.id;
   insert into public.inventory_movements(organization_id,warehouse_id,product_id,movement_type,quantity_delta,reference_type,reference_id,note,created_by) values(v_org,v_warehouse,v_product.id,'sale',-v_qty,'sales_order',v_order.id,'POS sale',v_user);
  end if;
 end loop;
 insert into public.payment_transactions(organization_id,order_id,method,status,amount,idempotency_key,created_by) values(v_org,v_order.id,p_payment_method,case when p_payment_method='cash' then 'paid' else 'pending' end,v_subtotal,p_idempotency_key,v_user) returning * into v_payment;
 insert into public.finance_ledger(organization_id,entry_type,direction,amount,account_code,reference_type,reference_id,description,created_by) values(v_org,'sale','credit',v_subtotal,'4000','sales_order',v_order.id,'POS sale',v_user);
 insert into public.business_audit_events(organization_id,actor_id,application,action,entity_type,entity_id,payload) values(v_org,v_user,'pos','sale.create','sales_order',v_order.id,jsonb_build_object('amount',v_subtotal,'payment_method',p_payment_method));
 return jsonb_build_object('order_id',v_order.id,'order_number',v_order.order_number,'payment_id',v_payment.id,'payment_status',v_payment.status,'total',v_subtotal,'replayed',false);
end;$$;
revoke all on function public.jolie_pos_create_sale(jsonb,text,numeric,uuid,text) from public,anon;
grant execute on function public.jolie_pos_create_sale(jsonb,text,numeric,uuid,text) to authenticated;

-- Foreign-key indexes for the shared operational tables.
create index if not exists business_audit_actor_idx on public.business_audit_events(actor_id);
create index if not exists crm_activities_customer_idx on public.crm_activities(customer_id);
create index if not exists finance_ledger_created_by_idx on public.finance_ledger(created_by);
create index if not exists purchase_receipts_po_idx on public.purchase_receipts(purchase_order_id);
create index if not exists purchase_receipts_warehouse_idx on public.purchase_receipts(warehouse_id);
create index if not exists purchase_receipts_received_by_idx on public.purchase_receipts(received_by);
alter table public.business_apps enable row level security;
revoke all on public.business_apps from anon,authenticated;
grant select on public.business_apps to authenticated;
drop policy if exists business_apps_authenticated_select on public.business_apps;
create policy business_apps_authenticated_select on public.business_apps for select to authenticated using(is_active=true);
