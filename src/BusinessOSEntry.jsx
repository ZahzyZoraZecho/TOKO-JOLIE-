import React from "react";
import { LockKeyhole, LogIn, ShieldCheck, Store, UserRound } from "lucide-react";
import BusinessOS from "./BusinessOS";
import { businessSupabase } from "./lib/supabase";

const ORG_NAME = "JOLIE — Toko Pakan Jolie Gebang";

export default function BusinessOSEntry() {
  const [session, setSession] = React.useState(null);
  const [checking, setChecking] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [mode, setMode] = React.useState("login");
  const [setupCode, setSetupCode] = React.useState("");
  const [ownerBootstrap, setOwnerBootstrap] = React.useState(false);
  const [access, setAccess] = React.useState(null);
  const [accessChecking, setAccessChecking] = React.useState(false);
  const [pendingConfirmation, setPendingConfirmation] = React.useState(false);

  const loadSession = React.useCallback(async () => {
    if (!businessSupabase) {
      setChecking(false);
      setMessage("Konfigurasi Business OS belum tersedia.");
      return;
    }
    const { data } = await businessSupabase.auth.getSession();
    setSession(data?.session || null);
    setChecking(false);
  }, []);

  React.useEffect(() => {
    if (!businessSupabase) {
      setChecking(false);
      return undefined;
    }
    loadSession();
    const { data: listener } = businessSupabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setChecking(false);
    });
    return () => listener?.subscription?.unsubscribe();
  }, [loadSession]);

  React.useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      if (!session || !businessSupabase) {
        setAccess(null);
        setAccessChecking(false);
        return;
      }
      setAccessChecking(true);
      const { data, error } = await businessSupabase.rpc("jolie_my_access");
      if (!cancelled) {
        setAccess(error ? null : (data?.[0] || null));
        setAccessChecking(false);
      }
    }
    checkAccess();
    return () => { cancelled = true; };
  }, [session]);

  async function resendConfirmation() {
    if (!businessSupabase || !email.trim()) return;
    setBusy(true);
    setMessage("");
    const { error } = await businessSupabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: "https://zahzyzorazecho.github.io/TOKO-JOLIE-/business-os/" }
    });
    setMessage(error ? (error.message || "Email konfirmasi belum dapat dikirim ulang.") : "Email konfirmasi dikirim ulang. Periksa Inbox, Spam, atau Promosi email pemilik akun.");
    setPendingConfirmation(!error);
    setBusy(false);
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (!businessSupabase) return;
    setBusy(true);
    setMessage("");
    const { data, error } = await businessSupabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      setMessage(error.message || "Login Business OS gagal.");
    } else if (!data?.session) {
      setMessage("Login berhasil tetapi sesi Business OS belum terbentuk. Coba lagi.");
    } else if (ownerBootstrap && setupCode.trim()) {
      const boot = await businessSupabase.rpc("jolie_bootstrap_owner", { p_setup_code: setupCode.trim() });
      if (boot.error) {
        setMessage(boot.error.message || "Akun berhasil login, tetapi bootstrap owner gagal.");
      } else {
        setMessage("Owner Business OS berhasil dibuat. Memuat akses operasional…");
      }
    } else {
      setMessage("");
    }
    setBusy(false);
  }

  async function submitSignup(event) {
    event.preventDefault();
    if (!businessSupabase) return;
    setBusy(true);
    setMessage("");
    const { data, error } = await businessSupabase.auth.signUp({\n      email: email.trim(),\n      password,\n      options: { emailRedirectTo: "https://zahzyzorazecho.github.io/TOKO-JOLIE-/business-os/" }\n    });
    if (error) {
      setMessage(error.message || "Pembuatan akun staff gagal.");
    } else if (data?.session) {
      const boot = await businessSupabase.rpc("jolie_bootstrap_owner", { p_setup_code: setupCode.trim() });
      if (boot.error) setMessage(boot.error.message || "Bootstrap owner gagal.");
    } else {
      setMessage("Akun staff dibuat. Periksa email konfirmasi, lalu login kembali.");
      setMode("login");
      setOwnerBootstrap(true);
    }
    setBusy(false);
  }
  async function signOut() {
    await businessSupabase?.auth.signOut();
    setAccess(null);
    setMessage("");
  }

  function goStorefront() {
    window.location.href = "./";
  }

  if (checking) return <EntryShell><div className="bos-entry-loading">Memuat keamanan JOLIE Business OS…</div></EntryShell>;

  if (!session) {
    return <EntryShell>
      <div className="bos-login">
        <div className="bos-login-brand">
          <div className="bos-logo">J</div>
          <div><strong>JOLIE Business OS</strong><span>Internal Operations Platform</span></div>
        </div>

        <div className="bos-login-icon"><LockKeyhole size={25}/></div>
        <div className="bos-eyebrow">STAFF ACCESS</div>
        <h1>{mode === "login" ? "Masuk ke Business OS" : "Daftarkan akun staff pertama"}</h1>
        <p className="bos-login-copy">Halaman login operasional ini berdiri sendiri dari website toko JOLIE. Akun pelanggan/storefront tidak otomatis masuk ke Business OS.</p>

        <form onSubmit={mode === "login" ? submitLogin : submitSignup} className="bos-login-form">
          <label>Email staff<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="staff@jolie..." autoComplete="username" required /></label>
          <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required /></label>
          {(mode === "signup" || ownerBootstrap) && <label>Kode bootstrap awal<input type="password" value={setupCode} onChange={e=>setSetupCode(e.target.value)} placeholder="Kode setup owner" autoComplete="off" required /></label>}
          {message && <div className="bos-entry-message">{message}</div>}
          <button className="bos-login-button" disabled={busy}>{busy ? "Memproses…" : mode === "login" ? <><LogIn size={16}/> Masuk ke Business OS</> : <><ShieldCheck size={16}/> Buat Owner Business OS</>}</button>
        <button type="button" className="bos-store-button" onClick={()=>{setMode(mode === "login" ? "signup" : "login");setOwnerBootstrap(false);setPendingConfirmation(false);setMessage("");}}>{mode === "login" ? "Belum punya akun staff? Buat akun pertama" : "Sudah punya akun? Kembali ke login"}</button>
        {mode === "login" && <button type="button" className="bos-store-button" onClick={()=>{setOwnerBootstrap(!ownerBootstrap);setSetupCode("");setPendingConfirmation(false);setMessage("");}}>{ownerBootstrap ? "Batalkan bootstrap owner" : "Saya sudah membuat akun pertama — aktifkan Owner"}</button>}
        </form>

        <div className="bos-security-note"><ShieldCheck size={17}/><span>Setelah login, Supabase RLS tetap memeriksa role staff sebelum data operasional dibuka.</span></div>
        <button className="bos-store-button" onClick={goStorefront}><Store size={16}/> Kembali ke website toko JOLIE</button>
      </div>
    </EntryShell>;
  }

  if (accessChecking) return <EntryShell><div className="bos-entry-loading">Memverifikasi akses staff JOLIE…</div></EntryShell>;

  if (!access) {
    return <EntryShell>
      <div className="bos-login">
        <div className="bos-login-brand"><div className="bos-logo">J</div><div><strong>JOLIE Business OS</strong><span>{ORG_NAME}</span></div></div>
        <div className="bos-login-icon"><UserRound size={25}/></div>
        <div className="bos-eyebrow">ACCESS NOT ASSIGNED</div>
        <h1>Login berhasil</h1>
        <p className="bos-login-copy">Akun ini sudah terautentikasi di Business OS, tetapi belum memiliki keanggotaan staff JOLIE. Database operasional tetap terkunci sampai administrator memberikan role.</p>
        <div className="bos-entry-message">Akun: {session.user?.email || "staff"}<br/>Status: belum memiliki role Business OS.</div>
        <button className="bos-login-button" onClick={signOut}>Keluar dari Business OS</button>
        <button className="bos-store-button" onClick={goStorefront}><Store size={16}/> Buka website toko JOLIE</button>
      </div>
    </EntryShell>;
  }

  return <BusinessOS user={session.user} onBack={goStorefront} />;
}

