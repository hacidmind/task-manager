import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/router";
import { gsap } from "gsap";
import { animate, stagger } from "animejs";
import {
  Zap,
  LayoutGrid,
  CalendarDays,
  Map,
  Plus,
  Search,
  Check,
  CheckCheck,
  ArrowUpRight,
  X,
  Flag,
  List,
  ChevronRight,
  Sparkles,
  Target,
  Circle,
  SlidersHorizontal,
  LogOut,
} from "lucide-react";
const VIEWS = [
  {
    id: "daily",
    label: "Daily tasks",
    icon: LayoutGrid,
    description: "A little focus. A lot of progress.",
  },
  {
    id: "quarterly",
    label: "Quarterly planning",
    icon: CalendarDays,
    description: "Turn your priorities into a clear plan.",
  },
  {
    id: "fy27",
    label: "FY27 roadmap",
    icon: Map,
    description: "Make space for the next big thing.",
  },
];
const STATUSES = [
  "Not Started",
  "Planned",
  "Ongoing",
  "Waiting",
  "Blocked",
  "Done",
];
const CATEGORIES = [
  "Engineering",
  "Onboarding",
  "Card Program",
  "UAT Issue",
  "Security",
  "Reporting",
  "Product Expansion",
  "Go-to-Market",
  "Strategy",
  "Other",
];
const viewOf = (t) =>
  t.taskType === "quarterly" ? "quarterly" : t.isStrategic ? "fy27" : "daily";
const localDay = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const completion = (task) => task.status === "Done" ? 100 : task.subtasks?.length
  ? Math.round(task.subtasks.filter((item) => item.done).length / task.subtasks.length * 100) : 0;
const slug = (s) => (s || "").toLowerCase().replaceAll(" ", "-");
const blankTask = (view) => ({
  title: "",
  category: "Engineering",
  status: "Not Started",
  priority: "Medium",
  owner: "",
  notes: "",
  subtasks: [],
  isStrategic: view !== "daily",
  taskType: view === "quarterly" ? "quarterly" : null,
  quarter: view === "daily" ? null : "Q1 FY27",
});

