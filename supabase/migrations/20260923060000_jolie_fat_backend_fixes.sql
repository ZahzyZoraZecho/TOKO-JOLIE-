-- FAT-discovered production fixes.
create unique index if not exists inventory_org_warehouse_product_uidx
  on public.inventory(organization_id,warehouse_id,product_id);

create or replace function private.jolie_bootstrap_owner(p_setup_code text)
returns table(organization_id uuid, organization_name text, role text, is_active boolean)
language plpgsql security definer set search_path=''
as $function$
declare v_user uuid := auth.uid(); v_org uuid; v_name text;
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 select o.id,o.name into v_org,v_name from public.organizations o
 where o.slug='jolie-toko-pakan-jolie-gebang' limit 1;
 if v_org is null then raise exception 'JOLIE organization not found'; end if;
 if exists(select 1 from public.organization_members om where om.organization_id=v_org)
 then raise exception 'Owner bootstrap is already closed'; end if;
 if not exists(select 1 from private.jolie_bootstrap_config bc where bc.id=true and bc.used_at is null and bc.setup_code_hash=extensions.crypt(p_setup_code,bc.setup_code_hash))
 then raise exception 'Invalid or already used setup code'; end if;
 insert into public.organization_members(organization_id,user_id,role,is_active) values(v_org,v_user,'owner',true);
 update private.jolie_bootstrap_config set used_at=now() where id=true;
 return query select v_org,v_name,'owner'::text,true;
end;
$function$;

create or replace function public.jolie_inventory_adjust(p_product_id uuid,p_warehouse_id uuid,p_quantity_delta numeric,p_movement_type text default 'adjustment',p_note text default null,p_reference_type text default null,p_reference_id uuid default null)
returns jsonb language plpgsql set search_path='public'
as $function$
declare v_org uuid; v_row public.inventory%rowtype; v_product public.products%rowtype; v_user uuid := auth.uid();
begin
 if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
 select o.id into v_org from public.organizations o where o.slug='jolie-toko-pakan-jolie-gebang' limit 1;
 if v_org is null or not private.jolie_has_role(v_org,array['owner','admin','manager','inventory']) then raise exception 'INVENTORY_ACCESS_DENIED'; end if;
 select * into v_product from public.products where id=p_product_id and organization_id=v_org and is_active=true for update;
 if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
 if not exists(select 1 from public.warehouses where id=p_warehouse_id and organization_id=v_org and is_active=true) then raise exception 'WAREHOUSE_NOT_FOUND'; end if;
 insert into public.inventory(organization_id,warehouse_id,product_id,quantity,reserved_quantity,reorder_point)
 values(v_org,p_warehouse_id,p_product_id,0,0,v_product.min_stock_qty)
 on conflict (organization_id,warehouse_id,product_id) do nothing;
 select * into v_row from public.inventory where organization_id=v_org and warehouse_id=p_warehouse_id and product_id=p_product_id for update;
 if v_row.quantity+p_quantity_delta<0 then raise exception 'INSUFFICIENT_STOCK'; end if;
 update public.inventory set quantity=quantity+p_quantity_delta,updated_at=now() where id=v_row.id;
 update public.products set stock_qty=greatest(0,stock_qty+p_quantity_delta),updated_at=now() where id=p_product_id;
 insert into public.inventory_movements(organization_id,warehouse_id,product_id,movement_type,quantity_delta,reference_type,reference_id,note,created_by)
 values(v_org,p_warehouse_id,p_product_id,p_movement_type,p_quantity_delta,p_reference_type,p_reference_id,p_note,v_user);
 insert into public.business_audit_events(organization_id,actor_id,application,action,entity_type,entity_id,payload)
 values(v_org,v_user,'warehouse','inventory.adjust','product',p_product_id,jsonb_build_object('warehouse_id',p_warehouse_id,'quantity_delta',p_quantity_delta,'movement_type',p_movement_type));
 return jsonb_build_object('product_id',p_product_id,'warehouse_id',p_warehouse_id,'quantity',v_row.quantity+p_quantity_delta);
end;
$function$;
