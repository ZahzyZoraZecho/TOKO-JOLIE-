import React from "react";
import {
  Search, MapPin, UserRound, ShoppingCart, Menu, ChevronDown, ArrowRight,
  Truck, ShieldCheck, Headphones, Home, Sparkles, MessageCircle, Send, X,
  LogOut, Minus, Plus
} from "lucide-react";
import { supabase } from "./lib/supabase";
import BusinessOS from "./BusinessOS";

const ORG_SLUG = "jolie-toko-pakan-jolie-gebang";
const heroImage = "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1800&q=85";

// Temporary visual catalog: open-license reference photos only.
// Demo prices are explicitly preview values and are never used for real checkout.
const STORE_ADDRESS = "Jalan Raya Taji–Tinggang, Desa Sukorejo, Kecamatan Tambakrejo, Kabupaten Bojonegoro";
const STORE_WA = "6285235356666";
const STORE_MAP = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(STORE_ADDRESS);

function productArt(label, kind = "feed") {
  const bg = kind === "fish" ? "#dff4f6" : kind === "pet" ? "#f8eee4" : "#edf7f1";
  const accent = kind === "fish" ? "#168b9b" : kind === "pet" ? "#b96a2e" : "#08764d";
  const short = label.length > 18 ? label.slice(0, 18) + "…" : label;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700" viewBox="0 0 700 700">
    <rect width="700" height="700" rx="40" fill="${bg}"/>
    <rect x="150" y="95" width="400" height="500" rx="28" fill="white" stroke="${accent}" stroke-width="8"/>
    <rect x="175" y="120" width="350" height="105" rx="18" fill="${accent}"/>
    <text x="350" y="165" text-anchor="middle" fill="white" font-family="Arial" font-size="38" font-weight="800">JOLIE</text>
    <text x="350" y="200" text-anchor="middle" fill="white" font-family="Arial" font-size="19">ILUSTRASI PRODUK</text>
    <circle cx="350" cy="365" r="105" fill="${bg}" stroke="${accent}" stroke-width="6"/>
    <text x="350" y="350" text-anchor="middle" fill="${accent}" font-family="Arial" font-size="26" font-weight="700">${short.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</text>
    <text x="350" y="390" text-anchor="middle" fill="#5b6f67" font-family="Arial" font-size="19">Foto asli menyusul</text>
    <text x="350" y="535" text-anchor="middle" fill="#5b6f67" font-family="Arial" font-size="18">Keterangan &amp; harga dikonfirmasi</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const fallbackCatalog = [
  { id:"cat-wellmilk", name:"WELLMILK", unit:"Katalog · pakan", price:null, stock_qty:null, is_demo:true, image_url:productArt("WELLMILK"), description:"Produk pakan yang tercantum dalam daftar katalog JOLIE. Detail kemasan, harga, dan ketersediaan dikonfirmasi oleh toko." },
  { id:"cat-profat", name:"PROFAT", unit:"Katalog · pakan", price:null, stock_qty:null, is_demo:true, image_url:productArt("PROFAT"), description:"Produk pakan dalam katalog JOLIE. Jangan menganggap gambar ilustrasi sebagai kemasan resmi; foto asli akan diganti setelah tersedia." },
  { id:"cat-lifecat", name:"LIFECAT", unit:"Katalog · pakan kucing", price:null, stock_qty:null, is_demo:true, image_url:productArt("LIFECAT","pet"), description:"Produk pakan kucing yang tercantum pada daftar JOLIE. Varian dan ukuran mengikuti stok toko." },
  { id:"cat-eh610", name:"EH 610", unit:"Katalog · pakan", price:null, stock_qty:null, is_demo:true, image_url:productArt("EH 610"), description:"Produk pakan ternak/unggas yang tercantum dalam katalog JOLIE. Detail penggunaan mengikuti label produk." },
  { id:"cat-cp511", name:"CP 511", unit:"Katalog · pakan ayam", price:null, stock_qty:null, is_demo:true, image_url:productArt("CP 511"), description:"Varian pakan ayam yang tercantum dalam katalog JOLIE. Harga dan stok belum dipublikasikan." },
  { id:"cat-cp591", name:"CP 591", unit:"Katalog · pakan ayam", price:null, stock_qty:null, is_demo:true, image_url:productArt("CP 591"), description:"Varian pakan ayam yang tercantum dalam katalog JOLIE. Harga dan stok belum dipublikasikan." },
  { id:"cat-cp592", name:"CP 592", unit:"Katalog · pakan ayam", price:null, stock_qty:null, is_demo:true, image_url:productArt("CP 592"), description:"Varian pakan ayam yang tercantum dalam katalog JOLIE. Harga dan stok belum dipublikasikan." },
  { id:"cat-cp594", name:"CP 594", unit:"Katalog · pakan ayam", price:null, stock_qty:null, is_demo:true, image_url:productArt("CP 594"), description:"Varian pakan ayam yang tercantum dalam katalog JOLIE. Harga dan stok belum dipublikasikan." },
  { id:"cat-takari", name:"Takari", unit:"Katalog · pakan ikan", price:null, stock_qty:null, is_demo:true, image_url:productArt("TAKARI","fish"), description:"Pakan ikan yang tercantum dalam daftar produk JOLIE. Varian dan ukuran mengikuti stok toko." },
  { id:"cat-em4-pet", name:"EM4 Peternakan", unit:"Katalog · peternakan", price:null, stock_qty:null, is_demo:true, image_url:productArt("EM4 PETERNAKAN"), description:"Produk EM4 untuk peternakan; informasi produsen menyebutnya sebagai kultur mikroorganisme yang digunakan dalam manajemen ternak. Detail penggunaan mengikuti label resmi." },
  { id:"cat-em4-fish", name:"EM4 Perikanan", unit:"Katalog · perikanan", price:null, stock_qty:null, is_demo:true, image_url:productArt("EM4 PERIKANAN","fish"), description:"Produk EM4 untuk perikanan/tambak. Informasi produsen menjelaskan penggunaannya untuk membantu pengelolaan kualitas air dan sisa organik; penggunaan harus mengikuti label." },
  { id:"cat-smartgrow", name:"Smartgrow", unit:"Katalog · pertanian", price:null, stock_qty:null, is_demo:true, image_url:productArt("SMARTGROW"), description:"Produk Smartgrow yang tercantum dalam daftar JOLIE. Spesifikasi dan ukuran harus dikonfirmasi sebelum pembelian." }
];

function money(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(value ?? 0);
}

function openWhatsApp(message = "Halo JOLIE, saya ingin bertanya tentang produk.") {
  window.open("https://wa.me/" + STORE_WA + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
}

function openStoreMap() {
  window.open(STORE_MAP, "_blank", "noopener,noreferrer");
}

function buildAiReply(text, catalogProducts, currentUser) {
  const q = text.trim().toLowerCase();
  if (!q) return "Silakan tulis pertanyaan tentang produk, pakan, pesanan, atau layanan JOLIE.";
  if (q.includes("status") || q.includes("pesanan") || q.includes("order")) {
    if (!currentUser) return "Untuk mengecek status pesanan, silakan login terlebih dahulu. Setelah login, saya dapat membaca pesanan milik akun Anda.";
    return "Saya akan membaca pesanan terbaru dari akun Anda. Jika belum ada pesanan, JOLIE akan menampilkan informasi tersebut.";
  }
  if (q.includes("harga") || q.includes("stok") || q.includes("tersedia")) {
    const found = catalogProducts.find(p => q.includes(p.name.toLowerCase()));
    if (found) return found.price == null
      ? found.name + " tercatat di katalog JOLIE, tetapi harga/stok belum dipublikasikan. Tekan “Tanya Harga” untuk menghubungi toko."
      : found.name + " tercatat dengan harga " + money(found.price) + ".";
    return "Harga dan stok yang akurat harus berasal dari katalog JOLIE. Sebutkan nama produknya agar saya cocokkan.";
  }
  if (q.includes("ayam")) return "Untuk ayam, sebutkan tujuan pemeliharaan dan usia/fase ayam. JOLIE memiliki beberapa varian pakan ayam dalam katalog, tetapi pemilihan akhir sebaiknya mengikuti label produk dan kebutuhan ternak.";
  if (q.includes("ikan")) return "Untuk ikan, sebutkan jenis ikan, ukuran, dan pola pemeliharaan. JOLIE memiliki kategori pakan ikan dan produk pendukung perikanan.";
  if (q.includes("sapi") || q.includes("kambing") || q.includes("domba")) return "Untuk ruminansia, sebutkan jenis ternak, usia, tujuan pemeliharaan, dan pakan yang sedang digunakan. Saya dapat membantu membuat checklist kebutuhan pakan tanpa menggantikan konsultasi ahli.";
  if (q.includes("lokasi") || q.includes("alamat")) return "JOLIE berada di Jalan Raya Taji–Tinggang, Desa Sukorejo, Kecamatan Tambakrejo, Kabupaten Bojonegoro. Tombol “Lokasi Toko” dapat membuka peta.";
  return "Saya siap membantu mencari produk, menjelaskan fungsi umum produk dari katalog, memeriksa status pesanan setelah login, atau mengarahkan Anda ke toko. Untuk detail harga/stok, saya tidak akan menebak data yang belum ada.";
}

function App() {
  const [organization, setOrganization] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [catalogError, setCatalogError] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState("login");
  const [authEmail, setAuthEmail] = React.useState("");
  const [authPassword, setAuthPassword] = React.useState("");
  const [authName, setAuthName] = React.useState("");
  const [authBusy, setAuthBusy] = React.useState(false);
  const [authMessage, setAuthMessage] = React.useState("");
  const [orderMessage, setOrderMessage] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(true);
  const [aiMessage, setAiMessage] = React.useState("");
  const [aiInput, setAiInput] = React.useState("");
  const [vetInput, setVetInput] = React.useState({ animal:"", age:"", symptoms:"", duration:"" });
  const [vetMessage, setVetMessage] = React.useState("");
  const [articleOpen, setArticleOpen] = React.useState(null);
  const [businessOsOpen, setBusinessOsOpen] = React.useState(() => window.location.pathname.endsWith("/business-os") || window.location.pathname.endsWith("/business-os/"));
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  React.useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) {
        setCatalogError("Supabase belum dikonfigurasi.");
        setLoading(false);
        return;
      }
      const { data: org, error: orgError } = await supabase
        .from("organizations").select("id,name,slug").eq("slug", ORG_SLUG).single();
      if (orgError) {
        if (active) { setCatalogError("Katalog JOLIE sedang diperbarui."); setLoading(false); }
        return;
      }
      const [{ data: cats, error: catError }, { data: prods, error: prodError }] = await Promise.all([
        supabase.from("product_categories")
          .select("id,name,slug,icon,sort_order")
          .eq("organization_id", org.id).eq("is_active", true).order("sort_order"),
        supabase.from("products")
          .select("id,name,slug,description,image_url,unit,price,compare_at_price,is_featured,stock_qty,category_id")
          .eq("organization_id", org.id).eq("is_active", true).order("created_at", { ascending: false })
      ]);
      if (active) {
        setOrganization(org);
        setCategories(cats || []);
        setProducts(prods || []);
        setCatalogError((catError || prodError) ? "Katalog JOLIE sedang diperbarui." : "");
        setLoading(false);
      }
    }
    load();
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
      return () => { active = false; listener.subscription.unsubscribe(); };
    }
    return () => { active = false; };
  }, []);

  if (businessOsOpen) return <BusinessOS user={user} onBack={()=>{ window.location.href = "./"; }} />;

  const catalogProducts = products.length ? products : fallbackCatalog;
    const filteredProducts = catalogProducts.filter(p => {
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
  });

  function addToCart(product) {
    if (product.price == null) return;
    setCart(items => {
      const found = items.find(x => x.id === product.id);
      return found
        ? items.map(x => x.id === product.id ? { ...x, quantity: x.quantity + 1 } : x)
        : [...items, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function changeQty(id, delta) {
    setCart(items => items.map(x => x.id === id ? { ...x, quantity: Math.max(0, x.quantity + delta) } : x).filter(x => x.quantity > 0));
  }

  const cartCount = cart.reduce((n, x) => n + x.quantity, 0);
  const cartTotal = cart.reduce((n, x) => n + Number(x.price || 0) * x.quantity, 0);

  async function submitAuth(e) {
    e.preventDefault();
    if (!supabase) return;
    setAuthBusy(true); setAuthMessage("");
    const result = authMode === "login"
      ? await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      : await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { full_name: authName } } });
    if (result.error) setAuthMessage(result.error.message);
    else {
      if (authMode === "signup" && result.data.user) {
        const uid = result.data.user.id;
        await supabase.from("profiles").upsert({
          id: uid,
          full_name: authName || authEmail.split("@")[0]
        });
        await supabase.from("customers").upsert({
          organization_id: (await supabase.from("organizations").select("id").eq("slug", ORG_SLUG).single()).data?.id,
          user_id: uid,
          name: authName || authEmail.split("@")[0],
          email: authEmail
        }, { onConflict: "organization_id,user_id" });
      }
      setAuthMessage(authMode === "login" ? "Berhasil masuk." : "Akun dibuat. Jika email confirmation aktif, cek email Anda.");
      if (authMode === "login") setAuthOpen(false);
    }
    setAuthBusy(false);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setAuthOpen(false);
  }

  async function askAi(text = aiInput) {
    const reply = buildAiReply(text, catalogProducts, user);
    setAiMessage(reply);
    if (user && /status|pesanan|order/i.test(text)) {
      const { data, error } = await supabase
        .from("sales_orders")
        .select("order_number,status,payment_status,created_at,total")
        .eq("user_id", user.id)
        .order("created_at", { ascending:false })
        .limit(3);
      if (!error && data?.length) {
        setAiMessage("Pesanan terbaru Anda:\n" + data.map(o =>
          (o.order_number || "Pesanan") + " — " + (o.status || "status belum ada") + " — pembayaran " + (o.payment_status || "belum ada")
        ).join("\n"));
      } else if (!error) {
        setAiMessage("Belum ada pesanan yang ditemukan pada akun Anda.");
      }
    }
  }

  function runVet() {
    const { animal, age, symptoms, duration } = vetInput;
    if (!animal || !symptoms) {
      setVetMessage("Isi minimal jenis hewan dan gejala/keluhan.");
      return;
    }
    const urgent = /sesak|sulit bernapas|kejang|tidak sadar|pendarahan|perdarahan|keracunan|tidak bisa berdiri|muntah terus|diare berdarah/i.test(symptoms);
    setVetMessage(
      urgent
        ? "Tanda yang Anda sebutkan dapat memerlukan penanganan segera. Pisahkan hewan dari kelompok bila perlu, kurangi stres, jangan memberikan obat manusia atau dosis obat secara sembarangan, dan hubungi dokter hewan/tenaga kesehatan hewan secepatnya."
        : "Informasi awal: catat nafsu makan/minum, suhu bila Anda memiliki alat ukur yang sesuai, perubahan kotoran, aktivitas, dan apakah ada hewan lain dengan keluhan serupa. Jangan gunakan obat atau dosis tertentu berdasarkan chat saja. Jika memburuk atau tidak membaik, konsultasikan ke dokter hewan."
    );
  }

  async function checkout() {
    setOrderMessage("");
    if (!user) { setAuthMode("login"); setAuthOpen(true); setOrderMessage("Silakan login sebelum membuat pesanan."); return; }
    if (!cart.length) return;
    if (cart.every(item => String(item.id).startsWith("demo-"))) {
      setOrderMessage("Mode preview: contoh pesanan siap. Produk contoh belum terhubung ke stok/harga JOLIE.");
      return;
    }
    setOrderMessage("Memproses pesanan...");
    const items = cart.map(x => ({ product_id: x.id, quantity: x.quantity }));
    const { data, error } = await supabase.rpc("create_jolie_order", { p_items: items });
    if (error) { setOrderMessage(error.message); return; }
    setCart([]);
    setOrderMessage("Pesanan berhasil dibuat: " + (data?.order_number || data?.id || "tersimpan"));
  }

  const uiStyle = `
.modal-backdrop,.drawer-backdrop{position:fixed;inset:0;background:#06281e99;z-index:80;display:flex}.modal-backdrop{align-items:center;justify-content:center;padding:20px}.modal-card{width:min(430px,100%);background:#fff;border-radius:18px;padding:28px;position:relative;box-shadow:0 25px 70px #0004}.modal-close{position:absolute;right:14px;top:14px;border:0;background:#edf5f1;border-radius:50%;width:32px;height:32px}.modal-input{display:block;width:100%;height:42px;border:1px solid #d9e6df;border-radius:9px;padding:0 12px;margin:9px 0;outline:0}.modal-primary{width:100%;border:0;background:#08764d;color:#fff;border-radius:9px;padding:11px;font-weight:800}.modal-secondary{width:100%;margin-top:9px;border:1px solid #dbe7e2;background:#fff;color:#31574a;border-radius:9px;padding:10px}.modal-switch{display:block;width:100%;margin-top:14px;border:0;background:transparent;color:#08764d;font-weight:700}.modal-message,.order-message{background:#eef8f3;color:#365f50;border-radius:8px;padding:9px;font-size:9px;margin:9px 0}.drawer-backdrop{justify-content:flex-end}.cart-drawer{width:min(470px,100%);height:100%;background:#fff;display:flex;flex-direction:column}.drawer-head{padding:20px;border-bottom:1px solid #dce7e1;display:flex;justify-content:space-between}.drawer-head button{border:0;background:#eef6f2;border-radius:50%;width:34px;height:34px}.drawer-items{flex:1;overflow:auto;padding:12px}.drawer-item{display:grid;grid-template-columns:60px 1fr auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #edf2f0}.drawer-thumb{width:60px;height:60px;border-radius:8px;background:#edf7f1;display:grid;place-items:center;overflow:hidden}.drawer-thumb img{width:100%;height:100%;object-fit:cover}.drawer-info b{display:block;font-size:10px}.drawer-info span{display:block;font-size:8px;color:#788b84;margin:4px 0 7px}.qty{display:flex;align-items:center;gap:8px}.qty button{border:1px solid #dce7e2;background:#fff;border-radius:5px;width:25px;height:25px}.drawer-foot{padding:18px;border-top:1px solid #dce7e1}.drawer-foot>div:first-child{display:flex;justify-content:space-between;margin-bottom:10px}.drawer-foot .modal-primary{margin-top:4px}.drawer-foot small{display:block;text-align:center;font-size:8px;color:#8a9994;margin-top:7px}.drawer-empty{text-align:center;padding:50px 10px;color:#778a83}
.product-desc{font-size:8px;line-height:1.45;color:#6d8078;min-height:34px;margin:5px 0}.product-card .ask-price{background:#eef7f2;color:#08764d;border:1px solid #cfe3d9}.legal-note{margin-top:14px;padding:10px 12px;border-radius:9px;background:#f5f8f6;color:#6c8077;font-size:9px;line-height:1.5}.vet-form{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}.vet-form input{border:0;border-radius:7px;padding:8px;font-size:8px;outline:0}.vet-form button{grid-column:1/-1;border:0;border-radius:8px;padding:8px;font-size:8px;font-weight:800;color:#08764d;background:#fff}.vet-response{margin-top:8px;background:#fff;color:#35584d;border-radius:8px;padding:9px;font-size:8px;line-height:1.5}.tip-article{width:100%;display:flex;gap:8px;padding:9px 0;border:0;border-bottom:1px solid #eef2f0;background:transparent;text-align:left;cursor:pointer}.tip-article:last-child{border:0}.article-modal p{font-size:11px;line-height:1.65;color:#62776e}.article-modal h2{margin-top:8px}.ai-response{white-space:pre-line;background:#f1f8f4;border:1px solid #d9ebe2;border-radius:10px;padding:10px;font-size:11px;line-height:1.5;margin:8px 0}.info-sections{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:18px}.info-card{background:#fff;border:1px solid #e0ebe6;border-radius:18px;padding:24px}.info-card h2{margin:6px 0 10px}.info-card p{color:#657970;line-height:1.6}.eyebrow{font-size:10px;font-weight:900;color:#08764d;letter-spacing:.12em}.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.info-grid div{background:#f4f8f6;border-radius:10px;padding:12px}.info-grid b,.info-grid span{display:block}.info-grid span{font-size:11px;color:#71827b;margin-top:4px}.contact-actions{display:flex;gap:10px;flex-wrap:wrap}.contact-actions button{border:0;border-radius:9px;background:#08764d;color:#fff;padding:10px 14px;font-weight:800}.contact-actions button+button{background:#eef5f1;color:#31574a}
@media(max-width:900px){.info-sections{grid-template-columns:1fr}.info-grid{grid-template-columns:1fr}}
`;
  return <div className="app-shell"><style>{uiStyle}</style>
    <header className="top-header">
      <div className="header-main container">
        <div className="brand"><div className="brand-mark">🌿</div><div><strong>JOLIE</strong><span>Pakan & Kebutuhan Ternak</span></div></div>
        <div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scrollTo("produk")} placeholder="Cari produk, kategori, atau kebutuhan ternak..."/><button aria-label="Cari" onClick={()=>scrollTo("produk")}><Search size={17}/></button></div>
        <button className="header-action" onClick={openStoreMap}><MapPin size={18}/><div><b>Lokasi Toko</b><span>Jalan Raya Taji–Tinggang</span></div></button>
        <button className="header-action account" onClick={()=>setAuthOpen(true)}><UserRound size={18}/><div><b>{user ? "Akun Saya" : "Masuk / Buat Akun"}</b><span>{user?.email || "Masuk ke JOLIE"}</span></div></button>
        <button className="header-cart" onClick={()=>setCartOpen(true)}><ShoppingCart/><span className="cart-badge">{cartCount}</span><div><b>Keranjang</b><small>{cartCount} item</small></div></button>
      </div>
      <div className="nav-row"><div className="container nav-inner">
        <button className="category-btn" onClick={()=>scrollTo("kategori")}><Menu size={18}/> Semua Kategori <ChevronDown size={16}/></button>
        <nav>{[
          ["Beranda","beranda"],["Produk","produk"],["Layanan","layanan"],["AI Advisor","ai-advisor"],
          ["Artikel & Tips","artikel"],["Tentang Kami","tentang"],["Kontak","kontak"],
          ["Business OS","business-os"]
        ].map(([n,id],i)=><a key={n} className={i===0?"active":""} href={"#"+id} onClick={e=>{e.preventDefault();if(id==="business-os"){window.location.href="./business-os/";return;}scrollTo(id)}}>{n}{n==="Produk"||n==="Layanan"?<ChevronDown size={12}/>:null}</a>)}</nav>
      </div></div>
    </header>

    <main className="container page-grid" id="beranda">
      <section className="main-column">
        <section className="hero"><img src={heroImage} alt="Peternakan JOLIE"/><div className="hero-overlay"/><div className="hero-content">
          <p>JOLIE · Solusi Lengkap Kebutuhan Pakan dan Ternak</p>
          <h1>Pakan Berkualitas<br/>untuk Hasil Maksimal</h1>
          <span>Mendukung peternakan, perikanan, dan pertanian Anda<br/>dengan produk terbaik, harga bersaing, dan layanan profesional.</span>
          <button className="primary-btn" onClick={()=>scrollTo("produk")}>Belanja Sekarang <ArrowRight size={18}/></button>
          <div className="hero-points"><span>◉ Produk Original</span><span>✦ Harga Terbaik</span><span>▣ Pengiriman Cepat</span><span>◉ Layanan Konsultasi</span></div>
        </div></section>

        <section className="section-card category-section" id="kategori"><div className="section-heading"><h2>Kategori Produk</h2><a href="#kategori" onClick={e=>{e.preventDefault();document.getElementById("kategori")?.scrollIntoView({behavior:"smooth"})}}>Lihat Semua <ArrowRight size={15}/></a></div>
          <div className="category-grid">{categories.map(c=><button className="category-item" key={c.id} onClick={()=>{setQuery(c.name);scrollTo("produk")}}><div>{c.icon || "•"}</div><span>{c.name}</span></button>)}</div>
          {!loading && categories.length===0 && <p className="catalog-empty">Kategori belum tersedia.</p>}
        </section>

        <section className="products-section" id="produk"><div className="section-heading"><div className="heading-tabs"><h2>Produk Pilihan</h2><button className="pill active" onClick={()=>setQuery("")}>Terbaru</button></div><a href="#produk" onClick={e=>{e.preventDefault();setQuery("")}}>Lihat Semua <ArrowRight size={15}/></a></div>
          {loading ? <div className="catalog-state">Memuat katalog JOLIE…</div> :
          filteredProducts.length ? <><div className="product-grid">{filteredProducts.slice(0,5).map(p=><article className="product-card" key={p.id}>
            {p.is_demo && <span className="product-tag promo">PREVIEW</span>}
            {p.compare_at_price && p.compare_at_price > p.price && <span className="product-tag promo">Promo</span>}
            <div className="product-image">{p.image_url ? <img src={p.image_url} alt={p.name}/> : <div className="product-image-placeholder">JOLIE</div>}</div>
            <h3>{p.name}</h3><small>{p.unit || "Detail produk tersedia melalui JOLIE"}</small>
            <p className="product-desc">{p.description || "Keterangan produk akan dilengkapi berdasarkan data katalog JOLIE."}</p>
            <div className="rating"><span>★★★★★</span></div>
            <strong>{p.price == null ? "Harga via WhatsApp" : money(p.price)}</strong>
            {p.price == null
              ? <button className="ask-price" onClick={()=>openWhatsApp("Halo JOLIE, saya ingin menanyakan harga dan stok produk: "+p.name)}><MessageCircle size={15}/> Tanya Harga & Stok</button>
              : <button onClick={()=>addToCart(p)} disabled={Number(p.stock_qty) <= 0}><ShoppingCart size={15}/> Tambah ke Keranjang</button>}
          </article>)}</div>
          {isDemoCatalog && <div className="catalog-attribution">Katalog ini menggunakan daftar produk yang telah diberikan untuk JOLIE. Gambar bertanda ilustrasi bukan foto kemasan resmi. Harga/stok belum diisi agar tidak mengarang data; gunakan “Tanya Harga & Stok” atau masukkan data resmi ke Supabase.</div>}</> :
          <div className="catalog-state"><b>Katalog sedang diperbarui.</b><span>Hubungi JOLIE untuk mendapatkan informasi produk dan ketersediaan terbaru.</span></div>}
        </section>

        <section className="service-strip" id="layanan"><div><Truck/><b>Pengiriman Cepat</b><span>Pesanan diproses dengan teratur.</span></div><div><ShieldCheck/><b>Pembayaran Aman</b><span>Pilihan pembayaran akan terintegrasi.</span></div><div><Headphones/><b>Layanan Konsultasi</b><span>Tim JOLIE siap membantu.</span></div><div><Home/><b>Produk Berkualitas</b><span>Katalog dikelola dari data bisnis.</span></div></section>
      </section>

      <section className="info-sections">
        <section className="info-card" id="tentang">
          <span className="eyebrow">TENTANG JOLIE</span>
          <h2>Toko Pakan Jolie Gebang</h2>
          <p>JOLIE beroperasi di wilayah Desa Sukorejo, Kecamatan Tambakrejo, Kabupaten Bojonegoro. Berdasarkan dokumen perizinan yang Anda unggah, usaha ini berstatus Usaha Mikro dan mencantumkan kegiatan perdagangan eceran pakan ternak/unggas/ikan serta perdagangan eceran obat tradisional untuk hewan.</p>
          <p>Dokumen yang diunggah juga mencantumkan kegiatan usaha terkait barang dari rotan dan bambu. Informasi ini ditampilkan sebagai profil legal/bisnis berdasarkan dokumen, bukan sebagai klaim bahwa seluruh produk tersebut selalu tersedia.</p>
          <div className="info-grid"><div><b>Wilayah</b><span>Desa Sukorejo · Tambakrejo · Bojonegoro</span></div><div><b>Skala</b><span>Usaha Mikro</span></div><div><b>Bidang</b><span>Pakan, kebutuhan ternak & kegiatan usaha terkait</span></div></div>
          <div className="legal-note">Dokumen perizinan yang diunggah bertanggal 2 Mei 2024. Nomor identitas dan data pribadi pemilik tidak ditampilkan di halaman publik.</div>
        </section>
        <section className="info-card" id="kontak">
          <span className="eyebrow">KONTAK</span>
          <h2>Hubungi JOLIE Gebang</h2>
          <p>Jalan Raya Taji–Tinggang, Desa Sukorejo, Kecamatan Tambakrejo, Kabupaten Bojonegoro.</p>
          <div className="contact-actions"><button onClick={()=>openWhatsApp("Halo JOLIE, saya ingin bertanya tentang produk/layanan.")}>WhatsApp JOLIE</button><button onClick={openStoreMap}>Buka Lokasi di Peta</button><button onClick={()=>{navigator.clipboard?.writeText("+6285235356666");setAiMessage("Nomor WhatsApp JOLIE sudah disalin: +62 852-3535-6666.");}}>Salin Nomor</button></div>
        </section>
      </section>

      <aside className="side-column">
        <div className="ai-card" id="ai-advisor"><div className="ai-head"><div className="ai-avatar">👩🏻‍💼</div><div><h3>JOLIE AI Companion</h3><p>Asisten JOLIE untuk produk, kebutuhan ternak, dan layanan.</p></div></div>
          <div className="quick-actions">{["Rekomendasi pakan sesuai jenis ternak","Hitung kebutuhan pakan","Cek status pesanan saya","Panduan perawatan ternak","Tanya seputar produk dan layanan"].map(x=><button key={x} onClick={()=>askAi(x)}><MessageCircle size={14}/>{x}</button>)}</div>
          {aiMessage && <div className="ai-response">{aiMessage}</div>}
          <div className="chat-input"><input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAi()} placeholder="Tulis pesan Anda..."/><button onClick={()=>askAi()}><Send size={15}/></button></div>
        </div>
        <div className="vet-card"><span className="premium">SAFE TRIAGE</span><Sparkles size={22}/><h3>Dokter Hewan Virtual</h3><p>Asisten informasi awal untuk membantu menyusun keluhan. Bukan pengganti pemeriksaan dokter hewan.</p>
          <div className="vet-form"><input value={vetInput.animal} onChange={e=>setVetInput(v=>({...v,animal:e.target.value}))} placeholder="Jenis hewan"/><input value={vetInput.age} onChange={e=>setVetInput(v=>({...v,age:e.target.value}))} placeholder="Usia (opsional)"/><input value={vetInput.symptoms} onChange={e=>setVetInput(v=>({...v,symptoms:e.target.value}))} placeholder="Gejala/keluhan"/><input value={vetInput.duration} onChange={e=>setVetInput(v=>({...v,duration:e.target.value}))} placeholder="Sejak kapan?"/><button onClick={runVet}>Analisis Awal <ArrowRight size={15}/></button></div>
          {vetMessage && <div className="vet-response">{vetMessage}</div>}</div>
        <div className="register-card"><div><h3>{user ? "Anda sudah terdaftar" : "Jadi Pelanggan Terdaftar"}</h3><p>Pesanan, profil, alamat, dan loyalty akan tersimpan aman setelah login.</p><button onClick={()=>user?signOut():(setAuthMode("signup"),setAuthOpen(true))}>{user ? "Keluar" : "Daftar Sekarang"}</button></div><span>👨🏻‍🌾</span></div>
        <div className="tips-card" id="artikel"><div className="section-heading"><h3>Info & Tips Terbaru</h3><a href="#artikel" onClick={e=>{e.preventDefault();setArticleOpen("all")}}>Lihat Semua <ArrowRight size={13}/></a></div>
          <button className="tip-article" onClick={()=>setArticleOpen("feed")}><div className="tip-placeholder">PAKAN</div><div><b>Memilih pakan sesuai kebutuhan ternak</b><span>Checklist praktis JOLIE</span></div></button>
          <button className="tip-article" onClick={()=>setArticleOpen("storage")}><div className="tip-placeholder">SIMPAN</div><div><b>Menjaga pakan tetap kering dan bersih</b><span>Manajemen penyimpanan</span></div></button>
          <button className="tip-article" onClick={()=>setArticleOpen("water")}><div className="tip-placeholder">AIR</div><div><b>Perhatikan air dan lingkungan pemeliharaan</b><span>Tips dasar peternakan/perikanan</span></div></button></div>
      </aside>
    </main>

    <div className="floating-chat" onClick={()=>setChatOpen(v=>!v)}><MessageCircle/></div>
    {chatOpen && <div className="toast-chat"><b>JOLIE AI Companion</b><span>Butuh bantuan memilih pakan?</span><button onClick={()=>setChatOpen(false)}><X size={14}/></button></div>}

    {authOpen && <div className="modal-backdrop" onClick={()=>setAuthOpen(false)}><div className="modal-card" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={()=>setAuthOpen(false)}><X size={18}/></button>
      <div className="brand modal-brand"><div className="brand-mark">🌿</div><div><strong>JOLIE</strong><span>Pelanggan</span></div></div>
      <h2>{authMode === "login" ? "Masuk ke JOLIE" : "Buat Akun JOLIE"}</h2>
      <p className="modal-sub">{authMode === "login" ? "Kelola pesanan dan profil Anda." : "Daftar untuk menyimpan pesanan dan profil."}</p>
      <form onSubmit={submitAuth}>
        {authMode === "signup" && <input className="modal-input" value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Nama lengkap" required/>}
        <input className="modal-input" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Email" required/>
        <input className="modal-input" type="password" minLength={6} value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="Password" required/>
        {authMessage && <div className="modal-message">{authMessage}</div>}
        <button className="modal-primary" disabled={authBusy}>{authBusy ? "Memproses..." : authMode === "login" ? "Masuk" : "Buat Akun"}</button>
      </form>
      {user && <button className="modal-secondary" onClick={signOut}><LogOut size={15}/> Keluar</button>}
      <button className="modal-switch" onClick={()=>{setAuthMode(authMode==="login"?"signup":"login");setAuthMessage("");}}>{authMode==="login"?"Belum punya akun? Buat Akun":"Sudah punya akun? Masuk"}</button>
    </div></div>}

    {articleOpen && <div className="modal-backdrop" onClick={()=>setArticleOpen(null)}><div className="modal-card article-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setArticleOpen(null)}><X size={18}/></button><span className="eyebrow">JOLIE KNOWLEDGE</span><h2>{articleOpen==="storage"?"Penyimpanan Pakan yang Baik":articleOpen==="water"?"Air dan Lingkungan Pemeliharaan":"Memilih Pakan Sesuai Kebutuhan Ternak"}</h2><p>{articleOpen==="storage"?"Simpan pakan di tempat kering, bersih, berventilasi baik, terlindung dari air dan hama. Gunakan kemasan yang tertutup dan terapkan rotasi stok agar produk lama tidak tertinggal.":articleOpen==="water"?"Pastikan air minum/air budidaya sesuai kebutuhan hewan dan pantau kebersihan lingkungan. Untuk ikan, kualitas air menjadi bagian penting dari manajemen budidaya.": "Mulai dari jenis hewan, umur/fase, tujuan pemeliharaan, kondisi tubuh, serta label produk. Jangan mengganti pakan secara mendadak tanpa pertimbangan; perhatikan respons ternak dan konsultasikan bila ada masalah."}</p><button className="modal-primary" onClick={()=>{setArticleOpen(null);openWhatsApp("Halo JOLIE, saya ingin konsultasi tentang "+(articleOpen==="storage"?"penyimpanan pakan":articleOpen==="water"?"kualitas air":"pemilihan pakan"));}}>Konsultasi ke JOLIE</button></div></div>}

    {cartOpen && <div className="drawer-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}>
      <div className="drawer-head"><div><b>Keranjang JOLIE</b><span>{cartCount} item</span></div><button onClick={()=>setCartOpen(false)}><X/></button></div>
      <div className="drawer-items">{cart.length ? cart.map(item=><div className="drawer-item" key={item.id}><div className="drawer-thumb">{item.image_url?<img src={item.image_url} alt=""/>:"J"}</div><div className="drawer-info"><b>{item.name}</b><span>{item.is_demo ? "Harga preview" : money(item.price)+" / "+(item.unit || "unit")}</span><div className="qty"><button onClick={()=>changeQty(item.id,-1)}><Minus size={13}/></button><strong>{item.quantity}</strong><button onClick={()=>changeQty(item.id,1)}><Plus size={13}/></button></div></div><strong>{money(Number(item.price)*item.quantity)}</strong></div>) : <div className="drawer-empty">Keranjang masih kosong.</div>}</div>
      <div className="drawer-foot"><div><span>Total</span><strong>{money(cartTotal)}</strong></div>{orderMessage && <div className="order-message">{orderMessage}</div>}<button className="modal-primary" disabled={!cart.length} onClick={checkout}>Buat Pesanan</button><small>Produk preview tidak masuk ke database pesanan.</small></div>
    </aside></div>}
  </div>;
}

export default App;
