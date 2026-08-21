import { useState } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "Done":        { color: "#059669", bg: "#D1FAE5", dot: "#10B981" },
  "Ongoing":     { color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  "Waiting":     { color: "#B45309", bg: "#FEF3C7", dot: "#F59E0B" },
  "Blocked":     { color: "#B91C1C", bg: "#FEE2E2", dot: "#EF4444" },
  "Not Started": { color: "#6B21A8", bg: "#F3E8FF", dot: "#A855F7" },
  "Planned":     { color: "#0F766E", bg: "#CCFBF1", dot: "#14B8A6" },
};

const PRIORITY_CONFIG = {
  High:   { color: "#EF4444" },
  Medium: { color: "#F59E0B" },
  Low:    { color: "#10B981" },
};

const DAILY_CATEGORIES = ["UAT Issue", "Onboarding", "Card Program", "Engineering", "Other"];
const FY27_CATEGORIES  = ["Security", "Engineering", "Reporting", "Product Expansion", "Go-to-Market", "Strategy", "Other"];
const FY27_QUARTERS    = ["Q1 FY27", "Q2 FY27", "Q3 FY27", "Q4 FY27"];
const DAILY_STATUSES   = ["Ongoing", "Waiting", "Done", "Blocked"];
const FY27_STATUSES    = ["Planned", "Not Started", "Ongoing", "Done", "Blocked"];
const PRIORITIES       = ["High", "Medium", "Low"];
const CATEGORY_ICONS   = { Security: "🔐", Engineering: "⚙️", Reporting: "📊", Strategy: "🎯", "Product Expansion": "🚀", "Go-to-Market": "🌐", "UAT Issue": "🐛", Onboarding: "🏦", "Card Program": "💳", Other: "📌" };