function EntryShell({ children }) {
  return <div className="bos-entry-shell">
    <style>{`
      .bos-entry-shell{min-height:100vh;background:radial-gradient(circle at top,#e9f7f0 0,#f5f8f6 42%,#edf3f0 100%);display:grid;place-items:center;padding:24px;box-sizing:border-box;color:#102c24;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .bos-login{width:min(100%,470px);background:#fff;border:1px solid #dbe8e1;border-radius:22px;box-shadow:0 22px 70px rgba(20,62,48,.12);padding:30px;box-sizing:border-box}
      .bos-login-brand{display:flex;align-items:center;gap:11px;margin-bottom:30px}.bos-login-brand strong{display:block;font-size:18px}.bos-login-brand span{display:block;color:#7a8d85;font-size:10px;margin-top:3px}
      .bos-logo{width:44px;height:44px;border-radius:13px;background:#08764d;color:#fff;display:grid;place-items:center;font-weight:900;font-size:23px}
      .bos-login-icon{width:50px;height:50px;border-radius:14px;background:#edf8f2;color:#08764d;display:grid;place-items:center;margin-bottom:17px}
      .bos-eyebrow{font-size:9px;letter-spacing:.14em;font-weight:900;color:#08764d}.bos-login h1{font-size:28px;letter-spacing:-.7px;margin:7px 0}.bos-login-copy{font-size:11px;line-height:1.65;color:#6d8179;margin:0 0 20px}
      .bos-login-form{display:grid;gap:13px}.bos-login-form label{display:grid;gap:6px;font-size:10px;font-weight:800;color:#49675c}.bos-login-form input{box-sizing:border-box;width:100%;border:1px solid #d8e4de;border-radius:10px;padding:12px;font-size:12px;outline:none;background:#fbfdfc}.bos-login-form input:focus{border-color:#58a985;box-shadow:0 0 0 3px #eaf7f0}
      .bos-login-button{min-height:43px;border:0;border-radius:10px;background:#08764d;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}.bos-login-button:disabled{opacity:.65;cursor:wait}
      .bos-entry-message{border:1px solid #f0d7c5;background:#fff7ef;color:#79542c;border-radius:10px;padding:10px;font-size:10px;line-height:1.5}
      .bos-security-note{display:flex;gap:8px;align-items:flex-start;margin-top:15px;padding:11px;background:#f2f8f5;border:1px solid #dceae3;border-radius:10px;color:#5c766b;font-size:9px;line-height:1.5}.bos-security-note svg{flex:none;color:#08764d}
      .bos-store-button{width:100%;margin-top:10px;min-height:40px;border:1px solid #d8e4de;background:#fff;color:#31574a;border-radius:10px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}
      .bos-entry-loading{padding:24px;background:#fff;border:1px solid #dbe8e1;border-radius:16px;color:#49675c;font-weight:800;font-size:12px}
      @media(max-width:520px){.bos-entry-shell{padding:12px}.bos-login{padding:23px;border-radius:18px}.bos-login h1{font-size:24px}}
    `}</style>
    {children}
  </div>;
}
