-- Tenant-boundary hardening: authenticated clients cannot reassign tenant/ownership keys.
revoke update (organization_id) on public.profiles from authenticated;
revoke update (organization_id, user_id) on public.customers from authenticated;
revoke update (organization_id, user_id, customer_id) on public.sales_orders from authenticated;
revoke update (organization_id) on public.products from authenticated;
revoke update (organization_id) on public.product_categories from authenticated;
revoke update (organization_id, warehouse_id, product_id) on public.inventory from authenticated;
revoke update (organization_id, warehouse_id, product_id, created_by) on public.inventory_movements from authenticated;
revoke update (organization_id) on public.warehouses from authenticated;
revoke update (organization_id) on public.suppliers from authenticated;
revoke update (organization_id, supplier_id, warehouse_id, created_by) on public.purchase_orders from authenticated;
revoke update (purchase_order_id, product_id) on public.purchase_order_items from authenticated;
revoke update (order_id, product_id) on public.sales_order_items from authenticated;