let _nextId = 200;
const genId = () => ++_nextId;

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const DAILY_TASKS = [
  { id: 1,  title: "First Bank – Change PIN API (504 Gateway Timeout)",    category: "UAT Issue",    status: "Done",    owner: "Kayode",          priority: "High",   notes: "FBN getting 504 Gateway Timeout on Change PIN API on UAT. Kayode is handling.", subtasks: [] },
  { id: 2,  title: "Kuda Bank – Differentiate Virtual Card Program",        category: "Card Program", status: "Ongoing", owner: "Hafeez",          priority: "Medium", notes: "Liaise with Service Management and reach out to Kuda on differentiating the card program so virtual cards have their own dedicated program.", subtasks: [] },
  { id: 3,  title: "UBA Onboarding – Security Issue (Next PI)",             category: "Onboarding",   status: "Waiting", owner: "Sam / Hafeez",    priority: "High",   notes: "Scope the security issue with Sam. Bank is escalating due to delays. Committed to resolving in next PI. Needs prioritisation.", subtasks: [] },
  { id: 4,  title: "Keystone Bank – AES GCM Encryption on UAT",            category: "Onboarding",   status: "Ongoing", owner: "EFT Team",        priority: "High",   notes: "New build has errors on UAT. EFT needs to use the AES GCM tool to encrypt/decrypt the password.", subtasks: [] },
  { id: 5,  title: "Password Bulk Error – Log Chunking Strategy",           category: "Engineering",  status: "Ongoing", owner: "EFT Team",        priority: "Medium", notes: "Chunking strategy to split large log files. Needs EFT testing before bank deployment. Send email to EFT with build attached. First Bank priority.", subtasks: [{ id: "5a", text: "Send email to EFT with build attached", done: false }, { id: "5b", text: "EFT to test on First Bank (Priority)", done: false }, { id: "5c", text: "Deploy to production", done: false }] },
  { id: 6,  title: "Union Bank – UAT Demo Issues Resolution",               category: "UAT Issue",    status: "Ongoing", owner: "Samuel / Hafeez", priority: "High",   notes: "Schedule meeting with Samuel. Three open action items from UAT Demo.", subtasks: [{ id: "6a", text: "Implement validation to prevent duplicate VC creation", done: false }, { id: "6b", text: "Encrypt virtual card records on pc_cards (EOW)", done: false }, { id: "6c", text: "Ensure account records created on pc_accounts where absent", done: false }] },
  { id: 7,  title: "Globus Bank – FCI CMS API Onboarding",                 category: "Onboarding",   status: "Ongoing", owner: "Hafeez",          priority: "Low",    notes: "Onboarding going smoothly. Monitor and support as needed.", subtasks: [] },
  { id: 10, title: "UBA Virtual Card – HSM Prod Issue", category: "UAT Issue", status: "Ongoing", owner: "Hafeez / Mikalum", priority: "High", notes: "HSM is working on Test but not on Prod for UBA. Mikalum likely requires this to be logged on Jira. Needs investigation to identify why HSM config/connectivity differs between Test and Prod environments.", subtasks: [{ id: "10a", text: "Log issue on Jira as requested by Mikalum", done: false }, { id: "10b", text: "Investigate HSM config difference between Test and Prod", done: false }, { id: "10c", text: "Engage EFT / Infra team to resolve Prod HSM issue", done: false }] },
  { id: 9,  title: "Virtual Card Transaction Volume – DB Data Pull", category: "Engineering",  status: "Waiting", owner: "Hafeez / Anthony Hungbo", priority: "High", notes: "Speak with Anthony Hungbo to spool transaction volume data from the DB for all virtual card customers. Need to understand the number of transactions processed per customer across their card programmes. Will provide Anthony with the list of customers and their respective card programmes.", subtasks: [{ id: "9a", text: "Compile list of virtual card customers and their card programmes", done: false }, { id: "9b", text: "Schedule discussion with Anthony Hungbo", done: false }, { id: "9c", text: "Anthony to spool transaction volume data per customer from DB", done: false }, { id: "9d", text: "Review and analyse the data", done: false }] },
  { id: 8,  title: "API Marketplace – List Virtual Card API Endpoints", category: "Engineering",  status: "Ongoing", owner: "Hafeez", priority: "Medium", notes: "Define and document all Virtual Card API endpoints to be listed on the API Marketplace. Goal: expose the full card lifecycle management surface — creation, activation, freeze/unfreeze, block, limits, metadata, and other relevant capabilities — in a structured, marketplace-ready format.", subtasks: [{ id: "8a", text: "Audit all existing Virtual Card middleware API endpoints", done: false }, { id: "8b", text: "Determine which endpoints are marketplace-ready", done: false }, { id: "8c", text: "Document specs — request/response, auth, error codes", done: false }, { id: "8d", text: "Review and sign off with Engineering", done: false }] },
];

