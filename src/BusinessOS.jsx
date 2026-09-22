import React from "react";
import {
  ArrowLeft, BarChart3, Boxes, BrainCircuit, CircleDollarSign, ClipboardList,
  Database, LayoutDashboard, PackageCheck, RefreshCw, ShoppingBag, ShieldCheck,
  Truck, Users, WalletCards, AlertTriangle, CheckCircle2, LockKeyhole
} from "lucide-react";
import { supabase } from "./lib/supabase";

const ORG_SLUG = "jolie-toko-pakan-jolie-gebang";

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function shortDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric"
  }).format(new Date(value));
}

function statusLabel(value) {
  return String(value || "unknown").replaceAll("_", " ").replace(/^./, x => x.toUpperCase());
}

const modules = [
  { id: "overview", label: "Command Center", icon: LayoutDashboard },
  { id: "sales", label: "Penjualan", icon: ShoppingBag },
  { id: "inventory", label: "Stok & Gudang", icon: Boxes },
  { id: "procurement", label: "Pembelian", icon: ClipboardList },
  { id: "finance", label: "Keuangan", icon: CircleDollarSign },
  { id: "crm", label: "CRM", icon: Users },
  { id: "ai", label: "AI Business", icon: BrainCircuit }
];

export default function BusinessOS({ user, onBack }) {
  const [active, setActive] = React.useState("overview");
  const [access, setAccess] = React.useState(null);
  const [accessLoading, setAccessLoading] = React.useState(true);
  const [org, setOrg] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);
  const [inventory, setInventory] = React.useState([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [errors, setErrors] = React.useState([]);
  const [lastSync, setLastSync] = React.useState(null);

  const loadData = React.useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    setRefreshing(true);
    setAccessLoading(true);
    const nextErrors = [];

    const { data: accessRows, error: accessError } = await supabase.rpc("jolie_my_access");
    const myAccess = accessRows?.[0] || null;
    if (accessError || !myAccess) {
      setAccess(null);
      setOrg(null);
      setProducts([]); setOrders([]); setCustomers([]); setInventory([]); setPurchaseOrders([]);
      nextErrors.push("Akun ini belum memiliki role staff JOLIE Business OS.");
      setErrors(nextErrors);
      setLoading(false);
      setRefreshing(false);
      setAccessLoading(false);
      return;
    }

    setAccess(myAccess);
    const organization = { id: myAccess.organization_id, name: myAccess.organization_name, slug: ORG_SLUG };
    setOrg(organization);

    const [
      productsResult,
      ordersResult,
      customersResult,
      inventoryResult,
      purchaseResult
    ] = await Promise.all([
      supabase.from("products")
        .select("id,name,unit,price,stock_qty,is_active,category_id")
        .eq("organization_id", organization.id)
        .order("name"),
      supabase.from("sales_orders")
        .select("id,order_number,status,payment_status,total,created_at,user_id")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("customers")
        .select("id,name,email,phone,created_at")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("inventory")
        .select("id,warehouse_id,product_id,quantity,reserved_quantity,reorder_point")
        .order("updated_at", { ascending: false })
        .limit(200),
      supabase.from("purchase_orders")
        .select("id,po_number,status,total,created_at")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(50)
    ]);

    if (productsResult.error) nextErrors.push("Katalog: " + productsResult.error.message);
    if (ordersResult.error) nextErrors.push("Penjualan: " + ordersResult.error.message);
    if (customersResult.error) nextErrors.push("CRM: " + customersResult.error.message);
    if (inventoryResult.error) nextErrors.push("Stok internal: akses role bisnis belum tersedia.");
    if (purchaseResult.error) nextErrors.push("Pembelian internal: akses role bisnis belum tersedia.");

    setProducts(productsResult.data || []);
    setOrders(ordersResult.data || []);
    setCustomers(customersResult.data || []);
    setInventory(inventoryResult.data || []);
    setPurchaseOrders(purchaseResult.data || []);
    setErrors(nextErrors);
    setLastSync(new Date());
    setLoading(false);
    setRefreshing(false);
    setAccessLoading(false);
  }, [user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const paidOrders = orders.filter(o => String(o.payment_status || "").toLowerCase() === "paid");
  const pendingOrders = orders.filter(o => !["completed", "cancelled", "delivered"].includes(String(o.status || "").toLowerCase()));
  const salesTotal = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const paidTotal = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const outOfStock = products.filter(p => p.is_active && Number(p.stock_qty) <= 0).length;
  const stockTracked = products.filter(p => p.stock_qty !== null && p.stock_qty !== undefined).length;
  const role = access?.role || null;
  const inventoryAccess = ["owner","admin","manager","inventory"].includes(role);
  const procurementAccess = ["owner","admin","manager","procurement","finance"].includes(role);
  const visibleModules = modules.filter(m => {
    if (!role) return false;
    if (["owner","admin","manager"].includes(role)) return true;
    if (role === "sales") return ["overview","sales","ai"].includes(m.id);
    if (role === "inventory") return ["overview","inventory","ai"].includes(m.id);
    if (role === "procurement") return ["overview","procurement","ai"].includes(m.id);
    if (role === "finance") return ["overview","sales","finance","ai"].includes(m.id);
    if (role === "crm") return ["overview","crm","ai"].includes(m.id);
    return m.id === "overview";
  });
  const dataCoverage = [
    products.length > 0,
    orders.length > 0,
    inventoryAccess,
    procurementAccess
  ].filter(Boolean).length;

  const moduleStats = {
    overview: { title: "Command Center", subtitle: "Pusat kendali operasional JOLIE" },
    sales: { title: "Penjualan & Pesanan", subtitle: "Alur order yang dapat dibaca akun ini" },
    inventory: { title: "Stok & Gudang", subtitle: "Kontrol katalog dan ledger persediaan" },
    procurement: { title: "Pembelian & Supplier", subtitle: "Purchase order dan pengadaan" },
    finance: { title: "Keuangan", subtitle: "Ringkasan nilai transaksi yang tersedia" },
    crm: { title: "CRM", subtitle: "Pelanggan dan relasi komersial" },
    ai: { title: "AI Business Advisor", subtitle: "Insight berbasis data yang benar-benar tersedia" }
  };

  if (!user || accessLoading || !access) {
    return <div className="bos-shell"><div className="bos-gate"><LockKeyhole size={42}/><h1>JOLIE Business OS</h1><p>{accessLoading ? "Memverifikasi role dan izin bisnis…" : "Akun ini belum terdaftar sebagai staff JOLIE. Data operasional tidak dibuka hanya karena seseorang sudah login."}</p><button onClick={onBack}>Kembali ke JOLIE</button></div></div>;
  }

  return <div className="bos-shell">
    <style>{`
      .bos-shell{min-height:100vh;background:#f4f8f6;color:#102c24;font-family:Inter,system-ui,sans-serif}
      .bos-top{height:72px;background:#fff;border-bottom:1px solid #dce7e1;display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:20}
      .bos-brand{display:flex;align-items:center;gap:11px}.bos-brand-mark{width:42px;height:42px;border-radius:12px;background:#08764d;color:#fff;display:grid;place-items:center;font-size:22px}
      .bos-brand b{font-size:18px}.bos-brand span{display:block;font-size:10px;color:#70867d;margin-top:3px}
      .bos-top-actions{display:flex;gap:8px}.bos-top-actions button,.bos-refresh{border:1px solid #d9e5df;background:#fff;color:#31574a;border-radius:9px;padding:9px 12px;display:flex;gap:7px;align-items:center;font-weight:700;font-size:11px}
      .bos-refresh{background:#08764d;color:#fff;border-color:#08764d}.bos-refresh:disabled{opacity:.65}
      .bos-layout{display:grid;grid-template-columns:225px 1fr;min-height:calc(100vh - 72px)}
      .bos-sidebar{background:#082f23;padding:18px 12px}.bos-side-label{color:#7fa695;font-size:9px;font-weight:800;letter-spacing:.12em;padding:8px 11px}
      .bos-module{width:100%;border:0;background:transparent;color:#c9ddd5;text-align:left;border-radius:9px;padding:11px;display:flex;align-items:center;gap:9px;font-size:11px;font-weight:700;margin:2px 0}.bos-module:hover{background:#104936}.bos-module.active{background:#0f6e4a;color:#fff}
      .bos-side-status{margin-top:18px;background:#0e4535;border:1px solid #21634e;border-radius:12px;padding:12px;color:#b9d5ca;font-size:9px;line-height:1.5}.bos-side-status b{display:block;color:#fff;margin-bottom:5px}
      .bos-main{padding:22px;min-width:0}.bos-head{display:flex;justify-content:space-between;gap:15px;align-items:flex-end;margin-bottom:18px}.bos-head h1{font-size:25px;margin:0 0 4px;letter-spacing:-.7px}.bos-head p{margin:0;color:#6d8179;font-size:11px}
      .bos-live{display:flex;align-items:center;gap:7px;font-size:9px;color:#587168;background:#fff;border:1px solid #dce7e1;border-radius:30px;padding:8px 11px}.bos-dot{width:7px;height:7px;border-radius:50%;background:#159b65}
      .bos-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}.bos-kpi{background:#fff;border:1px solid #dce7e1;border-radius:13px;padding:15px}.bos-kpi-top{display:flex;justify-content:space-between;align-items:center;color:#6e827a;font-size:9px}.bos-kpi-icon{width:31px;height:31px;border-radius:9px;background:#edf7f2;color:#08764d;display:grid;place-items:center}.bos-kpi strong{display:block;font-size:21px;margin-top:11px;letter-spacing:-.5px}.bos-kpi small{display:block;color:#82938d;font-size:8px;margin-top:5px}
      .bos-grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(260px,.8fr);gap:12px;margin-top:12px}.bos-panel{background:#fff;border:1px solid #dce7e1;border-radius:13px;padding:15px;min-width:0}.bos-panel h2{font-size:13px;margin:0}.bos-panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.bos-panel-head span{font-size:8px;color:#82938d}
      .bos-flow{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.bos-flow-item{background:#f4f8f6;border-radius:10px;padding:12px 8px;text-align:center}.bos-flow-item svg{color:#08764d}.bos-flow-item b{display:block;font-size:9px;margin-top:7px}.bos-flow-item span{font-size:7px;color:#788b84;display:block;margin-top:4px}
      .bos-table{width:100%;border-collapse:collapse}.bos-table th,.bos-table td{text-align:left;border-bottom:1px solid #eef2f0;padding:9px 5px;font-size:9px}.bos-table th{font-size:8px;color:#80918b;font-weight:800}.bos-table td strong{font-size:9px}.bos-status{display:inline-flex;border-radius:20px;padding:4px 7px;background:#edf7f2;color:#2f6853;font-size:7px;font-weight:800}.bos-status.warn{background:#fff4df;color:#8a641b}.bos-status.danger{background:#fdeceb;color:#9a3f38}
      .bos-alert{display:flex;gap:9px;padding:10px;border-radius:9px;background:#fff7e9;color:#75551a;font-size:9px;line-height:1.45;margin-top:8px}.bos-alert svg{flex:none}.bos-success{background:#edf8f2;color:#3c6756}.bos-muted{padding:25px;text-align:center;color:#7a8b85;font-size:10px;background:#f7faf8;border:1px dashed #cfddd7;border-radius:10px}
      .bos-module-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.bos-module-card{border:1px solid #dce7e1;background:#fff;border-radius:12px;padding:14px;text-align:left}.bos-module-card svg{color:#08764d}.bos-module-card b{display:block;font-size:11px;margin-top:8px}.bos-module-card span{display:block;font-size:8px;color:#71837c;line-height:1.5;margin-top:4px}.bos-module-card button{margin-top:10px;border:0;background:#edf7f2;color:#08764d;border-radius:7px;padding:7px 9px;font-size:8px;font-weight:800}
      .bos-error{margin-top:12px;background:#fff1ef;border:1px solid #f0d1cb;border-radius:10px;padding:11px;color:#8a5149;font-size:9px}.bos-error b{display:block;margin-bottom:5px}.bos-error span{display:block;margin-top:3px}
      .bos-gate{min-height:100vh;display:grid;place-items:center;text-align:center;padding:30px}.bos-gate>div{max-width:450px}.bos-gate svg{color:#08764d}.bos-gate h1{font-size:28px}.bos-gate p{color:#6d8179;line-height:1.6;font-size:12px}.bos-gate button{border:0;background:#08764d;color:#fff;border-radius:9px;padding:11px 17px;font-weight:800}
      .bos-ai{background:linear-gradient(135deg,#073f2d,#0c6e4a);color:#fff;border-radius:13px;padding:18px}.bos-ai p{font-size:10px;line-height:1.6;color:#c9e2d7}.bos-ai b{font-size:12px}.bos-ai-list{display:grid;gap:7px;margin-top:12px}.bos-ai-list div{background:#ffffff14;border:1px solid #ffffff1f;border-radius:8px;padding:9px;font-size:9px;line-height:1.45}
      @media(max-width:1050px){.bos-layout{grid-template-columns:75px 1fr}.bos-sidebar{padding:15px 8px}.bos-side-label,.bos-module span,.bos-side-status{display:none}.bos-module{justify-content:center}.bos-kpis{grid-template-columns:repeat(2,1fr)}.bos-grid{grid-template-columns:1fr}}
      @media(max-width:650px){.bos-top{padding:0 12px}.bos-top-actions button span{display:none}.bos-main{padding:12px}.bos-kpis{grid-template-columns:1fr 1fr}.bos-module-grid{grid-template-columns:1fr}.bos-flow{grid-template-columns:1fr 1fr}.bos-head{align-items:flex-start;flex-direction:column}.bos-live{align-self:flex-start}.bos-table{min-width:600px}.bos-panel{overflow:auto}}
    `}</style>

    <header className="bos-top">
      <div className="bos-brand"><div className="bos-brand-mark">J</div><div><b>JOLIE Business OS</b><span>{org?.name || "Business Operating System"} · {role}</span></div></div>
      <div className="bos-top-actions"><button onClick={onBack}><ArrowLeft size={15}/><span>Kembali ke Storefront</span></button><button className="bos-refresh" onClick={loadData} disabled={refreshing}><RefreshCw size={15} className={refreshing ? "bos-spin" : ""}/><span>Refresh Data</span></button></div>
    </header>

    <div className="bos-layout">
      <aside className="bos-sidebar">
        <div className="bos-side-label">OPERATING SYSTEM</div>
        {visibleModules.map(m => { const Icon=m.icon; return <button key={m.id} className={"bos-module "+(active===m.id?"active":"")} onClick={()=>setActive(m.id)}><Icon size={17}/><span>{m.label}</span></button>; })}
        <div className="bos-side-status"><b>Data Guard</b>Business OS hanya membaca data yang diizinkan Supabase. Modul internal tidak membuka data melalui bypass.</div>
      </aside>

      <main className="bos-main">
        <div className="bos-head"><div><h1>{moduleStats[active].title}</h1><p>{moduleStats[active].subtitle}</p></div><div className="bos-live"><span className="bos-dot"/>{lastSync ? "Sinkron "+lastSync.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}) : "Menunggu sinkronisasi"}</div></div>

        {loading ? <div className="bos-muted">Memuat data operasional JOLIE…</div> : <>
          {active==="overview" && <Overview
            products={products} orders={orders} salesTotal={salesTotal} paidTotal={paidTotal}
            paidOrders={paidOrders} pendingOrders={pendingOrders} outOfStock={outOfStock}
            stockTracked={stockTracked} inventoryAccess={inventoryAccess} procurementAccess={procurementAccess}
            customers={customers} onOpen={setActive}
          />}

          {active==="sales" && <Sales orders={orders}/>}
          {active==="inventory" && <Inventory products={products} inventory={inventory} access={inventoryAccess}/>}
          {active==="procurement" && <Procurement purchaseOrders={purchaseOrders} access={procurementAccess}/>}
          {active==="finance" && <Finance orders={orders} salesTotal={salesTotal} paidTotal={paidTotal}/>}
          {active==="crm" && <CRM customers={customers}/>}
          {active==="ai" && <AIAdvisor products={products} orders={orders} inventoryAccess={inventoryAccess} procurementAccess={procurementAccess}/>}
        </>}

        {errors.length > 0 && <div className="bos-error"><b>Data access & status</b>{errors.map((e,i)=><span key={i}>• {e}</span>)}</div>}
      </main>
    </div>
  </div>;
}

