import React from "react";
import {
  Search, MapPin, UserRound, ShoppingCart, Menu, ChevronDown, ArrowRight,
  Truck, ShieldCheck, Headphones, Home, Sparkles, MessageCircle, Send, X
} from "lucide-react";
import { supabase } from "./lib/supabase";

const ORG_SLUG = "jolie-toko-pakan-jolie-gebang";
const heroImage = "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1800&q=85";

function money(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value ?? 0);
}

function App() {
  const [organization, setOrganization] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [cart, setCart] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [catalogError, setCatalogError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    async function loadCatalog() {
      if (!supabase) {
        setCatalogError("Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY.");
        setLoading(false);
        return;
      }
      const { data: org, error: orgError } = await supabase.from("organizations").select("id,name,slug").eq("slug", ORG_SLUG).single();
      if (orgError) {
        if (active) { setCatalogError(orgError.message); setLoading(false); }
        return;
      }
      const [{ data: cats, error: catError }, { data: prods, error: prodError }] = await Promise.all([
        supabase.from("product_categories").select("id,name,slug,icon,sort_order").eq("organization_id", org.id).eq("is_active", true).order("sort_order"),
        supabase.from("products").select("id,name,slug,description,image_url,unit,price,compare_at_price,is_featured,category_id").eq("organization_id", org.id).eq("is_active", true).order("created_at", { ascending: false })
      ]);
      if (active) {
        setOrganization(org);
        setCategories(cats || []);
        setProducts(prods || []);
        setCatalogError(catError?.message || prodError?.message || "");
        setLoading(false);
      }
    }
    loadCatalog();
    return () => { active = false; };
  }, []);

  const filteredProducts = products.filter(p => {
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
  });

  const addToCart = product => setCart(items => [...items, product]);
  const featured = filteredProducts.slice(0, 5);

  return <div className="app-shell">
    <header className="top-header">
      <div className="header-main container">
        <div className="brand"><div className="brand-mark">🌿</div><div><strong>JOLIE</strong><span>Pakan & Kebutuhan Ternak</span></div></div>
        <div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari produk, kategori, atau kebutuhan ternak..."/><button aria-label="Cari"><Search size={17}/></button></div>
        <div className="header-action"><MapPin size={18}/><div><b>Lokasi Toko</b><span>Jalan Raya Taji–Tinggang</span></div></div>
        <div className="header-action account"><UserRound size={18}/><div><b>Login / Daftar</b><span>Akun Saya</span></div></div>
        <div className="header-cart"><ShoppingCart/><span className="cart-badge">{cart.length}</span><div><b>Keranjang</b><small>{cart.length} item</small></div></div>
      </div>
      <div className="nav-row"><div className="container nav-inner">
        <button className="category-btn"><Menu size={18}/> Semua Kategori <ChevronDown size={16}/></button>
        <nav>{["Beranda","Produk","Layanan","AI Advisor","Artikel & Tips","Tentang Kami","Kontak"].map((n,i)=><a key={n} className={i===0?"active":""} href={"#"+n.toLowerCase().replaceAll(" ","-")}>{n}{i>0&&i<3?<ChevronDown size={12}/>:null}</a>)}</nav>
      </div></div>
    </header>

    <main className="container page-grid">
      <section className="main-column">
        <section className="hero"><img src={heroImage} alt="Peternakan JOLIE"/><div className="hero-overlay"/><div className="hero-content">
          <p>JOLIE · Solusi Lengkap Kebutuhan Pakan dan Ternak</p>
          <h1>Pakan Berkualitas<br/>untuk Hasil Maksimal</h1>
          <span>Mendukung peternakan, perikanan, dan pertanian Anda<br/>dengan produk terbaik, harga bersaing, dan layanan profesional.</span>
          <button className="primary-btn" onClick={()=>document.getElementById("produk")?.scrollIntoView({behavior:"smooth"})}>Belanja Sekarang <ArrowRight size={18}/></button>
          <div className="hero-points"><span>◉ Produk Original</span><span>✦ Harga Terbaik</span><span>▣ Pengiriman Cepat</span><span>◉ Layanan Konsultasi</span></div>
        </div></section>

        <section className="section-card category-section"><div className="section-heading"><h2>Kategori Produk</h2><a href="#kategori">Lihat Semua <ArrowRight size={15}/></a></div>
          <div className="category-grid">{categories.map(c=><button className="category-item" key={c.id} onClick={()=>setQuery(c.name)}><div>{c.icon || "•"}</div><span>{c.name}</span></button>)}</div>
          {!loading && categories.length===0 && <p className="catalog-empty">Kategori belum tersedia.</p>}
        </section>

        <section className="products-section" id="produk"><div className="section-heading"><div className="heading-tabs"><h2>Produk Pilihan</h2><button className="pill active">Terbaru</button></div><a href="#produk">Lihat Semua <ArrowRight size={15}/></a></div>
          {loading ? <div className="catalog-state">Memuat katalog JOLIE…</div> :
          filteredProducts.length ? <div className="product-grid">{featured.map(p=><article className="product-card" key={p.id}>
            {p.compare_at_price && p.compare_at_price > p.price && <span className="product-tag promo">Promo</span>}
            <div className="product-image">{p.image_url ? <img src={p.image_url} alt={p.name}/> : <div className="product-image-placeholder">JOLIE</div>}</div>
            <h3>{p.name}</h3><small>{p.unit || "Satuan belum diatur"}</small>
            <div className="rating"><span>★★★★★</span></div>
            <strong>{p.price == null ? "Harga belum diatur" : money(p.price)}</strong>
            <button onClick={()=>addToCart(p)} disabled={p.price == null}><ShoppingCart size={15}/> Tambah ke Keranjang</button>
          </article>)}</div>
          : <div className="catalog-state"><b>Katalog sedang disiapkan.</b><span>{catalogError || "Belum ada produk aktif di database JOLIE."}</span></div>}
        </section>

        <section className="service-strip"><div><Truck/><b>Pengiriman Cepat</b><span>Pesanan diproses dengan teratur.</span></div><div><ShieldCheck/><b>Pembayaran Aman</b><span>Pilihan pembayaran akan terintegrasi.</span></div><div><Headphones/><b>Layanan Konsultasi</b><span>Tim JOLIE siap membantu.</span></div><div><Home/><b>Produk Berkualitas</b><span>Katalog dikelola dari data bisnis.</span></div></section>
        <section className="promo-row"><div className="promo-card promo-app"><div><b>Belanja Lebih Mudah<br/>Lewat Aplikasi JOLIE</b><span>Fondasi PWA & mobile responsive.</span><button>Pelajari</button></div></div><div className="promo-card promo-loyalty"><div><b>Program Loyalitas<br/>Pelanggan</b><span>Siap dihubungkan ke CRM & loyalty.</span><button>Pelajari Lebih Lanjut</button></div></div><div className="promo-card promo-radar"><div><b>JOLIE Market Radar</b><span>Demand intelligence untuk bisnis.</span><button>Lihat Analisis</button></div></div></section>
      </section>

      <aside className="side-column">
        <div className="ai-card"><div className="ai-head"><div className="ai-avatar">👩🏻‍💼</div><div><h3>JOLIE AI Companion</h3><p>Asisten JOLIE untuk produk, kebutuhan ternak, dan layanan.</p></div></div>
          <div className="quick-actions">{["Rekomendasi pakan sesuai jenis ternak","Hitung kebutuhan pakan","Cek status pesanan saya","Panduan perawatan ternak","Tanya seputar produk dan layanan"].map(x=><button key={x}><MessageCircle size={14}/>{x}</button>)}</div>
          <div className="chat-input"><input placeholder="Tulis pesan Anda..."/><button onClick={()=>setChatOpen(!chatOpen)}><Send size={15}/></button></div>
        </div>
        <div className="vet-card"><span className="premium">PREMIUM</span><Sparkles size={22}/><h3>Dokter Hewan Virtual</h3><p>Konsultasi informasi kesehatan ternak dengan guardrail keselamatan dan rujukan profesional.</p><button>Mulai Konsultasi <ArrowRight size={15}/></button></div>
        <div className="register-card"><div><h3>Jadi Pelanggan Terdaftar</h3><p>Pesanan, profil, alamat, dan loyalty akan tersimpan aman setelah login.</p><button>Daftar Sekarang</button></div><span>👨🏻‍🌾</span></div>
        <div className="tips-card"><div className="section-heading"><h3>Info & Tips Terbaru</h3><a href="#artikel">Lihat Semua <ArrowRight size={13}/></a></div><article><div className="tip-placeholder">JOLIE</div><div><b>Artikel dan tips akan terhubung ke Content & SEO Engine.</b><span>Belum ada artikel</span></div></article></div>
      </aside>
    </main>

    <footer className="mobile-preview"><div className="phone"><div className="phone-notch"/><div className="phone-header"><b>🌿 JOLIE</b><span>♡ 🛒</span></div><div className="phone-search"><Search size={12}/> Cari produk, kategori...</div><div className="phone-hero"><img src={heroImage} alt=""/><div><small>JOLIE · Kebutuhan Ternak</small><b>Pakan Berkualitas<br/>untuk Hasil Maksimal</b><button>Belanja Sekarang →</button></div></div><div className="phone-cats">{categories.slice(0,4).map(c=><span key={c.id}>{c.icon || "•"}<small>{c.name}</small></span>)}</div><h4>Produk Pilihan</h4>{products[0] ? <div className="phone-product"><img src={products[0].image_url || heroImage}/><div><b>{products[0].name}</b><small>{products[0].unit || ""}</small><strong>{products[0].price == null ? "Harga belum diatur" : money(products[0].price)}</strong><button onClick={()=>addToCart(products[0])}>Tambah</button></div></div> : <div className="phone-product"><div className="product-image-placeholder">Katalog JOLIE</div></div>}<div className="phone-nav"><span>⌂<small>Beranda</small></span><span>▦<small>Kategori</small></span><span>🛒<small>Keranjang</small></span><span>♙<small>Akun</small></span></div></div>
      <div className="preview-copy"><h3>Tampilan Mobile (Preview)</h3><p>JOLIE responsive-first: website dan PWA memakai design system yang sama.</p><ul>{["Desain modern & responsif","Katalog produk real dari Supabase","AI Companion","AI Veterinary Assistant","Keranjang & checkout","Pembayaran & kurir","Manajemen stok & pesanan","Dashboard Business OS","POS & perangkat","Market Radar","Blog & SEO","Mudah dikustomisasi di AKVISIO"].map(x=><li key={x}><span>✓</span>{x}</li>)}</ul><div className="tagline">Bersama JOLIE<br/><b>Tumbuh Lebih Baik</b> 🌿</div></div>
    </footer>
    <div className="floating-chat" onClick={()=>setChatOpen(v=>!v)}><MessageCircle/></div>
    {chatOpen && <div className="toast-chat"><b>JOLIE AI Companion</b><span>Butuh bantuan memilih pakan?</span><button onClick={()=>setChatOpen(false)}><X size={14}/></button></div>}
  </div>;
}
export default App;
