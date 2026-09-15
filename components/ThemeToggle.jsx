import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { THEMES } from "@/lib/preferences";
import { applyTheme, savedTheme } from "@/lib/theme-client";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const initial = savedTheme() || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(applyTheme(initial));
    const update = (event) => setTheme(event.detail);
    window.addEventListener("momentum-theme", update);
    return () => window.removeEventListener("momentum-theme", update);
  }, []);

  function toggle() {
    const index = THEMES.findIndex((item) => item.key === theme);
    setTheme(applyTheme(THEMES[(index + 1) % THEMES.length].key));
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Current theme: ${THEMES.find((item) => item.key === theme)?.label}. Switch theme`} title="Switch theme">
      <Palette size={18} />
    </button>
  );
}