function Overview({ products, orders, salesTotal, paidTotal, paidOrders, pendingOrders, outOfStock, stockTracked, inventoryAccess, procurementAccess, customers, onOpen }) {
  return <>
    <div className="bos-kpis">
      <Kpi icon={CircleDollarSign} label="Nilai pesanan terbaca" value={rupiah(salesTotal)} note={orders.length+" order terbaca"}/>
      <Kpi icon={WalletCards} label="Pesanan berstatus paid" value={rupiah(paidTotal)} note={paidOrders.length+" order paid"}/>
      <Kpi icon={ShoppingBag} label="Order perlu dipantau" value={pendingOrders.length} note="Berdasarkan status order yang terbaca"/>
      <Kpi icon={Boxes} label="Produk aktif" value={products.filter(p=>p.is_active).length} note={stockTracked+" produk memiliki stock_qty"}/>
    </div>

    <div className="bos-grid">
      <section className="bos-panel"><div className="bos-panel-head"><h2>Alur operasi JOLIE</h2><span>Commerce → Operations</span></div>
        <div className="bos-flow">
          {[[ShoppingBag,"Pesanan","Order masuk"],[PackageCheck,"Fulfillment","Siapkan"],[Boxes,"Stok","Kontrol"],[Truck,"Delivery","Kirim"],[BarChart3,"Insight","Putuskan"]].map(([Icon,title,desc])=><div className="bos-flow-item" key={title}><Icon size={19}/><b>{title}</b><span>{desc}</span></div>)}
        </div>
        {!inventoryAccess && <div className="bos-alert"><ShieldCheck size={16}/>Ledger stok internal masih dilindungi RLS. Dashboard tidak akan mengarang angka stok gudang.</div>}
      </section>

      <section className="bos-panel"><div className="bos-panel-head"><h2>Health bisnis</h2><span>Data coverage</span></div>
        <HealthRow label="Katalog produk" ok={products.length>0} text={products.length+" produk"}/>
        <HealthRow label="Pesanan" ok={orders.length>0} text={orders.length+" order terbaca"}/>
        <HealthRow label="Stok ledger" ok={inventoryAccess} text={inventoryAccess?"Terhubung":"Role belum dibuka"}/>
        <HealthRow label="Pembelian" ok={procurementAccess} text={procurementAccess?"Terhubung":"Role belum dibuka"}/>
        <HealthRow label="CRM" ok={customers.length>0} text={customers.length+" pelanggan terbaca"}/>
      </section>
    </div>

    <div className="bos-grid">
      <section className="bos-panel"><div className="bos-panel-head"><h2>Pesanan terbaru</h2><button className="bos-refresh" onClick={()=>onOpen("sales")}>Buka Penjualan</button></div>
        {orders.length ? <OrderTable orders={orders.slice(0,7)}/> : <div className="bos-muted">Belum ada order yang dapat dibaca akun ini.</div>}
      </section>
      <section className="bos-panel"><div className="bos-panel-head"><h2>Perhatian</h2></div>
        {outOfStock>0 && <div className="bos-alert"><AlertTriangle size={16}/>{outOfStock} produk memiliki stock_qty 0 atau di bawahnya.</div>}
        {!inventoryAccess && <div className="bos-alert"><LockKeyhole size={16}/>Akses inventory/procurement menunggu fondasi role & organization membership.</div>}
        {outOfStock===0 && inventoryAccess && procurementAccess && <div className="bos-alert bos-success"><CheckCircle2 size={16}/>Tidak ada alert kritis dari data yang terbaca saat ini.</div>}
      </section>
    </div>

    <section className="bos-panel" style={{marginTop:12}}><div className="bos-panel-head"><h2>Modul JOLIE Business OS</h2><span>Foundation v1</span></div>
      <div className="bos-module-grid">
        {visibleModules.filter(m=>m.id!=="overview").map(m=>{const Icon=m.icon;return <div className="bos-module-card" key={m.id}><Icon size={20}/><b>{m.label}</b><span>{m.id==="sales"?"Order, pembayaran, fulfillment dan histori.":m.id==="inventory"?"Gudang, stock ledger, opname dan reorder.":m.id==="procurement"?"Supplier, PO, penerimaan dan biaya pembelian.":m.id==="finance"?"Cashflow, margin, rekonsiliasi dan laporan.":m.id==="crm"?"Pelanggan, loyalty, segmentasi dan komunikasi.":"Insight, anomaly detection dan rekomendasi berbasis data."}</span><button onClick={()=>onOpen(m.id)}>Buka Modul</button></div>})}
      </div>
    </section>
  </>;
}