const FY27_TASKS = [
  { id: 101, title: "Virtual Card Security Architecture Overhaul",              category: "Security",          status: "Planned", owner: "Hafeez / Sam",       priority: "High",   quarter: "Q1 FY27", notes: "Define and implement a robust security architecture for the Virtual Card middleware. Scope covers encryption standards, token security, API authentication, and compliance alignment with PCI-DSS and CBN guidelines.", subtasks: [] },
  { id: 102, title: "Unified Build – Consolidate Virtual Card Middleware",       category: "Engineering",       status: "Planned", owner: "Hafeez / EFT",       priority: "High",   quarter: "Q2 FY27", notes: "Reduce multiple coexisting builds of the Virtual Card middleware into a single, versioned build. Goal: eliminate deployment inconsistencies, reduce maintenance overhead, and simplify onboarding for new banks.", subtasks: [] },
  { id: 103, title: "Mastercard GCO Reporting Dashboard",                        category: "Reporting",         status: "Planned", owner: "Hafeez",              priority: "Medium", quarter: "Q2 FY27", notes: "Create a reporting dashboard for Mastercard Global Clearing Operations (GCO) requirements. Dashboard should surface key scheme compliance metrics and reporting data required for Mastercard submissions.", subtasks: [] },
  { id: 104, title: "Virtual-to-Physical Card Upgrade",                          category: "Product Expansion", status: "Planned", owner: "Hafeez",              priority: "High",   quarter: "Q2 FY27", notes: "Virtual-first issuance model where customers begin with instant virtual cards and later materialise the same card as a physical instrument. Requires tight FCI CMS Portal integration to ensure a single PAN lifecycle, continuity of controls, and seamless virtual-to-physical fulfillment.", subtasks: [] },
  { id: 105, title: "Dynamic CVV for Enhanced Security",                         category: "Security",          status: "Planned", owner: "Hafeez",              priority: "High",   quarter: "Q3 FY27", notes: "Dynamic CVV makes card details time-bound and less reusable, aligning with scheme-grade security expectations. Opt-in feature — customers billed based on preference. Reduces fraud exposure for issuers and increases confidence for banks and fintechs deploying at scale.", subtasks: [] },
  { id: 106, title: "Product Website Landing Page",                              category: "Go-to-Market",      status: "Planned", owner: "Hafeez",              priority: "Medium", quarter: "Q1 FY27", notes: "A dedicated landing page to communicate the product as a card issuance and management platform — covering lifecycle ownership, security controls, virtual-to-physical readiness, and API-first design. Goal is qualification and clarity, not marketing.", subtasks: [] },
  { id: 107, title: "Virtual Card Tokenization",                                 category: "Security",          status: "Planned", owner: "Hafeez",              priority: "High",   quarter: "Q3 FY27", notes: "Implement tokenization of virtual card credentials to replace static PANs with network tokens. Aligns with Visa Token Service / Mastercard MDES standards, reduces PAN exposure, and strengthens security posture at scale.", subtasks: [] },
  { id: 108, title: "Virtual Card Reporting Dashboard (ASPFEP Customers)",       category: "Reporting",         status: "Ongoing", owner: "Hafeez / Data Team",  priority: "Medium", quarter: "Q1 FY27", notes: "Power BI dashboard to track the number of virtual cards issued by Multitenancy (ASPFEP) customers. Provides visibility into issuance volumes per customer. Already logged with the Data Team.", subtasks: [{ id: "108a", text: "Data Team to scope data model and sources", done: false }, { id: "108b", text: "Define key metrics — cards issued per customer, trends, active vs inactive", done: false }, { id: "108c", text: "Review and sign off on dashboard design", done: false }, { id: "108d", text: "UAT and deployment", done: false }] },
];

// ─── SHARED UI ────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: "#64748B", bg: "#F1F5F9", dot: "#94A3B8" };
  return (
    <span style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

const PRIORITY_FLAG = {
  High:   { color: "#fff", bg: "#EF4444", icon: "🔴" },
  Medium: { color: "#fff", bg: "#F59E0B", icon: "🟡" },
  Low:    { color: "#fff", bg: "#10B981", icon: "🟢" },
};

function PriorityFlag({ priority }) {
  const cfg = PRIORITY_FLAG[priority] || { color: "#fff", bg: "#94A3B8", icon: "⚪" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, whiteSpace: "nowrap" }}>
      {priority}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return <PriorityFlag priority={priority} />;
}

const iStyle = { width: "100%", padding: "8px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fff" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function AddTaskButton({ onClick, accent, label = "Add Task" }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: `2px dashed ${accent}`, background: hov ? accent + "15" : "transparent", color: accent, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background 0.15s" }}>
      <span style={{ fontSize: 17 }}>+</span> {label}
    </button>
  );
}

// ─── ADD TASK MODAL ───────────────────────────────────────────────────────────

