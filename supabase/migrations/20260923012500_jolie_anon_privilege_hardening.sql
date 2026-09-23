-- JOLIE security hardening: remove unnecessary Data API table privileges from anonymous clients.
-- Public storefront access remains available through the explicit RLS policies on
-- organizations and products; internal Business OS tables remain authenticated-only.

revoke all on table
  public.organization_members,
  public.profiles,
  public.inventory,
  public.inventory_movements,
  public.sales_orders,
  public.sales_order_items,
  public.payment_transactions,
  public.finance_ledger,
  public.crm_activities,
  public.print_jobs,
  public.device_registry,
  public.payment_provider_adapters,
  public.ppob_transactions
from anon;