function Kpi({icon:Icon,label,value,note}){return <div className="bos-kpi"><div className="bos-kpi-top"><span>{label}</span><span className="bos-kpi-icon"><Icon size={16}/></span></div><strong>{value}</strong><small>{note}</small></div>}

function HealthRow({label,ok,text}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #eef2f0",fontSize:9}}><span>{label}</span><span className={"bos-status "+(ok?"":"warn")}>{ok?"Connected":"Protected"} · {text}</span></div>}

function OrderTable({orders}){return <div style={{overflowX:"auto"}}><table className="bos-table"><thead><tr><th>Order</th><th>Status</th><th>Pembayaran</th><th>Total</th><th>Tanggal</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><strong>{o.order_number||o.id.slice(0,8)}</strong></td><td><span className="bos-status">{statusLabel(o.status)}</span></td><td><span className={"bos-status "+(String(o.payment_status||"").toLowerCase()==="paid"?"":"warn")}>{statusLabel(o.payment_status)}</span></td><td>{rupiah(o.total)}</td><td>{shortDate(o.created_at)}</td></tr>)}</tbody></table></div>}

function Sales({orders}){return <section className="bos-panel"><div className="bos-panel-head"><h2>50 order terbaru yang dapat dibaca akun</h2><span>{orders.length} record</span></div>{orders.length?<OrderTable orders={orders}/>:<div className="bos-muted">Belum ada order yang dapat dibaca. Untuk dashboard owner, role organisasi perlu dikonfigurasi.</div>}</section>}

