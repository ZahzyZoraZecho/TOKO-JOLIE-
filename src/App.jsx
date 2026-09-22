import React from "react";
import {
  Search, MapPin, UserRound, ShoppingCart, Menu, ChevronDown, ArrowRight,
  Truck, ShieldCheck, Headphones, Home, Package, HeartPulse, Sparkles,
  MessageCircle, Send, Star, Plus, X
} from "lucide-react";

const categories = [
  ["Pakan Ayam","🐔"],["Pakan Sapi","🐄"],["Pakan Kambing","🐐"],["Pakan Ikan","🐟"],
  ["Pakan Burung","🐦"],["Obat & Vitamin","💊"],["Aksesoris Ternak","🏠"],["Peralatan Peternakan","🔧"]
];

const products = [
  {name:"Pakan Ayam Pedaging BR-1",size:"25 kg",price:"Rp 185.000",rating:"4.9",reviews:"124",tag:"Terlaris",image:"https://images.unsplash.com/photo-1563281577-a7be47e204c7?auto=format&fit=crop&w=700&q=80"},
  {name:"Pakan Sapi PF-21",size:"50 kg",price:"Rp 220.000",rating:"4.8",reviews:"98",tag:"Terlaris",image:"https://images.unsplash.com/photo-1545468259-2f6c8f3c1b04?auto=format&fit=crop&w=700&q=80"},
  {name:"Pakan Ikan Lele Premium",size:"30 kg",price:"Rp 160.000",rating:"4.8",reviews:"76",tag:"Promo",image:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80"},
  {name:"Pakan Kambing Grower",size:"25 kg",price:"Rp 150.000",rating:"4.7",reviews:"64",tag:"",image:"https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=700&q=80"},
  {name:"Vitamin Ternak Multi",size:"100 ml",price:"Rp 75.000",rating:"4.9",reviews:"45",tag:"",image:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80"}
];

const tips = [
  ["Cara Memilih Pakan Ayam yang Tepat untuk Pertumbuhan Optimal","12 Mei 2025"],
  ["Tips Budidaya Lele untuk Pemula","9 Mei 2025"],
  ["Cara Merawat Kambing Agar Cepat Gemuk","5 Mei 2025"]
];

function App(){
  const [cart,setCart] = React.useState([]);
  const [query,setQuery] = React.useState("");
  const [chatOpen,setChatOpen] = React.useState(true);

  const addToCart = (product) => setCart(c => [...c, product]);

  return <div className="app-shell">
    <header className="top-header">
      <div className="header-main container">
        <div className="brand">
          <div className="brand-mark">🌿</div>
          <div><strong>JOLIE</strong><span>Pakan & Kebutuhan Ternak</span></div>
        </div>
        <div className="search-box">
          <Search size={18}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari produk, kategori, atau kebutuhan ternak..." />
          <button aria-label="Cari"><Search size={17}/></button>
        </div>
        <div className="header-action"><MapPin size={18}/><div><b>Lokasi Toko</b><span>Jalan Raya Gebang</span></div></div>
        <div className="header-action account"><UserRound size={18}/><div><b>Login / Daftar</b><span>Akun Saya</span></div></div>
        <div className="header-cart"><ShoppingCart/><span className="cart-badge">{cart.length}</span><div><b>Keranjang</b><small>{cart.length} item</small></div></div>
      </div>
      <div className="nav-row">
        <div className="container nav-inner">
          <button className="category-btn"><Menu size={18}/> Semua Kategori <ChevronDown size={16}/></button>
          <nav>
            {["Beranda","Produk","Layanan","AI Advisor","Artikel & Tips","Tentang Kami","Kontak"].map((n,i)=><a key={n} className={i===0?"active":""} href={"#"+n.toLowerCase().replaceAll(" ","-")}>{n}{i>0&&i<3?<ChevronDown size={12}/>:null}</a>)}
          </nav>
        </div>
      </div>
    </header>

    <main className="container page-grid">
      <section className="main-column">
        <section className="hero">
          <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1600&q=85" alt="Peternakan JOLIE"/>
          <div className="hero-overlay"/>
          <div className="hero-content">
            <p>JOLIE · Solusi Lengkap Kebutuhan Pakan dan Ternak</p>
            <h1>Pakan Berkualitas<br/>untuk Hasil Maksimal</h1>
            <span>Mendukung peternakan, perikanan, dan pertanian Anda<br/>dengan produk terbaik, harga bersaing, harga layanan profesional.</span>
            <button className="primary-btn">Belanja Sekarang <ArrowRight size={18}/></button>
            <div className="hero-points"><span>◉ Produk Original</span><span>✦ Harga Terbaik</span><span>▣ Pengiriman Cepat</span><span>◉ Layanan Konsultasi</span></div>
          </div>
        </section>

        <section className="section-card category-section">
          <div className="section-heading"><h2>Kategori Produk</h2><a href="#kategori">Lihat Semua <ArrowRight size={15}/></a></div>
          <div className="category-grid">
            {categories.map(([name,icon])=><button className="category-item" key={name}><div>{icon}</div><span>{name}</span></button>)}
          </div>
        </section>

        <section className="products-section">
          <div className="section-heading"><div className="heading-tabs"><h2>Produk Pilihan</h2><button className="pill active">Terlaris</button><button className="pill">Terbaru</button><button className="pill">Promo</button></div><a href="#produk">Lihat Semua <ArrowRight size={15}/></a></div>
          <div className="product-grid">
            {products.map(p=><article className="product-card" key={p.name}>
              {p.tag && <span className={"product-tag "+(p.tag==="Promo"?"promo":"")}>{p.tag}</span>}
              <div className="product-image"><img src={p.image} alt={p.name}/></div>
              <h3>{p.name}</h3><small>{p.size}</small>
              <div className="rating"><span>★★★★★</span> {p.rating} <em>({p.reviews})</em></div>
              <strong>{p.price}</strong>
              <button onClick={()=>addToCart(p)}><ShoppingCart size={15}/> Tambah ke Keranjang</button>
            </article>)}
          </div>
        </section>

        <section className="service-strip">
          <div><Truck/><b>Pengiriman Cepat</b><span>Pesanan sampai dalam waktu singkat.</span></div>
          <div><ShieldCheck/><b>Pembayaran Aman</b><span>Banyak pilihan metode pembayaran.</span></div>
          <div><Headphones/><b>Layanan Konsultasi</b><span>Tim ahli siap membantu kapan saja.</span></div>
          <div><Home/><b>Produk Berkualitas</b><span>Hanya produk terbaik untuk ternak Anda.</span></div>
        </section>

        <section className="promo-row">
          <div className="promo-card promo-app"><div><b>Belanja Lebih Mudah<br/>Lewat Aplikasi JOLIE</b><span>Tersedia di Android & iOS</span><button>Pelajari</button></div></div>
          <div className="promo-card promo-loyalty"><div><b>Program Loyalitas<br/>Pelanggan</b><span>Kumpulkan poin dan dapatkan hadiah menarik</span><button>Pelajari Lebih Lanjut</button></div></div>
          <div className="promo-card promo-radar"><div><b>JOLIE Market Radar</b><span>Temukan peluang pasar & kebutuhan pelanggan di sekitar Anda.</span><button>Lihat Analisis</button></div></div>
        </section>
      </section>

      <aside className="side-column">
        <div className="ai-card">
          <div className="ai-head"><div className="ai-avatar">👩🏻‍💼</div><div><h3>JOLIE AI Companion</h3><p>Halo! Saya Jolie, asisten AI Anda.<br/>Ada yang bisa saya bantu?</p></div></div>
          <div className="quick-actions">
            {["Rekomendasi pakan sesuai jenis ternak","Hitung kebutuhan pakan","Cek status pesanan saya","Saran lokasi wisata terdekat","Panduan perawatan ternak","Tanya seputar produk dan layanan"].map(x=><button key={x}><MessageCircle size={14}/>{x}</button>)}
          </div>
          <div className="chat-input"><input placeholder="Tulis pesan Anda..."/><button onClick={()=>setChatOpen(!chatOpen)}><Send size={15}/></button></div>
        </div>

        <div className="vet-card">
          <span className="premium">Premium</span><Sparkles size={22}/>
          <h3>Dokter Hewan Virtual</h3><p>Konsultasi kesehatan ternak langsung dengan AI Veterinarian.</p><button>Mulai Konsultasi <ArrowRight size={15}/></button>
        </div>

        <div className="register-card"><div><h3>Jadi Pelanggan Terdaftar</h3><p>Dapatkan promo eksklusif, poin reward, dan layanan lebih lengkap.</p><button>Daftar Sekarang</button></div><span>👨🏻‍🌾</span></div>

        <div className="tips-card"><div className="section-heading"><h3>Info & Tips Terbaru</h3><a href="#artikel">Lihat Semua <ArrowRight size={13}/></a></div>{tips.map(([title,date],i)=><article key={title}><img src={products[i].image} alt=""/><div><b>{title}</b><span>{date}</span></div></article>)}</div>
      </aside>
    </main>

    <footer className="mobile-preview">
      <div className="phone">
        <div className="phone-notch"/>
        <div className="phone-header"><b>🌿 JOLIE</b><span>♡ 🛒</span></div>
        <div className="phone-search"><Search size={12}/> Cari produk, kategori...</div>
        <div className="phone-hero"><img src={products[0].image} alt=""/><div><small>JOLIE · Kebutuhan Ternak</small><b>Pakan Berkualitas<br/>untuk Hasil Maksimal</b><button>Belanja Sekarang →</button></div></div>
        <div className="phone-cats">{categories.slice(0,4).map(([n,i])=><span key={n}>{i}<small>{n}</small></span>)}</div>
        <h4>Produk Pilihan</h4><div className="phone-product"><img src={products[0].image}/><div><b>{products[0].name}</b><small>25 kg</small><strong>{products[0].price}</strong><button>Tambah</button></div></div>
        <div className="phone-nav"><span>⌂<small>Beranda</small></span><span>▦<small>Kategori</small></span><span>🛒<small>Keranjang</small></span><span>♙<small>Akun</small></span></div>
      </div>
      <div className="preview-copy"><h3>Tampilan Mobile (Preview)</h3><p>JOLIE dibangun responsive-first: website, PWA, dan fondasi aplikasi mobile menggunakan sistem UI yang sama.</p><ul>{["Desain modern & responsif","Katalog produk real","AI Companion (chatbot)","AI Veterinary Assistant (premium)","E-commerce lengkap (keranjang, checkout)","Integrasi pembayaran & kurir","Manajemen stok & pesanan","Dashboard bisnis (Business OS)","Plugin perangkat & POS","AI Market Radar & analisis pelanggan","Blog / Artikel & SEO friendly","Multi bahasa & multi mata uang","Mudah dikustomisasi di AKVISIO"].map(x=><li key={x}><span>✓</span>{x}</li>)}</ul><div className="tagline">Bersama JOLIE<br/><b>Tumbuh Lebih Baik</b> 🌿</div></div>
    </footer>

    <div className="floating-chat" onClick={()=>setChatOpen(v=>!v)}><MessageCircle/></div>
    {chatOpen && <div className="toast-chat"><b>JOLIE AI Companion</b><span>Butuh bantuan memilih pakan?</span><button onClick={()=>setChatOpen(false)}><X size={14}/></button></div>}
  </div>
}

export default App;