function AddTaskModal({ isStrategic, onClose, onAdd }) {
  const accent = isStrategic ? "#0F766E" : "#7C3AED";
  const [form, setForm] = useState({
    id: genId(), title: "", category: isStrategic ? "Security" : "Onboarding",
    status: isStrategic ? "Planned" : "Ongoing", owner: "", priority: "High",
    notes: "", subtasks: [], ...(isStrategic ? { quarter: "Q1 FY27" } : {}),
  });
  const [newAction, setNewAction] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addAction = () => {
    const t = newAction.trim(); if (!t) return;
    setForm(p => ({ ...p, subtasks: [...p.subtasks, { id: `${p.id}-${Date.now()}`, text: t, done: false }] }));
    setNewAction("");
  };
  const removeAction = sid => setForm(p => ({ ...p, subtasks: p.subtasks.filter(s => s.id !== sid) }));
  const canSave = form.title.trim().length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,8,23,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>{isStrategic ? "FY27 Roadmap" : "Daily Tasks"}</p>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>{isStrategic ? "Add Initiative" : "Add Task"}</h2>
          </div>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#64748B", fontSize: 16 }}>✕</button>
        </div>

        <Field label="Title *">
          <input value={form.title} onChange={e => set("title", e.target.value)} placeholder={isStrategic ? "e.g. Virtual Card Dispute Management" : "e.g. GTBank – Virtual Card Onboarding"} style={iStyle} autoFocus />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Category">
            <select value={form.category} onChange={e => set("category", e.target.value)} style={iStyle}>
              {(isStrategic ? FY27_CATEGORIES : DAILY_CATEGORIES).map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={e => set("priority", e.target.value)} style={iStyle}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Status">
            <select value={form.status} onChange={e => set("status", e.target.value)} style={iStyle}>
              {(isStrategic ? FY27_STATUSES : DAILY_STATUSES).map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Owner">
            <input value={form.owner} onChange={e => set("owner", e.target.value)} placeholder="e.g. Hafeez / EFT" style={iStyle} />
          </Field>
        </div>

        {isStrategic && (
          <Field label="Quarter">
            <select value={form.quarter} onChange={e => set("quarter", e.target.value)} style={iStyle}>
              {FY27_QUARTERS.map(q => <option key={q}>{q}</option>)}
            </select>
          </Field>
        )}

        <Field label="Notes / Objective">
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Context, objective, or blockers…" rows={3} style={{ ...iStyle, resize: "vertical", lineHeight: 1.6 }} />
        </Field>

        <Field label="Action Items (optional)">
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={newAction} onChange={e => setNewAction(e.target.value)} onKeyDown={e => e.key === "Enter" && addAction()} placeholder="Type item and press Enter or +" style={{ ...iStyle, flex: 1 }} />
            <button onClick={addAction} style={{ width: 36, height: 36, borderRadius: 9, border: "none", background: accent, color: "#fff", fontSize: 22, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          {form.subtasks.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px", borderRadius: 8, background: "#F8FAFC", border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", marginBottom: 6 }}>
              <span>• {s.text}</span>
              <button onClick={() => removeAction(s.id)} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          ))}
        </Field>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 18, borderTop: "1.5px solid #F1F5F9" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#64748B", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { if (canSave) { onAdd(form); onClose(); } }}
            style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: canSave ? accent : "#CBD5E1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: canSave ? "pointer" : "not-allowed" }}>
            {isStrategic ? "Add Initiative" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────

function EditModal({ task, isStrategic, onClose, onSave, onDelete }) {
  const accent = isStrategic ? "#0F766E" : "#7C3AED";
  const [edited, setEdited] = useState({ ...task, subtasks: (task.subtasks || []).map(s => ({ ...s })) });
  const [newAction, setNewAction] = useState("");

  const set = (k, v) => setEdited(p => ({ ...p, [k]: v }));
  const toggleSub = sid => setEdited(p => ({ ...p, subtasks: p.subtasks.map(s => s.id === sid ? { ...s, done: !s.done } : s) }));
  const addAction = () => {
    const t = newAction.trim(); if (!t) return;
    setEdited(p => ({ ...p, subtasks: [...p.subtasks, { id: `${p.id}-${Date.now()}`, text: t, done: false }] }));
    setNewAction("");
  };
  const removeSub = sid => setEdited(p => ({ ...p, subtasks: p.subtasks.filter(s => s.id !== sid) }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,8,23,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: "flex", gap: 7, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: 1, background: isStrategic ? "#CCFBF1" : "#EDE9FE", padding: "2px 8px", borderRadius: 20 }}>{edited.category}</span>
              {isStrategic && edited.quarter && <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: 20 }}>{edited.quarter}</span>}
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", lineHeight: 1.4 }}>{edited.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748B", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <StatusBadge status={edited.status} />
          <PriorityBadge priority={edited.priority} />
          <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>👤 {edited.owner}</span>
        </div>

        <Field label="Status">
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {(isStrategic ? FY27_STATUSES : DAILY_STATUSES).map(s => {
              const cfg = STATUS_CONFIG[s] || {}; const active = edited.status === s;
              return <button key={s} onClick={() => set("status", s)} style={{ padding: "5px 14px", borderRadius: 20, border: `2px solid ${active ? cfg.dot : "#E2E8F0"}`, background: active ? cfg.bg : "#fff", color: active ? cfg.color : "#64748B", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{s}</button>;
            })}
          </div>
        </Field>

        <Field label="Notes">
          <textarea value={edited.notes} onChange={e => set("notes", e.target.value)} rows={3} style={{ ...iStyle, resize: "vertical", lineHeight: 1.6 }} />
        </Field>

        <Field label="Action Items">
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={newAction} onChange={e => setNewAction(e.target.value)} onKeyDown={e => e.key === "Enter" && addAction()} placeholder="Add action item…" style={{ ...iStyle, flex: 1 }} />
            <button onClick={addAction} style={{ width: 36, height: 36, borderRadius: 9, border: "none", background: accent, color: "#fff", fontSize: 22, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          {edited.subtasks.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, background: s.done ? "#F0FDF4" : "#F8FAFC", border: `1.5px solid ${s.done ? "#BBF7D0" : "#E2E8F0"}`, marginBottom: 6 }}>
              <input type="checkbox" checked={s.done} onChange={() => toggleSub(s.id)} style={{ accentColor: accent, width: 14, height: 14, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: s.done ? "#059669" : "#334155", textDecoration: s.done ? "line-through" : "none" }}>{s.text}</span>
              <button onClick={() => removeSub(s.id)} style={{ background: "none", border: "none", color: "#CBD5E1", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          ))}
        </Field>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18, borderTop: "1.5px solid #F1F5F9" }}>
          <button onClick={() => { if (window.confirm("Delete this task?")) { onDelete(task.id); onClose(); } }}
            style={{ padding: "8px 16px", borderRadius: 9, border: "1.5px solid #FEE2E2", background: "#fff", fontSize: 12, fontWeight: 700, color: "#EF4444", cursor: "pointer" }}>
            🗑 Delete
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#64748B", cursor: "pointer" }}>Cancel</button>
            <button onClick={() => { onSave(edited); onClose(); }} style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TASK CARDS ───────────────────────────────────────────────────────────────

function DailyCard({ task, onClick }) {
  const done = task.subtasks.filter(s => s.done).length; const total = task.subtasks.length;
  return (
    <div onClick={onClick} style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "16px 18px", cursor: "pointer", borderLeft: `4px solid ${STATUS_CONFIG[task.status]?.dot || "#CBD5E1"}`, transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(124,58,237,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{task.category}</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", lineHeight: 1.4 }}>{task.title}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>
      <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{task.notes || "—"}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10 }}><PriorityBadge priority={task.priority} /><span style={{ fontSize: 11, color: "#94A3B8" }}>👤 {task.owner}</span></div>
        {total > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: done === total ? "#10B981" : "#7C3AED" }}>{done}/{total} done</span>}
      </div>
    </div>
  );
}

