import React from "react";
import {
  Search, MapPin, UserRound, ShoppingCart, Menu, ChevronDown, ArrowRight,
  Truck, ShieldCheck, Headphones, Home, Sparkles, MessageCircle, Send, X,
  LogOut, Minus, Plus
} from "lucide-react";
import { supabase } from "./lib/supabase";

const ORG_SLUG = "jolie-toko-pakan-jolie-gebang";
const heroImage = "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1800&q=85";

// Temporary visual catalog: open-license reference photos only.
// Demo prices are explicitly preview values and are never used for real checkout.
const demoCatalog = [
  { id:"demo-chicken", name:"Contoh Pakan Ayam", unit:"1 kg · preview", price:25000, stock_qty:10, is_demo:true, image_url:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Biochar_chicken_feed.jpg", license:"CC BY-SA 4.0" },
  { id:"demo-fish", name:"Contoh Pakan Ikan", unit:"1 kg · preview", price:30000, stock_qty:10, is_demo:true, image_url:"https://commons.wikimedia.org/wiki/Special:Redirect/file/EPIC_Feed-_Fish_Feed_-_A_Product_of_West_Bengal_Livestock_Development_Corporation_Limited_2020-09-20.jpg", license:"CC BY-SA 4.0" },
  { id:"demo-livestock", name:"Contoh Pakan Ternak", unit:"1 kg · preview", price:35000, stock_qty:10, is_demo:true, image_url:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Bag_with_bush-based_animal_fodder_pellets.jpg", license:"CC BY-SA 4.0" },
  { id:"demo-pellets", name:"Contoh Pellet Ternak", unit:"1 kg · preview", price:28000, stock_qty:10, is_demo:true, image_url:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Close-up_picture_of_pile_of_wood_bush-based_animal_fodder_pellets_in_Namibia.jpg", license:"CC BY-SA 4.0" },
  { id:"demo-chicken-feed", name:"Contoh Feed Supplement", unit:"1 botol · preview", price:45000, stock_qty:10, is_demo:true, image_url:"https://commons.wikimedia.org/wiki/Special:Redirect/file/Chicken_Feed.jpg", license:"CC BY 3.0" }
];

function money(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(value ?? 0);
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
        if (active) { setCatalogError(orgError.message); setLoading(false); }
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
        setCatalogError(catError?.message || prodError?.message || "");
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

  const catalogProducts = products.length ? products : demoCatalog;
  const isDemoCatalog = products.length === 0;
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
.ai-response{background:#f1f8f4;border:1px solid #d9ebe2;border-radius:10px;padding:10px;font-size:11px;line-height:1.5;margin:8px 0}.info-sections{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:18px}.info-card{background:#fff;border:1px solid #e0ebe6;border-radius:18px;padding:24px}.info-card h2{margin:6px 0 10px}.info-card p{color:#657970;line-height:1.6}.eyebrow{font-size:10px;font-weight:900;color:#08764d;letter-spacing:.12em}.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.info-grid div{background:#f4f8f6;border-radius:10px;padding:12px}.info-grid b,.info-grid span{display:block}.info-grid span{font-size:11px;color:#71827b;margin-top:4px}.contact-actions{display:flex;gap:10px;flex-wrap:wrap}.contact-actions button{border:0;border-radius:9px;background:#08764d;color:#fff;padding:10px 14px;font-weight:800}.contact-actions button+button{background:#eef5f1;color:#31574a}
@media(max-width:900px){.info-sections{grid-template-columns:1fr}.info-grid{grid-template-columns:1fr}}
`;
  return <div className="app-shell"><style>{uiStyle}</style>
    <header className="top-header">
      <div className="header-main container">
        <div className="brand"><div className="brand-mark">🌿</div><div><strong>JOLIE</strong><span>Pakan & Kebutuhan Ternak</span></div></div>
        <div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scrollTo("produk")} placeholder="Cari produk, kategori, atau kebutuhan ternak..."/><button aria-label="Cari" onClick={()=>scrollTo("produk")}><Search size={17}/></button></div>
        <button className="header-action" onClick={()=>scrollTo("kontak")}><MapPin size={18}/><div><b>Lokasi Toko</b><span>Jalan Raya Taji–Tinggang</span></div></button>
        <button className="header-action account" onClick={()=>setAuthOpen(true)}><UserRound size={18}/><div><b>{user ? "Akun Saya" : "Login / Daftar"}</b><span>{user?.email || "Masuk ke JOLIE"}</span></div></button>
        <button className="header-cart" onClick={()=>setCartOpen(true)}><ShoppingCart/><span className="cart-badge">{cartCount}</span><div><b>Keranjang</b><small>{cartCount} item</small></div></button>
      </div>
      <div className="nav-row"><div className="container nav-inner">
        <button className="category-btn" onClick={()=>scrollTo("kategori")}><Menu size={18}/> Semua Kategori <ChevronDown size={16}/></button>
        <nav>{[
          ["Beranda","beranda"],["Produk","produk"],["Layanan","layanan"],["AI Advisor","ai-advisor"],
          ["Artikel & Tips","artikel"],["Tentang Kami","tentang"],["Kontak","kontak"]
        ].map(([n,id],i)=><a key={n} className={i===0?"active":""} href={"#"+id} onClick={e=>{e.preventDefault();scrollTo(id)}}>{n}{n==="Produk"||n==="Layanan"?<ChevronDown size={12}/>:null}</a>)}</nav>
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
            <h3>{p.name}</h3><small>{p.unit || "Satuan belum diatur"}</small>
            <div className="rating"><span>★★★★★</span></div>
            <strong>{p.is_demo ? "Harga contoh · "+money(p.price) : (p.price == null ? "Harga belum diatur" : money(p.price))}</strong>
            <button onClick={()=>addToCart(p)} disabled={p.price == null || Number(p.stock_qty) <= 0}><ShoppingCart size={15}/> Tambah ke Keranjang</button>
          </article>)}</div>
          {isDemoCatalog && <div className="catalog-attribution">Katalog di atas adalah materi preview. Foto contoh berasal dari Wikimedia Commons; harga contoh hanya untuk menguji UI keranjang dan checkout, bukan harga jual JOLIE.</div>}</> :
          <div className="catalog-state"><b>Katalog sedang disiapkan.</b><span>{catalogError || "Belum ada produk aktif di database JOLIE."}</span></div>}
        </section>

        <section className="service-strip" id="layanan"><div><Truck/><b>Pengiriman Cepat</b><span>Pesanan diproses dengan teratur.</span></div><div><ShieldCheck/><b>Pembayaran Aman</b><span>Pilihan pembayaran akan terintegrasi.</span></div><div><Headphones/><b>Layanan Konsultasi</b><span>Tim JOLIE siap membantu.</span></div><div><Home/><b>Produk Berkualitas</b><span>Katalog dikelola dari data bisnis.</span></div></section>
      </section>

      <section className="info-sections">
        <section className="info-card" id="tentang">
          <span className="eyebrow">TENTANG JOLIE</span>
          <h2>Solusi kebutuhan pakan dan ternak dari satu tempat.</h2>
          <p>JOLIE Gebang melayani kebutuhan pakan dan perlengkapan ternak dengan fondasi katalog, pelanggan, pesanan, dan layanan digital yang terhubung.</p>
          <div className="info-grid"><div><b>Produk</b><span>Pakan dan kebutuhan ternak.</span></div><div><b>Layanan</b><span>Konsultasi dan pemesanan.</span></div><div><b>Digital</b><span>Katalog dan checkout terintegrasi.</span></div></div>
        </section>
        <section className="info-card" id="kontak">
          <span className="eyebrow">KONTAK</span>
          <h2>Hubungi JOLIE Gebang</h2>
          <p>Jalan Raya Taji–Tinggang, Desa Sukorejo, Kecamatan Tambakrejo, Kabupaten Bojonegoro.</p>
          <div className="contact-actions"><button onClick={()=>setAiMessage("Preview kontak: WhatsApp JOLIE +62 852-3535-6666.")}>WhatsApp JOLIE</button><button onClick={()=>navigator.clipboard?.writeText("+6285235356666")}>Salin Nomor</button></div>
        </section>
      </section>

      <aside className="side-column">
        <div className="ai-card" id="ai-advisor"><div className="ai-head"><div className="ai-avatar">👩🏻‍💼</div><div><h3>JOLIE AI Companion</h3><p>Asisten JOLIE untuk produk, kebutuhan ternak, dan layanan.</p></div></div>
          <div className="quick-actions">{["Rekomendasi pakan sesuai jenis ternak","Hitung kebutuhan pakan","Cek status pesanan saya","Panduan perawatan ternak","Tanya seputar produk dan layanan"].map(x=><button key={x} onClick={()=>setAiMessage("Preview AI: "+x+". Jawaban AI akan mengambil konteks dari katalog dan data JOLIE.")}><MessageCircle size={14}/>{x}</button>)}</div>
          {aiMessage && <div className="ai-response">{aiMessage}</div>}
          <div className="chat-input"><input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setAiMessage(aiInput ? "Preview AI: "+aiInput : "Silakan tulis pertanyaan Anda.")} placeholder="Tulis pesan Anda..."/><button onClick={()=>setAiMessage(aiInput ? "Preview AI: "+aiInput : "Silakan tulis pertanyaan Anda.")}><Send size={15}/></button></div>
        </div>
        <div className="vet-card"><span className="premium">PREVIEW</span><Sparkles size={22}/><h3>Dokter Hewan Virtual</h3><p>Konsultasi informasi kesehatan ternak dengan guardrail keselamatan dan rujukan profesional.</p><button onClick={()=>{setAiMessage("Preview Vet: jelaskan jenis hewan, usia, gejala, dan kondisi pemeliharaan. Untuk kondisi darurat, hubungi dokter hewan.");scrollTo("ai-advisor")}}>Mulai Konsultasi <ArrowRight size={15}/></button></div>
        <div className="register-card"><div><h3>{user ? "Anda sudah terdaftar" : "Jadi Pelanggan Terdaftar"}</h3><p>Pesanan, profil, alamat, dan loyalty akan tersimpan aman setelah login.</p><button onClick={()=>user?signOut():(setAuthMode("signup"),setAuthOpen(true))}>{user ? "Keluar" : "Daftar Sekarang"}</button></div><span>👨🏻‍🌾</span></div>
        <div className="tips-card" id="artikel"><div className="section-heading"><h3>Info & Tips Terbaru</h3><a href="#artikel" onClick={e=>{e.preventDefault();setAiMessage("Preview artikel: pilih topik pakan, kesehatan, atau manajemen ternak untuk membuka konten.")}}>Lihat Semua <ArrowRight size={13}/></a></div>
          <article><div className="tip-placeholder">PAKAN</div><div><b>Cara memilih pakan sesuai jenis ternak</b><span>Preview artikel · Panduan dasar</span></div></article>
          <article><div className="tip-placeholder">TERNAK</div><div><b>Menjaga penyimpanan pakan tetap baik</b><span>Preview artikel · Manajemen</span></div></article></div>
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
        <button className="modal-primary" disabled={authBusy}>{authBusy ? "Memproses..." : authMode === "login" ? "Masuk" : "Daftar"}</button>
      </form>
      {user && <button className="modal-secondary" onClick={signOut}><LogOut size={15}/> Keluar</button>}
      <button className="modal-switch" onClick={()=>{setAuthMode(authMode==="login"?"signup":"login");setAuthMessage("");}}>{authMode==="login"?"Belum punya akun? Daftar":"Sudah punya akun? Masuk"}</button>
    </div></div>}

    {cartOpen && <div className="drawer-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}>
      <div className="drawer-head"><div><b>Keranjang JOLIE</b><span>{cartCount} item</span></div><button onClick={()=>setCartOpen(false)}><X/></button></div>
      <div className="drawer-items">{cart.length ? cart.map(item=><div className="drawer-item" key={item.id}><div className="drawer-thumb">{item.image_url?<img src={item.image_url} alt=""/>:"J"}</div><div className="drawer-info"><b>{item.name}</b><span>{item.is_demo ? "Harga preview" : money(item.price)+" / "+(item.unit || "unit")}</span><div className="qty"><button onClick={()=>changeQty(item.id,-1)}><Minus size={13}/></button><strong>{item.quantity}</strong><button onClick={()=>changeQty(item.id,1)}><Plus size={13}/></button></div></div><strong>{money(Number(item.price)*item.quantity)}</strong></div>) : <div className="drawer-empty">Keranjang masih kosong.</div>}</div>
      <div className="drawer-foot"><div><span>Total</span><strong>{money(cartTotal)}</strong></div>{orderMessage && <div className="order-message">{orderMessage}</div>}<button className="modal-primary" disabled={!cart.length} onClick={checkout}>Buat Pesanan</button><small>Produk preview tidak masuk ke database pesanan.</small></div>
    </aside></div>}
  </div>;
}

export default App;
