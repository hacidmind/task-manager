import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const saved = document.cookie.match(/(?:^|; )momentum-theme=(dark|light)(?:;|$)/)?.[1];
    const apply = (value) => {
      setDark(value);
      document.documentElement.dataset.theme = value ? "dark" : "light";
    };
    apply(saved ? saved === "dark" : media.matches);
    const update = (event) => {
      if (!document.cookie.match(/(?:^|; )momentum-theme=/)) apply(event.matches);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    document.cookie = `momentum-theme=${next ? "dark" : "light"}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Switch to light mode" : "Switch to dark mode"}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