function Inventory({products,inventory,access}){return <section className="bos-panel"><div className="bos-panel-head"><h2>Produk & stok</h2><span>{access?"Ledger inventory aktif":"Mode protected"}</span></div>{products.length?<div style={{overflowX:"auto"}}><table className="bos-table"><thead><tr><th>Produk</th><th>Satuan</th><th>Harga</th><th>stock_qty</th><th>Status</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.unit||"—"}</td><td>{p.price==null?"Via toko":rupiah(p.price)}</td><td>{p.stock_qty==null?"—":p.stock_qty}</td><td><span className={"bos-status "+(Number(p.stock_qty)<=0?"danger":"")}>{p.stock_qty==null?"Tidak dilacak":Number(p.stock_qty)<=0?"Habis":"Tersedia"}</span></td></tr>)}</tbody></table></div>:<div className="bos-muted">Belum ada produk aktif.</div>}{!access&&<div className="bos-alert"><LockKeyhole size={16}/>Warehouse, inventory ledger, reserved quantity dan reorder point tetap dilindungi RLS sampai role bisnis diberikan.</div>}</section>}

function Procurement({purchaseOrders,access}){return <section className="bos-panel"><div className="bos-panel-head"><h2>Purchase Order</h2><span>{access?purchaseOrders.length+" PO":"Protected"}</span></div>{access&&purchaseOrders.length?<OrderTable orders={purchaseOrders.map(p=>({id:p.id,order_number:p.po_number,status:p.status,payment_status:"—",total:p.total,created_at:p.created_at}))}/>:<div className="bos-muted"><LockKeyhole size={20}/><br/>Modul pembelian sudah disiapkan pada Business OS, tetapi data supplier/PO internal belum dibuka untuk akun ini. Ini sengaja mengikuti RLS, bukan error.</div>}</section>}