function FY27Card({ task, onClick }) {
  const icon = CATEGORY_ICONS[task.category] || "📌";
  return (
    <div onClick={onClick} style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: "20px", cursor: "pointer", borderTop: `4px solid ${STATUS_CONFIG[task.status]?.dot || "#CBD5E1"}`, transition: "box-shadow 0.2s, transform 0.2s", display: "flex", flexDirection: "column", gap: 12 }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(20,184,166,0.13)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        <StatusBadge status={task.status} />
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#0F766E", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{task.category}</p>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", lineHeight: 1.4 }}>{task.title}</p>
      </div>
      <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{task.notes || "—"}</p>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", gap: 8 }}><PriorityBadge priority={task.priority} /><span style={{ fontSize: 11, color: "#94A3B8" }}>👤 {task.owner}</span></div>
        {task.quarter && <span style={{ fontSize: 11, fontWeight: 700, color: "#0F766E", background: "#F0FDFA", padding: "2px 10px", borderRadius: 20 }}>{task.quarter}</span>}
      </div>
    </div>
  );
}

// ─── STATS ROW ────────────────────────────────────────────────────────────────

function StatsRow({ tasks, accent, isStrategic }) {
  const done = tasks.filter(t => t.status === "Done").length;
  const ongoing = tasks.filter(t => t.status === "Ongoing").length;
  const other = tasks.length - done - ongoing;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
      {[{ l: "Total", v: tasks.length, c: accent }, { l: "Done", v: done, c: "#10B981" }, { l: "Ongoing", v: ongoing, c: "#3B82F6" }, { l: isStrategic ? "Planned" : "Waiting", v: other, c: isStrategic ? "#14B8A6" : "#F59E0B" }].map(s => (
        <div key={s.l} style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 26, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</p>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>{s.l}</p>
        </div>
      ))}
    </div>
  );
}

