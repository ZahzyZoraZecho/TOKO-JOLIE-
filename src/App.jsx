import React from "react";
import {
  Search, MapPin, UserRound, ShoppingCart, Menu, ChevronDown, ArrowRight, SlidersHorizontal, Eye, ZoomIn, Gift, ArrowUp, CheckCircle2, Clock3, XCircle, ChevronRight, RotateCcw, Sparkle,
  Truck, ShieldCheck, Headphones, Home, Sparkles, MessageCircle, Send, X,
  LogOut, Minus, Plus, Leaf, Wheat, Beef, Fish, Bird, Pill, Package, Wrench, Bot, UserRoundPlus, BadgeCheck
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

function categoryIcon(name) {
  const n = String(name || "").toLowerCase();
  if (/ayam|unggas|poultry/.test(n)) return <Bird size={30} strokeWidth={1.8}/>;
  if (/sapi|kerbau|ruminansia/.test(n)) return <Beef size={30} strokeWidth={1.8}/>;
  if (/kambing|domba/.test(n)) return <Wheat size={30} strokeWidth={1.8}/>;
  if (/ikan|fish|perikanan/.test(n)) return <Fish size={30} strokeWidth={1.8}/>;
  if (/obat|vitamin|kesehatan/.test(n)) return <Pill size={30} strokeWidth={1.8}/>;
  if (/aksesori|aksesoris|peralatan|alat/.test(n)) return <Wrench size={30} strokeWidth={1.8}/>;
  if (/pakan|ternak|peternakan|pertanian/.test(n)) return <Wheat size={30} strokeWidth={1.8}/>;
  return <Package size={30} strokeWidth={1.8}/>;
}

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
  const [activeCategory,setActiveCategory]=React.useState("");
  const [sortBy,setSortBy]=React.useState("featured");
  const [stockFilter,setStockFilter]=React.useState("all");
  const [advancedSearch,setAdvancedSearch]=React.useState(false);
  const [megaOpen,setMegaOpen]=React.useState(false);
  const [quickView,setQuickView]=React.useState(null);
  const [zoomImage,setZoomImage]=React.useState(false);
  const [recentlyViewed,setRecentlyViewed]=React.useState([]);
  const [cartNote,setCartNote]=React.useState(()=>localStorage.getItem("jolie-cart-note")||"");
  const [giftWrap,setGiftWrap]=React.useState(false);
  const [fulfillment,setFulfillment]=React.useState("delivery");
  const [promoOpen,setPromoOpen]=React.useState(()=>sessionStorage.getItem("jolie-promo-seen")!=="1");
  const [showTop,setShowTop]=React.useState(false);
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

  const catalogProducts = products.length ? products : fallbackCatalog;
  React.useEffect(()=>{try{const ids=JSON.parse(localStorage.getItem("jolie-recently-viewed")||"[]");setRecentlyViewed(catalogProducts.filter(p=>ids.includes(p.id)));}catch{}},[products]);
  React.useEffect(()=>{const on=()=>setShowTop(window.scrollY>500);window.addEventListener("scroll",on,{passive:true});return()=>window.removeEventListener("scroll",on)},[]);
  React.useEffect(()=>{localStorage.setItem("jolie-cart-note",cartNote)},[cartNote]);

  if (businessOsOpen) return <BusinessOS user={user} onBack={()=>{ window.location.href = "./"; }} />;

  const filteredProducts=[...catalogProducts].filter(p=>{const q=query.trim().toLowerCase();const text=[p.name,p.description,p.unit].map(v=>String(v||"").toLowerCase()).join(" ");const categoryMatch=!activeCategory||String(p.category_id||"")===String(activeCategory);const stockMatch=stockFilter==="all"||(stockFilter==="available"&&Number(p.stock_qty)>0)||(stockFilter==="low"&&Number(p.stock_qty)>0&&Number(p.stock_qty)<=5)||(stockFilter==="out"&&Number(p.stock_qty)<=0);return(!q||text.includes(q))&&categoryMatch&&stockMatch}).sort((a,b)=>sortBy==="price-asc"?Number(a.price||0)-Number(b.price||0):sortBy==="price-desc"?Number(b.price||0)-Number(a.price||0):sortBy==="name"?String(a.name).localeCompare(String(b.name)):Number(b.is_featured)-Number(a.is_featured));
  const rememberProduct=p=>{if(!p)return;setRecentlyViewed(prev=>{const next=[p,...prev.filter(x=>x.id!==p.id)].slice(0,6);localStorage.setItem("jolie-recently-viewed",JSON.stringify(next.map(x=>x.id)));return next})};

  function addToCart(product) {
    rememberProduct(product);
    if (product.price == null) return;
    setCart(items => {
      const found = items.find(x => x.id === product.id);
      return found
        ? items.map(x => x.id === product.id ? { ...x, quantity: x.quantity + 1 } : x)
        : [...items, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function quickBuy(product){rememberProduct(product);if(product.price==null){openWhatsApp("Halo JOLIE, saya ingin quick buy produk: "+product.name);return;}addToCart(product);}
  function openQuickView(product){rememberProduct(product);setQuickView(product);setZoomImage(false);}
  function changeQty(id, delta) {
    setCart(items => items.map(x => x.id === id ? { ...x, quantity: Math.max(0, x.quantity + delta) } : x).filter(x => x.quantity > 0));
  }

  const cartCount = cart.reduce((n, x) => n + x.quantity, 0);
  const cartTotal = cart.reduce((n, x) => n + Number(x.price || 0) * x.quantity, 0);
  const lowStockCount=p=>Number(p.stock_qty)>0&&Number(p.stock_qty)<=5;
  const recommendedProducts=catalogProducts.filter(p=>!cart.some(c=>c.id===p.id)).slice(0,4);

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

/* JOLIE commerce experience: Flux-inspired UX patterns, implemented natively for JOLIE */
.promo-banner{position:relative;display:flex;align-items:center;justify-content:center;gap:22px;padding:10px 52px;background:#073f2d;color:#fff;font-size:11px}.promo-banner>div:first-child{display:flex;gap:10px;align-items:center}.promo-banner b{display:block}.promo-banner span{opacity:.82}.promo-count{display:flex;gap:6px;align-items:center;font-weight:800}.promo-banner>button{position:absolute;right:20px;border:0;background:transparent;color:#fff;cursor:pointer}.mega-menu{position:absolute;left:0;right:0;top:100%;background:#fff;border-bottom:1px solid #dce7e1;box-shadow:0 14px 30px #0002;z-index:50}.mega-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:16px 0}.mega-grid button{border:1px solid #e1ebe6;background:#f8fbf9;border-radius:12px;padding:13px;text-align:left;display:grid;grid-template-columns:36px 1fr;gap:2px 8px;cursor:pointer}.mega-grid button span{grid-row:span 2;color:#08764d}.mega-grid button b{font-size:10px}.mega-grid button small{font-size:8px;color:#74877f}.breadcrumb{display:flex;align-items:center;gap:4px;color:#7b8d86;font-size:9px;margin-bottom:9px}.breadcrumb b{color:#31574a}.advanced-search{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;background:#f4f9f6;border:1px solid #dce8e2;border-radius:10px;padding:10px;margin:8px 0}.advanced-search label{display:block;font-size:8px;color:#75877f;margin-bottom:4px}.advanced-search select,.advanced-search>div>span,.advanced-search>div>b{width:100%;display:block;border:1px solid #d9e6df;background:#fff;border-radius:7px;padding:8px;font-size:9px}.product-image-interactive{position:relative;cursor:zoom-in}.product-image-interactive>img{transition:transform .25s ease}.product-image-interactive:hover>img{transform:scale(1.045)}.quick-view-icon{position:absolute!important;right:7px;top:7px;width:30px!important;height:30px;padding:0!important;background:#fff!important;color:#08764d!important;border:1px solid #dce7e1!important;border-radius:50%!important;opacity:0;transition:opacity .2s}.product-card:hover .quick-view-icon{opacity:1}.stock-counter{display:flex;align-items:center;gap:4px;font-size:8px;color:#168057;font-weight:800;margin:5px 0}.stock-counter.low{color:#b36a17}.product-actions{display:flex;gap:5px}.product-actions>button:first-child{width:38px!important;flex:0 0 38px}.product-actions>button:last-child{flex:1}.quick-buy{background:#f0f7f3!important;color:#08764d!important;border:1px solid #cfe3d9!important}.recently-viewed{margin-top:12px}.mini-products{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:10px}.mini-products button{border:1px solid #dce7e1;background:#fff;border-radius:10px;padding:7px;text-align:left;cursor:pointer}.mini-products img{width:100%;height:90px;object-fit:cover;border-radius:7px;background:#eef6f1}.mini-products b,.mini-products span{display:block}.mini-products b{font-size:9px;margin-top:6px}.mini-products span{font-size:8px;color:#08764d;margin-top:3px}.product-quick-modal{width:min(820px,100%);display:grid;grid-template-columns:1fr 1fr;gap:20px}.quick-main-image{height:330px;background:#f0f7f3;border-radius:12px;overflow:hidden;position:relative;cursor:zoom-in}.quick-main-image img{width:100%;height:100%;object-fit:contain}.quick-main-image span{position:absolute;right:8px;bottom:8px;display:flex;gap:4px;align-items:center;background:#fff;border:1px solid #dce7e1;border-radius:20px;padding:5px 8px;font-size:8px}.quick-copy{display:flex;flex-direction:column}.quick-price{font-size:21px;color:#08764d;margin:10px 0}.quick-tabs{display:grid;gap:7px;margin:12px 0;padding:12px;background:#f4f9f6;border-radius:10px;font-size:9px;color:#60776d}.image-zoom-layer img{max-width:90vw;max-height:88vh;object-fit:contain;background:#fff;border-radius:14px;padding:12px}.cart-options{display:grid;gap:7px;margin-bottom:9px;font-size:9px}.cart-options label{display:flex;gap:6px;align-items:center}.cart-note{width:100%;min-height:55px;border:1px solid #dce7e1;border-radius:8px;padding:8px;resize:vertical;font:inherit;font-size:9px;margin-bottom:10px}.sticky-cart{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:60;width:min(720px,calc(100% - 28px));background:#fff;border:1px solid #cfe0d8;box-shadow:0 15px 40px #0003;border-radius:14px;padding:9px 11px;display:flex;justify-content:space-between;align-items:center}.sticky-cart>div{display:flex;align-items:center;gap:9px;color:#31574a}.sticky-cart span{color:#08764d;font-weight:900}.sticky-cart button{border:0;background:#08764d;color:#fff;border-radius:8px;padding:9px 14px;font-weight:800;font-size:9px}.back-top{position:fixed;right:22px;bottom:85px;z-index:55;width:42px;height:42px;border:1px solid #dce7e1;background:#fff;color:#08764d;border-radius:50%;box-shadow:0 8px 22px #0002}.top-header{position:sticky;top:0;z-index:40;background:#fff}.nav-row{position:relative}.mega-menu+.x{}.modal-sub{color:#70837b;font-size:10px}.search-box{position:relative}.search-box button{cursor:pointer}.promo-banner+main{}.promo-banner{animation:jolieFade .35s ease}@keyframes jolieFade{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
@media(max-width:900px){.mega-grid{grid-template-columns:repeat(3,1fr)}.mini-products{grid-template-columns:repeat(2,1fr)}.product-quick-modal{grid-template-columns:1fr}.quick-main-image{height:260px}.advanced-search{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.promo-banner{padding:9px 35px 9px 12px;display:block}.promo-count{margin-top:4px}.mega-grid{grid-template-columns:repeat(2,1fr);padding:10px}.advanced-search{grid-template-columns:1fr}.sticky-cart{bottom:8px}.sticky-cart button{padding:8px}.product-quick-modal{padding:18px}}

/* JOLIE STOREFRONT — Bootstrap 5 inspired redesign */
:root{--bs-success:#08764d;--bs-success-rgb:8,118,77;--bs-primary:#08764d;--bs-body-bg:#f8f9fa}
.app-shell{background:#f8f9fa!important;color:#212529!important;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif!important}
.app-shell .top-header{background:#fff!important;border-bottom:1px solid #dee2e6!important;box-shadow:0 .125rem .5rem rgba(0,0,0,.04)!important}
.app-shell .header-main{height:74px!important}.app-shell .brand strong{font-size:1.65rem!important;letter-spacing:-1px!important;color:#08764d!important}.app-shell .brand span{font-size:.68rem!important;color:#6c757d!important}
.app-shell .brand-mark{display:grid!important;place-items:center!important;width:40px;height:40px;border-radius:.75rem;background:#eaf6ef;color:#08764d!important}
.app-shell .search-box{height:44px!important;border:1px solid #ced4da!important;border-radius:.5rem!important;background:#fff!important}
.app-shell .search-box:focus-within{border-color:#70b394!important;box-shadow:0 0 0 .2rem rgba(8,118,77,.12)!important}.app-shell .search-box button{background:#08764d!important}
.app-shell .header-action,.app-shell .header-cart{border:0!important;background:transparent!important;color:#212529!important;cursor:pointer}.app-shell .header-action svg,.app-shell .header-cart svg{color:#08764d!important}
.app-shell .nav-row{background:#08764d!important;border:0!important}.app-shell .nav-inner{height:48px!important}.app-shell .category-btn{background:#075b3d!important;border:1px solid rgba(255,255,255,.15)!important;border-radius:.4rem!important}
.app-shell .nav-inner a{color:#fff!important;font-size:.76rem!important;padding:.85rem .15rem!important;opacity:.9}.app-shell .nav-inner a.active,.app-shell .nav-inner a:hover{opacity:1!important;color:#d8f4e6!important}
.app-shell .promo-banner{background:#212529!important;padding:.55rem 1rem!important;font-size:.76rem!important}
.app-shell .page-grid{width:min(1320px,calc(100% - 32px))!important;grid-template-columns:minmax(0,1fr) 320px!important;gap:1.25rem!important;padding-top:1.25rem!important}
.app-shell .hero{height:340px!important;border-radius:1rem!important;box-shadow:0 .5rem 1.5rem rgba(0,0,0,.12)!important}.app-shell .hero-overlay{background:linear-gradient(90deg,rgba(7,63,45,.93),rgba(7,63,45,.48),rgba(7,63,45,.08))!important}.app-shell .hero-content{padding:2.5rem!important}.app-shell .hero-content h1{font-size:2.55rem!important;font-weight:800!important}
.app-shell .primary-btn,.app-shell .hero-content button{border:0!important;border-radius:.5rem!important;background:#f0a43a!important;color:#212529!important;box-shadow:0 .25rem .7rem rgba(0,0,0,.12)!important}
.app-shell .section-card,.app-shell .products-section,.app-shell .info-card,.app-shell .ai-card,.app-shell .tips-card{background:#fff!important;border:1px solid #dee2e6!important;border-radius:.75rem!important;box-shadow:0 .125rem .4rem rgba(0,0,0,.035)!important}.app-shell .section-card,.app-shell .products-section{padding:1.15rem!important}
.app-shell .section-heading h2{font-size:1.15rem!important;font-weight:700!important}.app-shell .category-grid{gap:.75rem!important}.app-shell .category-item{border:1px solid #e9ecef!important;border-radius:.65rem!important;background:#fff!important;padding:.7rem .4rem!important;cursor:pointer;transition:.15s}.app-shell .category-item:hover{border-color:#a8d3bc!important;background:#f1faf5!important;transform:translateY(-2px)}.app-shell .category-item div{width:56px!important;height:56px!important;background:#eaf6ef!important;color:#08764d!important}
.app-shell .product-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:1rem!important}.app-shell .product-card{border:1px solid #dee2e6!important;border-radius:.7rem!important;padding:.75rem!important;box-shadow:0 .125rem .35rem rgba(0,0,0,.025)!important;transition:.15s ease}.app-shell .product-card:hover{transform:translateY(-3px);box-shadow:0 .5rem 1.2rem rgba(8,118,77,.09)!important;border-color:#a8d3bc!important}
.app-shell .product-image{height:185px!important;border-radius:.55rem!important;background:#f1f3f5!important}.app-shell .product-card h3{font-size:.88rem!important;font-weight:700!important}.app-shell .product-card small,.app-shell .product-desc{font-size:.72rem!important;color:#6c757d!important}.app-shell .product-card>strong{font-size:1rem!important;color:#08764d!important}.app-shell .product-card button,.app-shell .ask-price{border-radius:.45rem!important;background:#08764d!important;padding:.6rem .45rem!important;font-size:.72rem!important}.app-shell .product-actions>button:first-child{background:#eaf6ef!important;color:#08764d!important}
.app-shell .pill{border-radius:50rem!important;padding:.4rem .7rem!important;font-size:.7rem!important}.app-shell .pill.active{background:#08764d!important}.app-shell .side-column{gap:1rem!important}.app-shell .ai-card,.app-shell .tips-card{padding:1rem!important}.app-shell .ai-head{background:#eaf6ef!important;border-radius:.6rem!important}.app-shell .ai-head h3{font-size:.95rem!important}.app-shell .quick-actions button{border:1px solid #dee2e6!important;border-radius:.45rem!important;font-size:.72rem!important;padding:.55rem .7rem!important}.app-shell .quick-actions button:hover{border-color:#87bda6!important;background:#f8fbf9!important}
.app-shell .register-card{border:1px solid #cfe5d8!important;border-radius:.75rem!important}.app-shell .service-strip{border:1px solid #cfe5d8!important;border-radius:.75rem!important;background:#eaf6ef!important}.app-shell .mega-menu{box-shadow:0 .75rem 2rem rgba(0,0,0,.12)!important}.app-shell .mega-grid button{border-radius:.55rem!important;background:#fff!important}.app-shell .sticky-cart{border-radius:.75rem!important;box-shadow:0 .75rem 2rem rgba(0,0,0,.16)!important}.app-shell .sticky-cart button{background:#08764d!important;border-radius:.45rem!important}
@media(max-width:1100px){.app-shell .product-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}@media(max-width:720px){.app-shell .page-grid{width:calc(100% - 20px)!important}.app-shell .hero{height:360px!important}.app-shell .hero-content{padding:1.6rem!important}.app-shell .hero-content h1{font-size:2rem!important}.app-shell .product-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.app-shell .product-image{height:145px!important}}



/* Final storefront layer: Flux/Paws-inspired commerce rhythm using Bootstrap 5 tokens. */
.app-shell .top-header{backdrop-filter:blur(14px)!important;box-shadow:0 1px 0 rgba(20,55,43,.06),0 10px 30px rgba(20,55,43,.04)!important}
.app-shell .header-main{width:min(1400px,calc(100% - 40px))!important}
.app-shell .hero{border-radius:24px!important;box-shadow:0 16px 45px rgba(23,61,47,.12)!important}
.app-shell .hero-content h1{font-size:clamp(2.7rem,5vw,4.4rem)!important;letter-spacing:-3px!important;font-weight:800!important}
.app-shell .category-item{border:1px solid #e5ece8!important;border-radius:16px!important;background:#fff!important;transition:.18s ease!important}
.app-shell .category-item:hover{transform:translateY(-3px)!important;box-shadow:0 10px 24px rgba(8,118,77,.08)!important}
.app-shell .product-card{border-radius:16px!important;box-shadow:0 6px 22px rgba(20,55,43,.045)!important}
.app-shell .product-card:hover{transform:translateY(-4px)!important;box-shadow:0 14px 34px rgba(8,118,77,.11)!important}
.app-shell .product-image{height:205px!important;border-radius:12px!important}
.app-shell .product-card button{border-radius:999px!important;min-height:40px!important}
.app-shell .service-strip,.app-shell .promo-card,.app-shell .ai-card,.app-shell .tips-card,.app-shell .register-card{border-radius:16px!important}
@media(max-width:900px){.app-shell .page-grid{grid-template-columns:1fr!important}.app-shell .side-column{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:640px){.app-shell .side-column{grid-template-columns:1fr!important}.app-shell .hero-content{padding:32px 26px!important}.app-shell .hero-content h1{font-size:2.5rem!important;letter-spacing:-1.8px!important}}
`;
  return <div className="app-shell"><style>{uiStyle}</style>
    <header className="top-header">
      <div className="header-main container">
        <div className="brand"><div className="brand-mark"><Leaf size={22} strokeWidth={2.2}/></div><div><strong>JOLIE</strong><span>Pakan & Kebutuhan Ternak</span></div></div>
        <div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scrollTo("produk")} placeholder="Cari produk, kategori, atau kebutuhan ternak..."/><button aria-label="Pencarian lanjutan" onClick={()=>setAdvancedSearch(v=>!v)}><SlidersHorizontal size={16}/></button><button aria-label="Cari" onClick={()=>scrollTo("produk")}><Search size={17}/></button></div>
        <button className="header-action" onClick={openStoreMap}><MapPin size={18}/><div><b>Lokasi Toko</b><span>Jalan Raya Taji–Tinggang</span></div></button>
        <button className="header-action account" onClick={()=>setAuthOpen(true)}><UserRound size={18}/><div><b>{user ? "Akun Saya" : "Masuk / Buat Akun"}</b><span>{user?.email || "Masuk ke JOLIE"}</span></div></button>
        <button className="header-cart" onClick={()=>setCartOpen(true)}><ShoppingCart/><span className="cart-badge">{cartCount}</span><div><b>Keranjang</b><small>{cartCount} item</small></div></button>
      </div>
      <div className="nav-row"><div className="container nav-inner">
        <button className="category-btn" onClick={()=>setMegaOpen(v=>!v)}><Menu size={18}/> Semua Kategori <ChevronDown size={16}/></button>
        <nav>{[
          ["Beranda","beranda"],["Produk","produk"],["Layanan","layanan"],["AI Advisor","ai-advisor"],
          ["Artikel & Tips","artikel"],["Tentang Kami","tentang"],["Kontak","kontak"],
          ["Business OS","business-os"]
        ].map(([n,id],i)=><a key={n} className={i===0?"active":""} href={"#"+id} onClick={e=>{e.preventDefault();if(id==="business-os"){window.location.href="./business-os/";return;}scrollTo(id)}}>{n}{n==="Produk"||n==="Layanan"?<ChevronDown size={12}/>:null}</a>)}</nav>
      </div></div>
      {megaOpen&&<div className="mega-menu"><div className="container"><div className="mega-grid">{categories.map(c=><button key={c.id} onClick={()=>{setActiveCategory(c.id);setQuery("");setMegaOpen(false);scrollTo("produk")}}><span>{categoryIcon(c.name)}</span><b>{c.name}</b><small>Lihat produk</small></button>)}<button onClick={()=>{setActiveCategory("");setMegaOpen(false);scrollTo("produk")}}><span>▦</span><b>Semua Produk</b><small>Seluruh katalog</small></button></div></div></div>}
    </header>

    {promoOpen&&<div className="promo-banner"><div><b>Promo JOLIE minggu ini</b><span>Katalog resmi, layanan konsultasi, dan opsi pengiriman atau ambil di toko.</span></div><div className="promo-count"><Clock3 size={15}/> JOLIE Store</div><button onClick={()=>{setPromoOpen(false);sessionStorage.setItem("jolie-promo-seen","1")}}><X size={16}/></button></div>}<main className="container page-grid" id="beranda">
      <section className="main-column">
        <section className="hero"><img src={heroImage} alt="Peternakan JOLIE"/><div className="hero-overlay"/><div className="hero-content">
          <p>JOLIE · Solusi Lengkap Kebutuhan Pakan dan Ternak</p>
          <h1>Pakan Berkualitas<br/>untuk Hasil Maksimal</h1>
          <span>Mendukung peternakan, perikanan, dan pertanian Anda<br/>dengan produk terbaik, harga bersaing, dan layanan profesional.</span>
          <button className="primary-btn" onClick={()=>scrollTo("produk")}>Belanja Sekarang <ArrowRight size={18}/></button>
          <div className="hero-points"><span><BadgeCheck size={13}/> Produk Original</span><span><BadgeCheck size={13}/> Harga Terbaik</span><span><Truck size={13}/> Pengiriman Cepat</span><span><Headphones size={13}/> Layanan Konsultasi</span></div>
        </div></section>

        <section className="section-card category-section" id="kategori"><div className="section-heading"><h2>Kategori Produk</h2><a href="#kategori" onClick={e=>{e.preventDefault();document.getElementById("kategori")?.scrollIntoView({behavior:"smooth"})}}>Lihat Semua <ArrowRight size={15}/></a></div>
          <div className="category-grid">{categories.map(c=><button className="category-item" key={c.id} onClick={()=>{setQuery(c.name);scrollTo("produk")}}><div aria-hidden="true">{categoryIcon(c.name)}</div><span>{c.name}</span></button>)}</div>
          {!loading && categories.length===0 && <p className="catalog-empty">Kategori belum tersedia.</p>}
        </section>

        <section className="products-section" id="produk"><div className="breadcrumb"><span>Beranda</span><ChevronRight size={12}/><span>Produk</span>{activeCategory&&<><ChevronRight size={12}/><b>{categories.find(c=>c.id===activeCategory)?.name||"Kategori"}</b></>}</div><div className="section-heading"><div className="heading-tabs"><h2>Produk Pilihan</h2><button className={"pill "+(sortBy==="featured"?"active":"")} onClick={()=>setSortBy("featured")}>Unggulan</button><button className={"pill "+(sortBy==="name"?"active":"")} onClick={()=>setSortBy("name")}>A-Z</button></div><a href="#produk" onClick={e=>{e.preventDefault();setQuery("");setActiveCategory("");setStockFilter("all")}}>Reset <RotateCcw size={13}/></a></div>{advancedSearch&&<div className="advanced-search"><div><label>Ketersediaan</label><select value={stockFilter} onChange={e=>setStockFilter(e.target.value)}><option value="all">Semua</option><option value="available">Tersedia</option><option value="low">Stok menipis</option><option value="out">Habis</option></select></div><div><label>Urutkan</label><select value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="featured">Unggulan</option><option value="price-asc">Harga terendah</option><option value="price-desc">Harga tertinggi</option><option value="name">Nama</option></select></div><div><label>Hasil</label><b>{filteredProducts.length} produk</b></div></div>}
          {loading ? <div className="catalog-state">Memuat katalog JOLIE…</div> :
          filteredProducts.length ? <><div className="product-grid">{filteredProducts.slice(0,12).map(p=><article className="product-card" key={p.id}>
            {p.is_demo && <span className="product-tag promo">PREVIEW</span>}
            {p.compare_at_price && p.compare_at_price > p.price && <span className="product-tag promo">Promo</span>}
            <div className="product-image product-image-interactive" onClick={()=>openQuickView(p)}>{p.image_url ? <img src={p.image_url} alt={p.name}/> : <div className="product-image-placeholder">JOLIE</div>}<button className="quick-view-icon" onClick={e=>{e.stopPropagation();openQuickView(p)}}><Eye size={15}/></button></div>
            <h3>{p.name}</h3><small>{p.unit || "Detail produk tersedia melalui JOLIE"}</small>
            <p className="product-desc">{p.description || "Keterangan produk akan dilengkapi berdasarkan data katalog JOLIE."}</p>
            <div className="rating"><span>★★★★★</span><em> JOLIE</em></div>{p.price!=null&&<div className={"stock-counter "+(lowStockCount(p)?"low":"")}>{Number(p.stock_qty)>0?<><CheckCircle2 size={12}/> {lowStockCount(p)?("Tersisa "+p.stock_qty):"Stok tersedia"}</>:<><XCircle size={12}/> Stok habis</>}</div>}<strong>{p.price == null ? "Harga via WhatsApp" : money(p.price)}</strong>
            {p.price == null
              ? <button className="ask-price" onClick={()=>openWhatsApp("Halo JOLIE, saya ingin menanyakan harga dan stok produk: "+p.name)}><MessageCircle size={15}/> Tanya Harga & Stok</button>
              : <div className="product-actions"><button className="quick-buy" onClick={()=>quickBuy(p)} disabled={Number(p.stock_qty)<=0}>⚡</button><button onClick={()=>addToCart(p)} disabled={Number(p.stock_qty) <= 0}><ShoppingCart size={15}/> Tambah ke Keranjang</button></div>}
          </article>)}</div>
          </> :
          <div className="catalog-state"><b>Katalog sedang diperbarui.</b><span>Hubungi JOLIE untuk mendapatkan informasi produk dan ketersediaan terbaru.</span></div>}
        </section><section className="recently-viewed section-card"><div className="section-heading"><h2>Baru Dilihat</h2><span className="eyebrow">Disimpan di perangkat ini</span></div><div className="mini-products">{recentlyViewed.map(p=><button key={p.id} onClick={()=>openQuickView(p)}><img src={p.image_url||productArt(p.name)}/><b>{p.name}</b><span>{p.price==null?"Tanya harga":money(p.price)}</span></button>)}</div></section><section className="section-card"><div className="section-heading"><h2>Rekomendasi JOLIE</h2><Sparkle size={16}/></div><div className="mini-products">{recommendedProducts.map(p=><button key={p.id} onClick={()=>openQuickView(p)}><img src={p.image_url||productArt(p.name)}/><b>{p.name}</b><span>{p.price==null?"Tanya harga":money(p.price)}</span></button>)}</div></section><section className="service-strip" id="layanan"><div><Truck/><b>Pengiriman Cepat</b><span>Pesanan diproses dengan teratur.</span></div><div><ShieldCheck/><b>Pembayaran Aman</b><span>Pilihan pembayaran akan terintegrasi.</span></div><div><Headphones/><b>Layanan Konsultasi</b><span>Tim JOLIE siap membantu.</span></div><div><Home/><b>Produk Berkualitas</b><span>Katalog dikelola dari data bisnis.</span></div></section>
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
        <div className="ai-card" id="ai-advisor"><div className="ai-head"><div className="ai-avatar"><Bot size={30} strokeWidth={1.8}/></div><div><h3>JOLIE AI Companion</h3><p>Asisten JOLIE untuk produk, kebutuhan ternak, dan layanan.</p></div></div>
          <div className="quick-actions">{["Rekomendasi pakan sesuai jenis ternak","Hitung kebutuhan pakan","Cek status pesanan saya","Panduan perawatan ternak","Tanya seputar produk dan layanan"].map(x=><button key={x} onClick={()=>askAi(x)}><MessageCircle size={14}/>{x}</button>)}</div>
          {aiMessage && <div className="ai-response">{aiMessage}</div>}
          <div className="chat-input"><input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAi()} placeholder="Tulis pesan Anda..."/><button onClick={()=>askAi()}><Send size={15}/></button></div>
        </div>
        <div className="vet-card"><span className="premium">SAFE TRIAGE</span><Sparkles size={22}/><h3>Dokter Hewan Virtual</h3><p>Asisten informasi awal untuk membantu menyusun keluhan. Bukan pengganti pemeriksaan dokter hewan.</p>
          <div className="vet-form"><input value={vetInput.animal} onChange={e=>setVetInput(v=>({...v,animal:e.target.value}))} placeholder="Jenis hewan"/><input value={vetInput.age} onChange={e=>setVetInput(v=>({...v,age:e.target.value}))} placeholder="Usia (opsional)"/><input value={vetInput.symptoms} onChange={e=>setVetInput(v=>({...v,symptoms:e.target.value}))} placeholder="Gejala/keluhan"/><input value={vetInput.duration} onChange={e=>setVetInput(v=>({...v,duration:e.target.value}))} placeholder="Sejak kapan?"/><button onClick={runVet}>Analisis Awal <ArrowRight size={15}/></button></div>
          {vetMessage && <div className="vet-response">{vetMessage}</div>}</div>
        <div className="register-card"><div><h3>{user ? "Anda sudah terdaftar" : "Jadi Pelanggan Terdaftar"}</h3><p>Pesanan, profil, alamat, dan loyalty akan tersimpan aman setelah login.</p><button onClick={()=>user?signOut():(setAuthMode("signup"),setAuthOpen(true))}>{user ? "Keluar" : "Daftar Sekarang"}</button></div><span className="register-icon"><UserRoundPlus size={34} strokeWidth={1.7}/></span></div>
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

    {quickView && <div className="modal-backdrop" onClick={()=>setQuickView(null)}><div className="modal-card product-quick-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setQuickView(null)}><X size={18}/></button><div className="quick-gallery"><div className="quick-main-image" onClick={()=>setZoomImage(v=>!v)}><img src={quickView.image_url||productArt(quickView.name)} alt={quickView.name}/><span><ZoomIn size={13}/> Zoom</span></div></div><div className="quick-copy"><span className="eyebrow">JOLIE PRODUCT</span><h2>{quickView.name}</h2><p className="product-desc">{quickView.description||"Informasi produk sedang dilengkapi."}</p><strong className="quick-price">{quickView.price==null?"Harga melalui JOLIE":money(quickView.price)}</strong><div className="quick-tabs"><b>Informasi</b><span>Penggunaan: ikuti label resmi produk.</span><span>Pengiriman: mengikuti area layanan JOLIE.</span><span>Keterangan: spesifikasi mengikuti katalog.</span></div><div className="form-actions"><button className="modal-primary" onClick={()=>{quickBuy(quickView);setQuickView(null)}}>{quickView.price==null?"Tanya Harga":"Beli Cepat"}</button><button className="modal-secondary" onClick={()=>{addToCart(quickView);setQuickView(null)}} disabled={quickView.price==null||Number(quickView.stock_qty)<=0}>Tambah ke Keranjang</button></div></div></div></div>}{zoomImage&&quickView&&<div className="modal-backdrop image-zoom-layer" onClick={()=>setZoomImage(false)}><img src={quickView.image_url||productArt(quickView.name)} alt={quickView.name}/></div>}{articleOpen && <div className="modal-backdrop" onClick={()=>setArticleOpen(null)}><div className="modal-card article-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setArticleOpen(null)}><X size={18}/></button><span className="eyebrow">JOLIE KNOWLEDGE</span><h2>{articleOpen==="storage"?"Penyimpanan Pakan yang Baik":articleOpen==="water"?"Air dan Lingkungan Pemeliharaan":"Memilih Pakan Sesuai Kebutuhan Ternak"}</h2><p>{articleOpen==="storage"?"Simpan pakan di tempat kering, bersih, berventilasi baik, terlindung dari air dan hama. Gunakan kemasan yang tertutup dan terapkan rotasi stok agar produk lama tidak tertinggal.":articleOpen==="water"?"Pastikan air minum/air budidaya sesuai kebutuhan hewan dan pantau kebersihan lingkungan. Untuk ikan, kualitas air menjadi bagian penting dari manajemen budidaya.": "Mulai dari jenis hewan, umur/fase, tujuan pemeliharaan, kondisi tubuh, serta label produk. Jangan mengganti pakan secara mendadak tanpa pertimbangan; perhatikan respons ternak dan konsultasikan bila ada masalah."}</p><button className="modal-primary" onClick={()=>{setArticleOpen(null);openWhatsApp("Halo JOLIE, saya ingin konsultasi tentang "+(articleOpen==="storage"?"penyimpanan pakan":articleOpen==="water"?"kualitas air":"pemilihan pakan"));}}>Konsultasi ke JOLIE</button></div></div>}

    {cartOpen && <div className="drawer-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}>
      <div className="drawer-head"><div><b>Keranjang JOLIE</b><span>{cartCount} item</span></div><button onClick={()=>setCartOpen(false)}><X/></button></div>
      <div className="drawer-items">{cart.length ? cart.map(item=><div className="drawer-item" key={item.id}><div className="drawer-thumb">{item.image_url?<img src={item.image_url} alt=""/>:"J"}</div><div className="drawer-info"><b>{item.name}</b><span>{item.is_demo ? "Harga preview" : money(item.price)+" / "+(item.unit || "unit")}</span><div className="qty"><button onClick={()=>changeQty(item.id,-1)}><Minus size={13}/></button><strong>{item.quantity}</strong><button onClick={()=>changeQty(item.id,1)}><Plus size={13}/></button></div></div><strong>{money(Number(item.price)*item.quantity)}</strong></div>) : <div className="drawer-empty">Keranjang masih kosong.</div>}</div>
      <div className="drawer-foot"><div className="cart-options"><label><input type="radio" checked={fulfillment==="delivery"} onChange={()=>setFulfillment("delivery")}/> Pengiriman</label><label><input type="radio" checked={fulfillment==="pickup"} onChange={()=>setFulfillment("pickup")}/> Ambil di toko</label><label><input type="checkbox" checked={giftWrap} onChange={e=>setGiftWrap(e.target.checked)}/> 🎁 Bungkus hadiah</label></div><textarea className="cart-note" value={cartNote} onChange={e=>setCartNote(e.target.value)} placeholder="Catatan pesanan untuk JOLIE…"></textarea><div><span>Total</span><strong>{money(cartTotal)}</strong></div>{orderMessage && <div className="order-message">{orderMessage}</div>}<button className="modal-primary" disabled={!cart.length} onClick={checkout}>Checkout / Buat Pesanan</button><small>{fulfillment==="pickup"?"Pengambilan di toko dipilih.":"Pengiriman dipilih."} {giftWrap?"Bungkus hadiah aktif.":""}</small></div>
    </aside></div>}
  {showTop&&<button className="back-top" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}><ArrowUp size={18}/></button>}{cart.length>0&&<div className="sticky-cart"><div><ShoppingCart size={17}/><b>{cartCount} item</b><span>{money(cartTotal)}</span></div><button onClick={()=>setCartOpen(true)}>Lihat Keranjang</button></div>}
  </div>;
}
export default App;