function Finance({orders,salesTotal,paidTotal}){return <><div className="bos-kpis"><Kpi icon={CircleDollarSign} label="Nilai seluruh order terbaca" value={rupiah(salesTotal)} note="Bukan laba bersih"/><Kpi icon={CheckCircle2} label="Order paid" value={rupiah(paidTotal)} note="Status payment = paid"/><Kpi icon={WalletCards} label="Belum terbayar" value={rupiah(Math.max(0,salesTotal-paidTotal))} note="Selisih dari data order terbaca"/><Kpi icon={Database} label="Catatan" value="COGS —" note="Belum ada data biaya pokok yang dapat dibaca"/></div><section className="bos-panel" style={{marginTop:12}}><div className="bos-alert"><ShieldCheck size={16}/>Business OS tidak menyebut angka di atas sebagai laba. Untuk P&L dan margin, kita perlu cost/COGS dan ledger keuangan yang terhubung.</div></section></>}

function CRM({customers}){return <section className="bos-panel"><div className="bos-panel-head"><h2>Pelanggan terbaru</h2><span>{customers.length} record terbaca</span></div>{customers.length?<div style={{overflowX:"auto"}}><table className="bos-table"><thead><tr><th>Nama</th><th>Email</th><th>Telepon</th><th>Bergabung</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td><strong>{c.name||"—"}</strong></td><td>{c.email||"—"}</td><td>{c.phone||"—"}</td><td>{shortDate(c.created_at)}</td></tr>)}</tbody></table></div>:<div className="bos-muted">Belum ada data CRM yang dapat dibaca akun ini.</div>}</section>}

