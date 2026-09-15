import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, ImagePlus, Plus, Save, Trash2, Zap } from "lucide-react";
import Avatar from "@/components/Avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { applyTheme } from "@/lib/theme-client";
import { PREDEFINED_AVATARS, THEMES, statusesFor } from "@/lib/preferences";

export default function Settings({ user }) {
  const [form, setForm] = useState({
    name: user.name,
    workspaceName: user.workspaceName,
    avatar: user.avatar,
    theme: user.theme,
    statuses: statusesFor(user),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const upload = useRef(null);

  useEffect(() => { applyTheme(form.theme); }, [form.theme]);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  function chooseFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1_000_000) {
      setError("Upload a PNG, JPEG, or WebP image smaller than 1 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { set("avatar", reader.result); setError(""); };
    reader.onerror = () => setError("That image could not be read.");
    reader.readAsDataURL(file);
  }

  function addStatus() {
    const key = `Custom ${Date.now()}`;
    const number = form.statuses.filter((item) => item.key.startsWith("Custom ")).length + 1;
    set("statuses", [...form.statuses, { key, label: `New status ${number}` }]);
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (response.status === 401) { window.location.replace("/login"); return; }
      if (!response.ok) throw new Error(result.error || "Could not save settings.");
      setForm(result);
      applyTheme(result.theme);
      setSaved(true);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="settings-page">
      <Head><title>Settings · Momentum</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <header className="settings-topbar">
        <Link href="/" className="brand"><Zap size={25} fill="currentColor" />momentum<span>.</span></Link>
        <div><Link href="/" className="secondary"><ArrowLeft size={16} /> Back to workspace</Link><ThemeToggle /></div>
      </header>
      <main className="settings-main">
        <section className="settings-heading">
          <p className="eyebrow">PERSONALISE YOUR WORKSPACE</p>
          <h1>Settings<span>.</span></h1>
          <p>Make Momentum feel like your own.</p>
        </section>
        <form onSubmit={submit}>
          <section className="settings-card">
            <div className="settings-card-title"><div><h2>Profile and workspace</h2><p>Choose how you appear and name your workspace.</p></div><Avatar avatar={form.avatar} name={form.name} /></div>
            <div className="settings-grid">
              <label>Display name<input required minLength="2" maxLength="80" value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
              <label>Workspace name<input required minLength="2" maxLength="80" value={form.workspaceName} onChange={(e) => set("workspaceName", e.target.value)} /></label>
            </div>
            <fieldset className="avatar-settings"><legend>Choose an avatar</legend><div className="avatar-options">
              {PREDEFINED_AVATARS.map((avatar) => <button type="button" key={avatar} className={form.avatar === avatar ? "selected" : ""} aria-label={`Use ${avatar} avatar`} aria-pressed={form.avatar === avatar} onClick={() => set("avatar", avatar)}>{avatar}</button>)}
              <button type="button" className={form.avatar?.startsWith("data:image/") ? "selected upload-avatar" : "upload-avatar"} onClick={() => upload.current?.click()}><ImagePlus size={20} /><span>Upload</span></button>
            </div></fieldset>
            <input ref={upload} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseFile} />
          </section>

          <section className="settings-card">
            <div className="settings-card-title"><div><h2>Statuses</h2><p>Rename the labels shown throughout your task board or add your own.</p></div><button type="button" className="secondary" disabled={form.statuses.length >= 12} onClick={addStatus}><Plus size={16} /> Add status</button></div>
            <div className="status-settings">
              {form.statuses.map((status, index) => {
                const required = ["Ongoing", "Done"].includes(status.key);
                return <div className="status-setting" key={status.key}>
                  <span className={`column-dot ${status.key.toLowerCase().replaceAll(" ", "-")}`} />
                  <input aria-label={`Rename ${status.label}`} maxLength="30" required value={status.label} onChange={(e) => set("statuses", form.statuses.map((item, itemIndex) => itemIndex === index ? { ...item, label: e.target.value } : item))} />
                  <button type="button" className="icon-button" disabled={required || form.statuses.length <= 2} title={required ? "Required for progress tracking" : "Delete status"} aria-label={`Delete ${status.label}`} onClick={() => set("statuses", form.statuses.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button>
                </div>;
              })}
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-title"><div><h2>Theme</h2><p>Select one of five colour themes.</p></div></div>
            <div className="theme-options">
              {THEMES.map((theme) => <button type="button" key={theme.key} className={form.theme === theme.key ? "selected" : ""} aria-pressed={form.theme === theme.key} onClick={() => set("theme", theme.key)}><span style={{ background: theme.color }} />{theme.label}{form.theme === theme.key && <Check size={16} />}</button>)}
            </div>
          </section>

          {error && <p className="error" role="alert">{error}</p>}
          {saved && <p className="settings-success" role="status"><Check size={17} /> Settings saved</p>}
          <div className="settings-actions"><button className="primary" disabled={busy}><Save size={17} />{busy ? "Saving…" : "Save settings"}</button></div>
        </form>
      </main>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  res.setHeader("Cache-Control", "no-store");
  const { getUser } = await import("@/lib/auth");
  try {
    const user = await getUser(req);
    if (user) return { props: { user } };
  } catch { /* Protected settings stay unavailable if authentication fails. */ }
  return { redirect: { destination: "/login", permanent: false } };
}
