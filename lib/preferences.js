export const DEFAULT_STATUSES = [
  { key: "Not Started", label: "Not Started" },
  { key: "Planned", label: "Planned" },
  { key: "Ongoing", label: "In Progress" },
  { key: "Waiting", label: "Waiting" },
  { key: "Blocked", label: "Blocked" },
  { key: "Done", label: "Completed" },
];

export const THEMES = [
  { key: "light", label: "Lavender Light", color: "#8770de" },
  { key: "dark", label: "Midnight", color: "#1f1a29" },
  { key: "ocean", label: "Ocean", color: "#167b91" },
  { key: "forest", label: "Forest", color: "#477c58" },
  { key: "sunset", label: "Sunset", color: "#c96d57" },
];

export const PREDEFINED_AVATARS = ["🧑🏾‍💻", "🚀", "🎯", "✨", "🦁", "🌻", "🧠", "⚡"];

export function statusesFor(user) {
  return Array.isArray(user?.statuses) && user.statuses.length ? user.statuses : DEFAULT_STATUSES;
}
