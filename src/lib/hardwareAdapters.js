// JOLIE Hardware Adapter Layer
// Business logic calls these adapters; device-specific implementations can replace them later.

export function createReceiptModel({orderNumber="—",items=[],total=0,paymentMethod="cash",storeName="TOKO JOLIE"}){
  return {storeName,orderNumber,items,total,paymentMethod,createdAt:new Date().toISOString()};
}

export function openBrowserPrint(receipt){
  const w=window.open("","_blank","width=420,height=680");
  if(!w) throw new Error("Popup print diblokir browser.");
  const rows=(receipt.items||[]).map(x=>`<tr><td>${escapeHtml(x.name)}</td><td style="text-align:center">${x.qty}</td><td style="text-align:right">${money(x.price*x.qty)}</td></tr>`).join("");
  w.document.write(`<!doctype html><html><head><title>Receipt ${escapeHtml(receipt.orderNumber)}</title><style>body{font-family:monospace;width:72mm;margin:0 auto;padding:8px;font-size:12px}h2{text-align:center;font-size:16px;margin:0 0 8px}table{width:100%;border-collapse:collapse}.total{border-top:1px dashed #000;margin-top:8px;padding-top:8px;font-weight:bold}.center{text-align:center}.muted{font-size:10px}</style></head><body><h2>${escapeHtml(receipt.storeName)}</h2><div>Order: ${escapeHtml(receipt.orderNumber)}</div><div>${new Date(receipt.createdAt).toLocaleString("id-ID")}</div><hr><table><tbody>${rows}</tbody></table><div class="total">TOTAL: ${money(receipt.total)}</div><div>PAYMENT: ${escapeHtml(receipt.paymentMethod)}</div><p class="center muted">Terima kasih</p><script>window.onload=()=>{window.print();}</script></body></html>`);
  w.document.close();
}

export function buildEscPosReceipt(receipt){
  const ESC="\x1b",GS="\x1d";
  const lines=[ESC+"@",ESC+"a"+"\x01",receipt.storeName,ESC+"a"+"\x00",`Order: ${receipt.orderNumber}`,new Date(receipt.createdAt).toLocaleString("id-ID"),"--------------------------------"];
  for(const x of receipt.items||[]) lines.push(`${String(x.name).slice(0,20).padEnd(20)} ${String(x.qty).padStart(3)} ${money(x.price*x.qty).padStart(12)}`);
  lines.push("--------------------------------",`TOTAL: ${money(receipt.total)}`,`PAYMENT: ${receipt.paymentMethod}`, "\n\n", GS+"V"+"\x00");
  return new TextEncoder().encode(lines.join("\n"));
}

// Common ESC/POS cash-drawer pulse; actual drawer timing may vary by printer/model.
export function buildCashDrawerPulse(){
  return new Uint8Array([0x1b,0x70,0x00,0x19,0xfa]);
}

function money(v){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(v||0));}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
