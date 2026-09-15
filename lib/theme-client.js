import { THEMES } from "./preferences";

export function applyTheme(theme) {
  const safeTheme = THEMES.some((item) => item.key === theme) ? theme : "light";
  document.documentElement.dataset.theme = safeTheme;
  document.cookie = `momentum-theme=${safeTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("momentum-theme", { detail: safeTheme }));
  return safeTheme;
}

export function savedTheme() {
  return document.cookie.match(/(?:^|; )momentum-theme=(light|dark|ocean|forest|sunset)(?:;|$)/)?.[1];
}