function Editor({ task, view, onClose, onSave }) {
  const [form, setForm] = useState(task);
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const dialog = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.from(".editor-content", { y: 20, opacity: 0, duration: 0.3 });
      },
      dialog,
    );
    return () => {
      mm.revert();
      previous?.focus();
    };
  }, []);
  const addAction = () => {
    if (action.trim()) {
      set("subtasks", [
        ...form.subtasks,
        { id: crypto.randomUUID(), text: action.trim(), done: false },
      ]);
      setAction("");
    }
  };
  async function submit(e, remove = false) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave({ ...form, title: form.title.trim() }, remove);
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="editor"
      aria-labelledby="editor-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === dialog.current && !busy) onClose();
      }}
    >
      <form className="editor-content" onSubmit={submit}>
        <div className="editor-heading">
          <div>
            <p className="eyebrow">MAKE IT HAPPEN</p>
            <h2 id="editor-title">
              {task.id ? "Task details" : "Create a new task"}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close editor"
            disabled={busy}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <label>
          Task title
          <input
            autoFocus
            required
            maxLength={180}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="What needs to get done?"
          />
        </label>
        <div className="form-grid">
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {Array.from(new Set([...CATEGORIES, form.category])).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              {["High", "Medium", "Low"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Owner
            <input
              value={form.owner}
              onChange={(e) => set("owner", e.target.value)}
              placeholder="Who’s taking the lead?"
            />
          </label>
        </div>
        {view !== "daily" && (
          <label>
            Quarter
            <select
              value={form.quarter || "Q1 FY27"}
              onChange={(e) => set("quarter", e.target.value)}
            >
              {[1, 2, 3, 4].map((q) => (
                <option key={q}>Q{q} FY27</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Notes
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Add context, objectives, or blockers…"
          />
        </label>
        <label>
          Action items
          <div className="action-input">
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Break it into smaller steps"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAction();
                }
              }}
            />
            <button
              type="button"
              className="secondary"
              aria-label="Add action item"
              onClick={addAction}
            >
              <Plus size={17} />
            </button>
          </div>
        </label>
        <div className="action-list">
          {form.subtasks.map((s) => (
            <div key={s.id}>
              <label>
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={(e) =>
                    set(
                      "subtasks",
                      form.subtasks.map((x) =>
                        x.id === s.id ? { ...x, done: e.target.checked } : x,
                      ),
                    )
                  }
                />
                {s.text}
              </label>
              <button
                type="button"
                className="icon-button"
                aria-label={`Remove ${s.text}`}
                onClick={() =>
                  set(
                    "subtasks",
                    form.subtasks.filter((x) => x.id !== s.id),
                  )
                }
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="editor-footer">
          {task.id && (
            <button
              type="button"
              className="delete-button"
              disabled={busy}
              onClick={(e) => (deleting ? submit(e, true) : setDeleting(true))}
            >
              {deleting ? "Confirm delete" : "Delete task"}
            </button>
          )}
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="primary" disabled={busy || !form.title.trim()}>
            {busy ? "Saving…" : task.id ? "Save changes" : "Create task"}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default function Home({ user }) {
  const router = useRouter();
  const root = useRef(null);
  const [view, setView] = useState("daily");
  const [tasks, setTasks] = useState([]);
  const [storage, setStorage] = useState("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [layout, setLayout] = useState("board");
  const [editor, setEditor] = useState(null);
  const [toast, setToast] = useState("");
  const [today, setToday] = useState("");
  const [focusBusy, setFocusBusy] = useState(false);
  const [focusQuery, setFocusQuery] = useState("");
  const [choosingFocus, setChoosingFocus] = useState(true);
  useEffect(() => {
    const refresh = () => setToday(localDay());
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  const [help, setHelp] = useState(false);
  const [date, setDate] = useState("Your workspace, at a glance");
  const current = VIEWS.find((v) => v.id === view);
  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    const controller = new AbortController();
    (async () => {
      try {
        const r = await fetch("/api/tasks", { signal: controller.signal });
        if (r.status === 401) { window.location.replace("/login"); return; }
        const d = await r.json();
        if (!r.ok)
          throw new Error(
            d.error || "Could not connect to your online workspace. Check your database connection and reload.",
          );
          setTasks(
            [...d.dailyTasks, ...d.fy27Tasks, ...(d.quarterlyTasks || [])].map(
              (t) => ({ ...t, id: t._id || t.id }),
            ),
          );
          setStorage("mongodb");
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message);
          setStorage("error");
        }
      }
    })();
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.from(".reveal", {
          y: 18,
          opacity: 0,
          duration: 0.65,
          stagger: 0.09,
          ease: "power3.out",
        });
      },
      root,
    );
    return () => mm.revert();
  }, []);
  const scoped = tasks.filter((t) => viewOf(t) === view);
  const filtered = scoped.filter(
    (t) =>
      (status === "All" || t.status === status) &&
      (priority === "All" || t.priority === priority) &&
      `${t.title} ${t.owner} ${t.category} ${t.notes}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = root.current.querySelectorAll(".task-card, .column-empty");
    if (!cards.length) return;
    const a = animate(cards, {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(40),
      duration: 400,
      ease: "out(3)",
    });
    return () => a.revert();
  }, [tasks, view, query, status, priority, layout, storage]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function save(task, remove = false) {
    const exists = Boolean(task.id);
    let saved = { ...task, id: task.id || crypto.randomUUID() };
    if (storage === "mongodb") {
      const r = await fetch("/api/tasks", {
        method: remove ? "DELETE" : exists ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved),
      });
      const d = await r.json();
      if (r.status === 401) { window.location.replace("/login"); throw new Error("Your session has expired. Please sign in again."); }
      if (!r.ok)
        throw new Error(d.error || "Could not save. Please try again.");
      if (!exists) saved.id = d.id;
    } else
      throw new Error("Wait for your workspace to connect before saving.");
    const next = remove
      ? tasks.filter((t) => t.id !== task.id)
      : exists
        ? tasks.map((t) => (t.id === task.id ? saved : t))
        : [...tasks, saved];
    setTasks(next);
    setToast(
      remove
        ? "Task deleted"
        : exists
          ? "Changes saved"
          : "Task created. Let’s make progress.",
    );
  }
  async function toggleFocus(task) {
    setFocusBusy(true);
    setError("");
    const focusDate = task.focusDate === localDay() ? null : localDay();
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, focusDate }),
      });
      if (response.status === 401) { window.location.replace("/login"); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update today's focus.");
      setTasks((items) => items.map((item) => item.id === task.id ? { ...item, focusDate } : item));
      setToast(focusDate ? "Added to today’s focus" : "Removed from today’s focus");
    } catch (e) { setError(e.message); }
    finally { setFocusBusy(false); }
  }
  const focused = tasks.filter((task) => today && task.focusDate === today);
  const focusOptions = tasks.filter((task) => task.status !== "Done" && task.focusDate !== today &&
    `${task.title} ${task.owner}`.toLowerCase().includes(focusQuery.toLowerCase()));
  const done = scoped.filter((t) => t.status === "Done").length;
  const progress = scoped.filter((t) =>
    t.status === "Ongoing",
  ).length;
  const percent = scoped.length ? Math.round((done / scoped.length) * 100) : 0;
  const ready = storage === "mongodb";
  const groups =
    view === "daily"
      ? STATUSES.map((status) => ({
          title: status === "Ongoing" ? "In progress" : status === "Done" ? "Completed" : status,
          key: slug(status), status,
          test: (task) => task.status === status,
        }))
      : [1, 2, 3, 4].map((q) => ({
          title: `Q${q} FY27`,
          key: `q${q}`,
          test: (t) => (t.quarter || "Q1 FY27") === `Q${q} FY27`,
        }));
  const changeView = (id) => {
    setView(id);
    setStatus("All");
    setPriority("All");
    setQuery("");
  };
  const card = (t) => (
    <button
      key={t.id}
      className={`task-card ${t.status === "Done" ? "is-done" : ""}`}
      onClick={() => setEditor(t)}
    >
      <div className="card-top">
        <span className="category">{t.category}</span>
        <span className={`priority ${slug(t.priority)}`}>
          <Flag size={12} />
          {t.priority}
        </span>
      </div>
      <h3>{t.title}</h3>
      {t.notes && <p className="task-notes">{t.notes}</p>}
      <div className="card-meta">
        <span className={`status-badge ${slug(t.status)}`}>
          <span />
          {t.status}
        </span>
        {t.subtasks?.length > 0 && (
          <span className="subtask-count">
            <CheckCheck size={14} />
            {t.subtasks.filter((s) => s.done).length}/{t.subtasks.length}
          </span>
        )}
      </div>
      <div className="card-footer">
        <span className="owner">
          <span className="avatar small">
            {t.owner ? t.owner.slice(0, 2).toUpperCase() : "—"}
          </span>
          {t.owner || "Unassigned"}
        </span>
        <ArrowUpRight size={16} />
      </div>
    </button>
  );
  return (
    <div ref={root} className="app-shell">
      <Head>
        <title>{`${current.label} · Momentum`}</title>
        <meta
          name="description"
          content="A focused workspace for daily tasks, quarterly plans, and your FY27 roadmap."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <aside className="sidebar">
        <Link href="/" className="brand">
          <Zap size={26} fill="currentColor" />
          momentum<span>.</span>
        </Link>
        <div className="workspace">
          <span className="workspace-icon">VC</span>
          <div>
            <strong>Virtual Card</strong>
            <small>Product workspace</small>
          </div>
          <ChevronRight size={15} />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Workspace">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => changeView(v.id)}
              className={`nav-item ${view === v.id ? "active" : ""}`}
              aria-current={view === v.id ? "page" : undefined}
            >
              <v.icon size={18} />
              {v.label}
              {v.id === "daily" && (
                <span className="nav-count">
                  {
                    tasks.filter(
                      (t) => viewOf(t) === "daily" && t.status !== "Done",
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <Sparkles size={20} />
          <h3>Small steps. Big things.</h3>
          <p>One task at a time is still moving forward.</p>
          <div className="note-decoration">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{ height: 12 + i * 8 }} />
            ))}
          </div>
        </div>
        <div className="sidebar-bottom">
          <button className="help-button" onClick={() => setHelp(!help)}>
            <Circle size={16} />
            Getting started
            <ArrowUpRight size={15} />
          </button>
          <div className="profile">
            <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>Personal workspace</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace
            <ChevronRight size={13} />
            <strong>{current.label}</strong>
          </div>
          <div className="topbar-actions">
          <span className="storage-state">
            <span />
            {storage === "mongodb"
                ? "Online workspace connected"
                : storage === "error"
                  ? "Connection unavailable"
                  : "Connecting…"}
          </span>
          <ThemeToggle />
          <button className="theme-toggle" aria-label="Sign out" title="Sign out" onClick={async () => {
            try {
              const response = await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
              if (!response.ok) throw new Error("Unable to sign out. Please try again.");
              await router.replace("/login");
            } catch (e) { setError(e.message); }
          }}><LogOut size={17}/></button>
          </div>
        </header>
        <main>
          <section className="page-heading reveal">
            <div>
              <p className="eyebrow">YOUR SPACE TO MAKE PROGRESS</p>
              <h1>
                {current.label}
                <span>.</span>
              </h1>
              <p>{current.description}</p>
            </div>
            <button
              className="primary"
              disabled={!ready}
              onClick={() => setEditor(blankTask(view))}
            >
              <Plus size={18} />
              New {view === "fy27" ? "initiative" : "task"}
            </button>
          </section>
          {help && (
            <div className="help-panel">
              <strong>Your next step, made simple.</strong>
              <p>
                Create a task, then open its card to update its status, add
                action items, or assign an owner. Use quarterly planning and the
                roadmap for longer-term work. Tasks are saved to your online MongoDB database.
              </p>
              <button
                className="icon-button"
                aria-label="Dismiss help"
                onClick={() => setHelp(false)}
              >
                <X size={18} />
              </button>
            </div>
          )}
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <section className="overview reveal">
            <div className="overview-intro">
              <span className="today-label">
                <span />
                {date}
              </span>
              <h2>Welcome back, {user.name.split(" ")[0]}.</h2>
              <p>You bring the ideas. We’ll keep them organized.</p>
              <div className="progress-label">
                <span>Your completion rate</span>
                <strong>{percent}%</strong>
              </div>
              <div className="progress-track">
                <div style={{ width: `${percent}%` }} />
              </div>
            </div>
            <div className="overview-art" aria-hidden="true">
              <div className="orbit" />
              <div className="orbit inner" />
              <div className="art-card back" />
              <div className="art-card front">
                <span className="art-check">
                  <Check size={27} />
                </span>
                <span className="art-line" />
                <span className="art-line short" />
              </div>
              <span className="art-spark">✦</span>
            </div>
            <div className="overview-metrics">
              {[
                {
                  label: "Total tasks",
                  value: scoped.length,
                  icon: LayoutGrid,
                  color: "purple",
                },
                {
                  label: "In progress",
                  value: progress,
                  icon: Target,
                  color: "amber",
                },
                {
                  label: "Completed",
                  value: done,
                  icon: CheckCheck,
                  color: "green",
                },
              ].map((m) => (
                <div className="metric" key={m.label}>
                  <span className={`metric-icon ${m.color}`}>
                    <m.icon size={19} />
                  </span>
                  <div>
                    <strong>{String(m.value).padStart(2, "0")}</strong>
                    <span>{m.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="daily-focus reveal" aria-labelledby="focus-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR PRIORITIES FOR TODAY</p>
                <h2 id="focus-heading">Today’s focus <span>{focused.length}</span></h2>
                <p>Choose initiatives from daily tasks, quarterly planning, and your roadmap.</p>
              </div>
              <button className="secondary" disabled={!ready || !today} aria-expanded={choosingFocus}
                onClick={() => setChoosingFocus(!choosingFocus)}>
                <Plus size={16} /> {choosingFocus ? "Finish selecting" : "Select initiatives"}
              </button>
            </div>
            <p className="focus-explanation">Progress follows completed action items. Tasks marked Done show 100%; tasks without action items start at 0%. Selections reset each day.</p>
            {storage === "loading" ? <p role="status">Loading your priorities...</p> : !ready ? <p>Connect your workspace to load today’s priorities.</p> : (
              <>
                {!focused.length && <p className="focus-empty">What would make today a success? Select your first initiative to focus on.</p>}
                <div className="focus-list">
                  {focused.map((task) => (
                    <article className="focus-item" key={task.id}>
                      <div className="focus-title">
                        <button className="text-button" onClick={() => setEditor(task)}>{task.title}</button>
                        <button className="icon-button" disabled={focusBusy} aria-label={`Remove ${task.title} from today's focus`} onClick={() => toggleFocus(task)}><X size={16} /></button>
                      </div>
                      <div className="card-meta"><span>{VIEWS.find((v) => v.id === viewOf(task)).label}</span><span className={`status-badge ${slug(task.status)}`}>{task.status}</span></div>
                      <div className="progress-label"><span>Completion</span><strong>{completion(task)}%</strong></div>
                      <progress aria-label={`${task.title} completion`} max="100" value={completion(task)} />
                    </article>
                  ))}
                </div>
                {choosingFocus && <div className="focus-picker">
                  <label className="search-field"><Search size={17} /><input aria-label="Search initiatives to focus on" placeholder="Find an initiative..." value={focusQuery} onChange={(e) => setFocusQuery(e.target.value)} /></label>
                  {focusOptions.map((task) => <div className="focus-option" key={task.id}>
                    <div><strong>{task.title}</strong><small>{VIEWS.find((v) => v.id === viewOf(task)).label} / {task.status} / {completion(task)}% complete</small></div>
                    <button className="secondary" disabled={focusBusy} aria-label={`Focus on ${task.title} today`} onClick={() => toggleFocus(task)}>Focus today</button>
                  </div>)}
                  {!focusOptions.length && <p>No available initiatives. Create a task or adjust your search.</p>}
                </div>}
              </>
            )}
          </section>
          <section className="tasks-section reveal">
            <div className="section-heading">
              <div>
                <h2>
                  {view === "fy27" ? "Your initiatives" : "Your tasks"}
                  <span>{scoped.length}</span>
                </h2>
                <p>A clear view of what’s next.</p>
              </div>
              <div className="view-toggle" aria-label="Task layout">
                <button
                  aria-label="Board view"
                  aria-pressed={layout === "board"}
                  className={layout === "board" ? "selected" : ""}
                  onClick={() => setLayout("board")}
                >
                  <LayoutGrid size={16} />
                  Board
                </button>
                <button
                  aria-label="List view"
                  aria-pressed={layout === "list"}
                  className={layout === "list" ? "selected" : ""}
                  onClick={() => setLayout("list")}
                >
                  <List size={16} />
                  List
                </button>
              </div>
            </div>
            <div className="toolbar">
              <label className="search-field">
                <Search size={17} />
                <input
                  aria-label="Search tasks"
                  placeholder="Search tasks, people, or keywords…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    className="icon-button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              <div className="filters">
                <SlidersHorizontal size={16} />
                <select
                  aria-label="Filter by status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="All">All statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter by priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="All">All priorities</option>
                  {["High", "Medium", "Low"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {(status !== "All" || priority !== "All" || query) && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setStatus("All");
                      setPriority("All");
                      setQuery("");
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            {storage === "loading" ? (
              <div className="loading-state" role="status">
                Opening your workspace…
              </div>
            ) : layout === "board" ? (
              <div
                className={`board ${view !== "daily" ? "quarter-board" : ""}`}
              >
                {groups.map((g) => (
                  <section className={`board-column ${g.key}`} key={g.key}>
                    <div className="column-heading">
                      <span className="column-dot" />
                      <h3>{g.title}</h3>
                      <span className="column-count">
                        {filtered.filter(g.test).length}
                      </span>
                      <button
                        className="icon-button"
                        aria-label={`Add task to ${g.title}`}
                        disabled={!ready}
                        onClick={() =>
                          setEditor({
                            ...blankTask(view),
                            status: g.status || "Planned",
                            quarter: view !== "daily" ? g.title : null,
                          })
                        }
                      >
                        <Plus size={17} />
                      </button>
                    </div>
                    <div className="column-cards">
                      {filtered.filter(g.test).map(card)}
                      {!filtered.filter(g.test).length && (
                        <div className="column-empty">
                          <span>
                            {g.key === "done" ? (
                              <CheckCheck size={22} />
                            ) : g.key === "progress" ? (
                              <Target size={22} />
                            ) : (
                              <Circle size={22} />
                            )}
                          </span>
                          <strong>
                            {query || status !== "All" || priority !== "All"
                              ? "No matching tasks"
                              : g.key === "done"
                                ? "Good things take a little work"
                                : g.key === "progress"
                                  ? "Ready when you are"
                                  : "A fresh start"}
                          </strong>
                          <p>
                            {g.key === "done"
                              ? "Completed tasks will live here."
                              : "Give your next idea a place to start."}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="task-list">
                {filtered.map(card)}
                {!filtered.length && (
                  <div className="column-empty">
                    <Search size={24} />
                    <strong>No tasks to show</strong>
                    <p>Create a task or adjust your filters.</p>
                  </div>
                )}
              </div>
            )}
          </section>
          <footer className="page-footer">
            <span>• A little more clarity. A little more momentum.</span>
            <span>Made for meaningful work.</span>
          </footer>
        </main>
      </div>
      {editor && (
        <Editor
          task={editor}
          view={editor.id ? viewOf(editor) : view}
          onClose={() => setEditor(null)}
          onSave={save}
        />
      )}{" "}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  res.setHeader("Cache-Control", "no-store");
  const { getUser } = await import("@/lib/auth");
  try {
    const user = await getUser(req);
    if (user) return { props: { user } };
  } catch { /* An unavailable database must never expose protected content. */ }
  return { redirect: { destination: "/login", permanent: false } };
}
