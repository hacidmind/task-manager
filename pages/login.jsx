import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { gsap } from "gsap";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Sparkles, Zap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Login({ configured, defaultEmail }) {
  const [register, setRegister] = useState(false);



  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const root = useRef(null);
  const router = useRouter();
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".auth-reveal", { y: 22, opacity: 0, duration: .7, stagger: .12, ease: "power3.out" });
    }, root);
    return () => mm.revert();
  }, []);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/auth/${register ? "register" : "login"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), email: data.get("email"), password: data.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in. Please try again.");
      await router.replace("/");
    } catch (e) { setError(e.message); setBusy(false); }
  }

  return <div ref={root} className="auth-page">
    <Head><title>{register ? "Create account · Momentum" : "Sign in · Momentum"}</title></Head>
    <header className="auth-header"><span className="brand"><Zap size={26} fill="currentColor" />momentum<span>.</span></span><ThemeToggle /></header>
    <main className="auth-layout">
      <section className="auth-story auth-reveal">
        <span className="auth-kicker"><Sparkles size={15} />A LITTLE FOCUS. A LOT OF PROGRESS.</span>
        <h1>Your next big thing<br />starts with <em>one step.</em></h1>
        <p>A calmer place for your tasks, your plans, and everything you’re working toward.</p>
        <div className="auth-illustration" aria-hidden="true"><div className="auth-orbit" /><div className="auth-orbit second" /><div className="auth-preview"><span className="auth-preview-label">TODAY’S MOMENTUM <Sparkles size={15}/></span><h3>Make room for what matters.</h3><div><span className="preview-check"><Check size={15}/></span>Find your focus<span className="preview-tag">Done</span></div><div><span className="preview-check"><Check size={15}/></span>Take the first step<span className="preview-tag">Done</span></div><div><span className="preview-circle"/>Build something meaningful</div><span className="preview-progress"><span/></span></div><span className="auth-floating"><Zap size={17} fill="currentColor"/>You’re moving forward.</span></div>
        <p className="auth-story-footer">Small steps. Clear priorities. Real progress.</p>
      </section>
      <section className="auth-form-panel auth-reveal" aria-labelledby="auth-title">
        <span className="auth-lock"><LockKeyhole size={22}/></span><p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
        <h2 id="auth-title">{register ? "Make it your space." : "Welcome back."}</h2><p className="auth-description">{register ? "Create an account and give your ideas a place to grow." : "Sign in to pick up where you left off."}</p>
        <div className="auth-tabs"><button type="button" aria-pressed={!register} disabled={busy} className={!register ? "selected" : ""} onClick={()=>{setRegister(false);setError("");}}>Sign in</button><button type="button" aria-pressed={register} disabled={busy} className={register ? "selected" : ""} onClick={()=>{setRegister(true);setError("");}}>Create account</button></div>
        {!configured && <p className="auth-config" role="status">Connect your online MongoDB database to enable sign-in and registration. Set MONGODB_URI in .env.local, then restart the app.</p>}
        <form onSubmit={submit} key={register ? "register" : "login"}>
          <fieldset disabled={busy}>
          {register && <label htmlFor="name">Your name<input id="name" name="name" autoComplete="name" required maxLength={80} placeholder="How should we call you?" /></label>}
          <label htmlFor="email">Email address<input id="email" name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={register ? "" : defaultEmail} placeholder="you@example.com" /></label>
          <label htmlFor="password">Password</label><div className="password-field"><input id="password" name="password" type={show ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 12 : 1} maxLength={128} placeholder={register ? "At least 12 characters" : "Enter your password"}/><button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={()=>setShow(!show)}>{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          {register && <p className="password-hint">Use at least 12 characters. A unique passphrase works well.</p>}
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary auth-submit" disabled={busy || !configured}>{busy ? "One moment…" : register ? "Create your account" : "Sign in to your workspace"}<ArrowRight size={17}/></button>
          </fieldset>
        </form>
        <p className="auth-privacy"><LockKeyhole size={13}/>Your workspace is private to your account.</p>
      </section>
    </main><footer className="auth-footer">Made for meaningful work.</footer>
  </div>;
}

export async function getServerSideProps({ req, res }) {
  res.setHeader("Cache-Control", "no-store");
  const { getUser } = await import("@/lib/auth");
  try { if (await getUser(req)) return { redirect: { destination: "/", permanent: false } }; } catch { /* Keep login available while MongoDB is unavailable. */ }
  const { DEFAULT_ACCOUNT_EMAIL } = await import("@/lib/default-account.mjs");
  return { props: { configured: Boolean(process.env.MONGODB_URI), defaultEmail: DEFAULT_ACCOUNT_EMAIL } };
}