// ─── DAILY TAB ────────────────────────────────────────────────────────────────

function DailyTab({ tasks, setTasks }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);

  const cats = ["All", ...Array.from(new Set(tasks.map(t => t.category)))];
  const filtered = tasks.filter(t =>
    (filterCat === "All" || t.category === filterCat) &&
    (filterStatus === "All" || t.status === filterStatus) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || (t.notes || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <StatsRow tasks={tasks} accent="#7C3AED" isStrategic={false} />
      <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search tasks…" style={{ flex: 1, minWidth: 160, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", outline: "none" }} />
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {cats.map(c => <button key={c} onClick={() => setFilterCat(c)} style={{ padding: "4px 11px", borderRadius: 20, border: `1.5px solid ${filterCat === c ? "#7C3AED" : "#E2E8F0"}`, background: filterCat === c ? "#7C3AED" : "#fff", color: filterCat === c ? "#fff" : "#64748B", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{c}</button>)}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["All", ...DAILY_STATUSES].map(s => { const cfg = STATUS_CONFIG[s] || {}; const a = filterStatus === s; return <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "4px 11px", borderRadius: 20, border: `1.5px solid ${a ? (cfg.dot || "#7C3AED") : "#E2E8F0"}`, background: a ? (cfg.bg || "#EDE9FE") : "#fff", color: a ? (cfg.color || "#7C3AED") : "#64748B", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{s}</button>; })}
        </div>
        <AddTaskButton onClick={() => setAdding(true)} accent="#7C3AED" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map(t => <DailyCard key={t.id} task={t} onClick={() => setSelected(t)} />)}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#94A3B8" }}><p style={{ fontSize: 36 }}>🔍</p><p style={{ fontWeight: 700 }}>No tasks match</p></div>}
      </div>
      {adding && <AddTaskModal isStrategic={false} onClose={() => setAdding(false)} onAdd={t => setTasks(p => [...p, t])} />}
      {selected && <EditModal task={selected} isStrategic={false} onClose={() => setSelected(null)} onSave={u => setTasks(p => p.map(t => t.id === u.id ? u : t))} onDelete={id => { setTasks(p => p.filter(t => t.id !== id)); setSelected(null); }} />}
    </div>
  );
}

// ─── FY27 TAB ─────────────────────────────────────────────────────────────────