function AIAdvisor({products,orders,inventoryAccess,procurementAccess}){const insights=[];if(!products.length)insights.push("Katalog belum memiliki produk aktif yang dapat dianalisis.");else insights.push("Katalog aktif terbaca: "+products.length+" produk. Lengkapi harga, satuan, foto, dan stock_qty resmi agar insight komersial lebih tajam.");if(!orders.length)insights.push("Belum ada order yang terbaca untuk analisis tren penjualan.");else insights.push("Ada "+orders.length+" order yang dapat dibaca. Langkah berikutnya adalah menghubungkan agregasi owner agar KPI bisnis tidak terbatas pada order akun.");if(!inventoryAccess)insights.push("Inventory ledger masih protected. Setelah role organisasi tersedia, AI dapat membaca stok, reserved quantity dan reorder point.");if(!procurementAccess)insights.push("Purchase order masih protected. Setelah akses tersedia, AI dapat membantu rekomendasi restock dan supplier.");return <div className="bos-grid"><section className="bos-ai"><BrainCircuit size={25}/><b style={{display:"block",marginTop:10}}>JOLIE AI Business Advisor</b><p>Mesin insight tahap pertama. Tidak mengarang data dan tidak menyamakan omzet dengan laba.</p><div className="bos-ai-list">{insights.map((x,i)=><div key={i}>{x}</div>)}</div></section><section className="bos-panel"><div className="bos-panel-head"><h2>Next intelligence layer</h2></div><div className="bos-module-card"><BarChart3 size={20}/><b>Demand & Reorder Intelligence</b><span>Setelah data penjualan, inventory ledger, supplier dan lead time terbuka, sistem dapat menghitung tren, risiko stockout dan rekomendasi pembelian dengan audit trail.</span></div><div className="bos-module-card" style={{marginTop:10}}><ShieldCheck size={20}/><b>AI Governance</b><span>Insight AI tetap read-only terhadap keputusan sensitif sampai ada policy, role dan approval workflow.</span></div></section></div>}
