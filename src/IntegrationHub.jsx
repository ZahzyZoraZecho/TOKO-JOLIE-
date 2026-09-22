import React from "react";
import { ArrowLeft, Barcode, Printer, CreditCard, Smartphone, Wifi, CheckCircle2, AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { businessSupabase } from "./lib/supabase";
import JsBarcode from "jsbarcode";
import { openBrowserPrint, createReceiptModel } from "./lib/hardwareAdapters";

const TYPES = [
  ["barcode_scanner","Barcode Scanner","usb"],
  ["thermal_printer","Thermal Printer","usb"],
  ["label_printer","Label Printer","usb"],
  ["cash_drawer","Cash Drawer","browser"],
  ["edc","EDC","api"],
  ["customer_display","Customer Display","browser"]
];

function money(v){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(v||0));}

function BarcodePreview({value}){const ref=React.useRef(null);React.useEffect(()=>{if(ref.current&&value)try{JsBarcode(ref.current,value,{format:"CODE128",displayValue:true,height:48,margin:6,width:2})}catch(e){ref.current.innerHTML=""}},[value]);return <svg ref={ref} style={{width:"100%",background:"#fff",marginTop:8}}/>}

export default function IntegrationHub({onBack}){
  const [access,setAccess]=React.useState(null),[devices,setDevices]=React.useState([]),[jobs,setJobs]=React.useState([]),[adapters,setAdapters]=React.useState([]),[ppob,setPpob]=React.useState([]),[products,setProducts]=React.useState([]);
  const [busy,setBusy]=React.useState(true),[msg,setMsg]=React.useState(""),[scan,setScan]=React.useState(""),[device,setDevice]=React.useState({type:"barcode_scanner",name:"",code:"",connection:"usb"});
  const load=React.useCallback(async()=>{
    if(!businessSupabase){setBusy(false);return;}
    setBusy(true);
    const {data:a,error:e}=await businessSupabase.rpc("jolie_my_access");
    const acc=a?.[0];
    if(e||!acc){setAccess(null);setMsg("Akun belum memiliki role Business OS.");setBusy(false);return;}
    setAccess(acc);
    const org=acc.organization_id;
    const [d,j,p,x,pr]=await Promise.all([
      businessSupabase.from("device_registry").select("id,device_code,name,device_type,connection_type,location,status,last_seen_at,capabilities").eq("organization_id",org).order("name"),
      businessSupabase.from("print_jobs").select("id,job_type,status,attempts,error_message,created_at,printed_at").eq("organization_id",org).order("created_at",{ascending:false}).limit(30),
      businessSupabase.from("payment_provider_adapters").select("id,provider_code,provider_name,method,mode,is_enabled,capabilities").eq("organization_id",org).order("provider_name"),
      businessSupabase.from("ppob_transactions").select("id,service_type,provider_code,customer_reference,selling_price,status,provider_reference,created_at").eq("organization_id",org).order("created_at",{ascending:false}).limit(30),
      businessSupabase.from("products").select("id,name,sku,barcode_value,product_type,price").eq("organization_id",org).order("name").limit(300)
    ]);
    setDevices(d.data||[]);setJobs(j.data||[]);setAdapters(p.data||[]);setPpob(x.data||[]);setProducts(pr.data||[]);
    const errors=[d,j,p,x,pr].filter(r=>r.error).map(r=>r.error.message);
    setMsg(errors.length?errors.join(" · "):"");
    setBusy(false);
  },[]);
  React.useEffect(()=>{load();},[load]);

  async function addDevice(){
    if(!device.name.trim()||!device.code.trim()) return setMsg("Nama dan kode perangkat wajib diisi.");
    const {error}=await businessSupabase.from("device_registry").insert({
      organization_id:access.organization_id,device_code:device.code.trim(),name:device.name.trim(),
      device_type:device.type,connection_type:device.connection,status:"offline",created_by:(await businessSupabase.auth.getUser()).data.user?.id
    });
    setMsg(error?.message||"Perangkat terdaftar. Status awal offline sampai agent/perangkat melaporkan heartbeat.");
    if(!error){setDevice({type:"barcode_scanner",name:"",code:"",connection:"usb"});load();}
  }

  async function queuePrint(jobType){
    const user=(await businessSupabase.auth.getUser()).data.user;
    const {error}=await businessSupabase.from("print_jobs").insert({
      organization_id:access.organization_id,job_type:jobType,payload:{source:"integration-hub",note:"queued by operator"},status:"queued",requested_by:user?.id
    });
    setMsg(error?.message||"Print job masuk antrean. Eksekusi fisik membutuhkan printer adapter/agent.");
    if(!error)load();
  }

  const product=products.find(p=>String(p.barcode_value||"")===scan.trim());
  return <div className="ih-shell"><style>{`
    .ih-shell{min-height:100vh;background:#f4f8f6;color:#12352b;font-family:Inter,system-ui,sans-serif}
    .ih-top{height:68px;background:#fff;border-bottom:1px solid #dce7e1;display:flex;align-items:center;justify-content:space-between;padding:0 22px;position:sticky;top:0;z-index:5}
    .ih-brand{display:flex;align-items:center;gap:10px}.ih-mark{width:40px;height:40px;border-radius:11px;background:#08764d;color:#fff;display:grid;place-items:center;font-weight:900}.ih-brand b{display:block}.ih-brand small{color:#71857d;font-size:9px}
    .ih-actions{display:flex;gap:8px}.ih-btn{border:1px solid #d6e4dd;background:#fff;border-radius:9px;padding:9px 11px;font-weight:800;font-size:10px;display:flex;align-items:center;gap:6px}.ih-primary{background:#08764d;color:#fff;border-color:#08764d}
    .ih-main{padding:22px;max-width:1180px;margin:auto}.ih-hero{background:#082f23;color:#fff;border-radius:18px;padding:22px;display:flex;justify-content:space-between;gap:20px;align-items:center}.ih-hero h1{margin:4px 0;font-size:26px}.ih-hero p{margin:0;color:#b8d1c6;font-size:11px;line-height:1.6}.ih-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:14px}.ih-card{background:#fff;border:1px solid #dce7e1;border-radius:14px;padding:15px}.ih-card h3{font-size:13px;margin:8px 0}.ih-card p,.ih-muted{font-size:10px;color:#71857d;line-height:1.55}.ih-row{display:flex;gap:8px;flex-wrap:wrap}.ih-input{border:1px solid #d6e4dd;border-radius:9px;padding:10px;font-size:11px;background:#fbfdfc;box-sizing:border-box}.ih-wide{width:100%}.ih-table{width:100%;border-collapse:collapse;font-size:10px}.ih-table th,.ih-table td{padding:8px 5px;border-bottom:1px solid #edf2ef;text-align:left}.ih-status{font-weight:800}.ih-ok{color:#0a8053}.ih-warn{color:#a05b20}.ih-msg{margin:12px 0;padding:10px;border-radius:9px;background:#fff7ed;border:1px solid #f1dcc8;font-size:10px}.ih-list{max-height:230px;overflow:auto}.ih-item{padding:9px 0;border-bottom:1px solid #edf2ef;font-size:10px}.ih-badge{display:inline-block;padding:3px 6px;border-radius:999px;background:#edf7f2;color:#08764d;font-weight:800;margin-left:5px}.ih-scan{font-size:15px;padding:13px}.ih-barcode{font-family:monospace;font-size:20px;letter-spacing:2px;background:#fff;padding:12px;border:1px dashed #b9c9c2;text-align:center;margin-top:10px}
    @media(max-width:850px){.ih-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.ih-grid{grid-template-columns:1fr}.ih-top{padding:0 12px}.ih-main{padding:12px}.ih-hero{align-items:flex-start}}
  `}</style>
  <header className="ih-top"><div className="ih-brand"><div className="ih-mark">J</div><div><b>JOLIE Integration Hub</b><small>{access?.organization_name||"Business OS"} · {access?.role||""}</small></div></div><div className="ih-actions"><button className="ih-btn" onClick={onBack}><ArrowLeft size={14}/> Business OS</button><button className="ih-btn ih-primary" onClick={load} disabled={busy}><RefreshCw size={14}/> {busy?"Sync…":"Sync"}</button></div></header>
  <main className="ih-main">
    <section className="ih-hero"><div><small>HARDWARE + PAYMENT + DIGITAL SERVICES</small><h1>Satu Integration Hub, banyak adapter.</h1><p>POS tidak dikunci ke merek perangkat atau provider tertentu. Scanner, printer, cash drawer, EDC dan PPOB masuk lewat adapter sehingga provider dapat diganti tanpa merombak transaksi inti.</p></div><Wifi size={46}/></section>
    {msg&&<div className="ih-msg">{msg}</div>}
    <div className="ih-grid">
      <section className="ih-card"><Barcode size={24}/><h3>Barcode Studio</h3><p>Scanner diperlakukan sebagai input barcode generik. Studio dapat membuat barcode Code128 untuk SKU/internal code dan menyiapkan label cetak.</p><input className="ih-input ih-wide ih-scan" autoFocus value={scan} onChange={e=>setScan(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")setScan(e.currentTarget.value)}} placeholder="Scan / masukkan barcode…"/>{scan&&<><div className="ih-barcode">{product?product.name:"Barcode belum terdaftar"} · {scan}</div><BarcodePreview value={scan}/></>}</section>
      <section className="ih-card"><Printer size={24}/><h3>Print Engine</h3><p>Receipt, label, barcode, invoice dan report masuk antrean print. Agent lokal/USB/network dapat mengambil job tanpa mengubah logic POS.</p><div className="ih-row"><button className="ih-btn" onClick={()=>queuePrint("receipt")}><Printer size={14}/> Queue Receipt</button><button className="ih-btn" onClick={()=>{try{openBrowserPrint(createReceiptModel({orderNumber:"PREVIEW",items:[{name:"JOLIE Preview",qty:1,price:0}],total:0,paymentMethod:"preview"}))}catch(e){setMsg(e.message)}}}><Printer size={14}/> Browser Print</button><button className="ih-btn" onClick={()=>queuePrint("label")}><Barcode size={14}/> Label</button><button className="ih-btn" onClick={()=>queuePrint("barcode")}><Barcode size={14}/> Barcode</button></div></section>
      <section className="ih-card"><CreditCard size={24}/><h3>Payment Hub / EDC</h3><p>EDC disiapkan sebagai adapter. Status pembayaran hanya dianggap final setelah provider memberi konfirmasi; tidak ada asumsi sukses dari koneksi lokal.</p><div className="ih-list">{adapters.length?adapters.map(a=><div className="ih-item" key={a.id}><b>{a.provider_name}</b> · {a.method}<span className="ih-badge">{a.is_enabled?"enabled":"disabled"}</span></div>):<div className="ih-muted">Belum ada adapter provider terdaftar.</div>}</div></section>
      <section className="ih-card"><Smartphone size={24}/><h3>JOLIE PPOB</h3><p>Fondasi untuk pulsa, paket data, PLN token/pascabayar, top-up e-wallet dan voucher digital. Ini bukan stok fisik dan tidak boleh dipalsukan sebagai barang inventory.</p><div className="ih-list">{ppob.length?ppob.map(x=><div className="ih-item" key={x.id}>{x.service_type} · {x.customer_reference}<span className="ih-badge">{x.status}</span><br/>{money(x.selling_price)}</div>):<div className="ih-muted">Belum ada transaksi PPOB.</div>}</div></section>
      <section className="ih-card"><Plus size={24}/><h3>Device Registry</h3><p>Daftarkan perangkat per POS/gudang. Status heartbeat nanti datang dari local agent atau adapter.</p><div className="ih-row"><select className="ih-input" value={device.type} onChange={e=>{const t=TYPES.find(x=>x[0]===e.target.value);setDevice({...device,type:e.target.value,connection:t?.[2]||"browser"})}}>{TYPES.map(t=><option key={t[0]} value={t[0]}>{t[1]}</option>)}</select><input className="ih-input" placeholder="Kode POS-01" value={device.code} onChange={e=>setDevice({...device,code:e.target.value})}/><input className="ih-input ih-wide" placeholder="Nama perangkat" value={device.name} onChange={e=>setDevice({...device,name:e.target.value})}/><button className="ih-btn ih-primary" onClick={addDevice}>Daftarkan perangkat</button></div></section>
      <section className="ih-card"><CheckCircle2 size={24}/><h3>Device Health</h3><table className="ih-table"><thead><tr><th>Device</th><th>Type</th><th>Status</th></tr></thead><tbody>{devices.map(d=><tr key={d.id}><td>{d.name}<br/><span className="ih-muted">{d.device_code}</span></td><td>{d.device_type}</td><td className={d.status==="ready"||d.status==="online"?"ih-ok":"ih-warn"}>{d.status}</td></tr>)}</tbody></table>{!devices.length&&<div className="ih-muted">Belum ada perangkat terdaftar.</div>}</section>
    </div>
    <section className="ih-card" style={{marginTop:12}}><h3>Print Queue</h3><table className="ih-table"><thead><tr><th>Job</th><th>Status</th><th>Attempts</th><th>Error</th></tr></thead><tbody>{jobs.map(j=><tr key={j.id}><td>{j.job_type}</td><td>{j.status}</td><td>{j.attempts}</td><td>{j.error_message||"—"}</td></tr>)}</tbody></table>{!jobs.length&&<div className="ih-muted">Antrean print kosong.</div>}</section>
  </main></div>;
}