function FY27Tab({ tasks, setTasks }) {
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterQuarter, setFilterQuarter] = useState("All");

  const filtered = tasks.filter(t =>
    (filterStatus === "All" || t.status === filterStatus) &&
    (filterQuarter === "All" || t.quarter === filterQuarter)
  );

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #0F766E 0%, #134E4A 100%)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 800, color: "#99F6E4", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Strategic Initiatives</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>FY 2027 — Virtual Card Roadmap</p>
          <p style={{ fontSize: 12, color: "#99F6E4", marginTop: 4 }}>Long-horizon product investments · {tasks.length} initiatives</p>
        </div>
        <div style={{ fontSize: 36 }}>🗺️</div>
      </div>
      <StatsRow tasks={tasks} accent="#0F766E" isStrategic={true} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...FY27_STATUSES].map(s => { const cfg = STATUS_CONFIG[s] || {}; const a = filterStatus === s; return <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "5px 13px", borderRadius: 20, border: `1.5px solid ${a ? (cfg.dot || "#0F766E") : "#E2E8F0"}`, background: a ? (cfg.bg || "#F0FDFA") : "#fff", color: a ? (cfg.color || "#0F766E") : "#64748B", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{s}</button>; })}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", ...FY27_QUARTERS].map(q => <button key={q} onClick={() => setFilterQuarter(q)} style={{ padding: "5px 13px", borderRadius: 20, border: `1.5px solid ${filterQuarter === q ? "#0F766E" : "#E2E8F0"}`, background: filterQuarter === q ? "#CCFBF1" : "#fff", color: filterQuarter === q ? "#0F766E" : "#64748B", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{q}</button>)}
        </div>
        <div style={{ marginLeft: "auto" }}><AddTaskButton onClick={() => setAdding(true)} accent="#0F766E" label="Add Initiative" /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map(t => <FY27Card key={t.id} task={t} onClick={() => setSelected(t)} />)}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#94A3B8" }}><p style={{ fontSize: 36 }}>🔍</p><p style={{ fontWeight: 700 }}>No initiatives match</p></div>}
      </div>
      {adding && <AddTaskModal isStrategic={true} onClose={() => setAdding(false)} onAdd={t => setTasks(p => [...p, t])} />}
      {selected && <EditModal task={selected} isStrategic={true} onClose={() => setSelected(null)} onSave={u => setTasks(p => p.map(t => t.id === u.id ? u : t))} onDelete={id => { setTasks(p => p.filter(t => t.id !== id)); setSelected(null); }} />}
    </div>
  );
}

// ─── QUARTERLY ────────────────────────────────────────────────────────────────

function QuarterlyTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 340, gap: 16, background: "#fff", borderRadius: 16, border: "2px dashed #E2E8F0", padding: 40 }}>
      <div style={{ fontSize: 52 }}>📅</div>
      <p style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>Quarterly Task Manager</p>
      <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>Reserved for quarterly planning tasks.<br />Will be set up when you're ready.</p>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", background: "#EDE9FE", padding: "4px 14px", borderRadius: 20 }}>Coming Soon</span>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "daily",     label: "Daily Tasks",  icon: "⚡", accent: "#7C3AED" },
  { id: "fy27",      label: "FY27 Roadmap", icon: "🗺️", accent: "#0F766E" },
  { id: "quarterly", label: "Quarterly",    icon: "📅", accent: "#2563EB" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("daily");
  const [dailyTasks, setDailyTasks] = useState(DAILY_TASKS);
  const [fy27Tasks, setFY27Tasks] = useState(FY27_TASKS);
  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#F1F5F9", minHeight: "100vh" }}>
      <div style={{ background: "#0F172A", padding: "16px 28px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #0F766E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🗂</div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>Virtual Card PM Hub</p>
          <p style={{ fontSize: 11, color: "#475569" }}>Hafeez · Interswitch</p>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#475569", fontWeight: 600 }}>
          {new Date().toLocaleDateString("en-NG", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1.5px solid #E2E8F0", padding: "0 28px", display: "flex" }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 800 : 600, color: active ? tab.accent : "#94A3B8", borderBottom: active ? `3px solid ${tab.accent}` : "3px solid transparent", display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s", marginBottom: -1 }}>
            {tab.icon} {tab.label}
          </button>;
        })}
      </div>

      <div style={{ padding: "28px 28px 48px" }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
            <span>{currentTab.icon}</span><span style={{ color: currentTab.accent }}>{currentTab.label}</span>
          </h1>
          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, marginLeft: 30 }}>
            {activeTab === "daily" && "Click a card to edit · Use '+ Add Task' to create new"}
            {activeTab === "fy27" && "Click a card to edit · Use '+ Add Initiative' to create new"}
            {activeTab === "quarterly" && "Coming soon"}
          </p>
        </div>
        {activeTab === "daily"     && <DailyTab tasks={dailyTasks} setTasks={setDailyTasks} />}
        {activeTab === "fy27"      && <FY27Tab  tasks={fy27Tasks}  setTasks={setFY27Tasks}  />}
        {activeTab === "quarterly" && <QuarterlyTab />}
      </div>
    </div>
  );
}
