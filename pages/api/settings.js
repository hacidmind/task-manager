import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { getUser, sameOrigin } from "@/lib/auth";
import { PREDEFINED_AVATARS, THEMES, statusesFor } from "@/lib/preferences";

const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && !sameOrigin(req)) return res.status(403).json({ error: "Invalid request origin" });
  let user;
  try { user = await getUser(req); } catch { return res.status(503).json({ error: "Unable to verify your session." }); }
  if (!user) return res.status(401).json({ error: "Please sign in to manage settings." });
  if (!process.env.MONGODB_URI) return res.status(503).json({ error: "Online MongoDB is not configured." });
  if (!["GET", "PUT"].includes(req.method)) {
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.method === "GET") {
    return res.status(200).json({ ...user, statuses: statusesFor(user) });
  }

  const name = clean(req.body?.name, 80);
  const workspaceName = clean(req.body?.workspaceName, 80);
  const theme = clean(req.body?.theme, 20);
  const avatar = req.body?.avatar;
  const statuses = req.body?.statuses;
  if (name.length < 2) return res.status(400).json({ error: "Name must contain at least 2 characters." });
  if (workspaceName.length < 2) return res.status(400).json({ error: "Workspace name must contain at least 2 characters." });
  if (!THEMES.some((item) => item.key === theme)) return res.status(400).json({ error: "Choose a valid theme." });
  const validUpload = typeof avatar === "string" && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(avatar) && avatar.length <= 1_500_000;
  if (avatar && !PREDEFINED_AVATARS.includes(avatar) && !validUpload) {
    return res.status(400).json({ error: "Choose an avatar or upload a PNG, JPEG, or WebP image under 1 MB." });
  }
  if (!Array.isArray(statuses) || statuses.length < 2 || statuses.length > 12) {
    return res.status(400).json({ error: "Keep between 2 and 12 statuses." });
  }
  const normalized = statuses.map((item) => ({
    key: clean(item?.key, 50),
    label: clean(item?.label, 30),
  }));
  if (normalized.some((item) => !/^[A-Za-z0-9 -]+$/.test(item.key) || !item.label)) {
    return res.status(400).json({ error: "Every status needs a valid name." });
  }
  if (new Set(normalized.map((item) => item.key)).size !== normalized.length || new Set(normalized.map((item) => item.label.toLowerCase())).size !== normalized.length) {
    return res.status(400).json({ error: "Status names must be unique." });
  }
  if (!normalized.some((item) => item.key === "Done") || !normalized.some((item) => item.key === "Ongoing")) {
    return res.status(400).json({ error: "Completed and In Progress are required for progress tracking." });
  }

  try {
    const db = await getDatabase();
    const userId = new ObjectId(user.id);
    const oldKeys = statusesFor(user).map((item) => item.key);
    const newKeys = normalized.map((item) => item.key);
    const removed = oldKeys.filter((key) => !newKeys.includes(key));
    const fallback = normalized.find((item) => item.key !== "Done")?.key || "Ongoing";
    if (removed.length) {
      await db.collection("tasks").updateMany(
        { userId: user.id, status: { $in: removed } },
        { $set: { status: fallback, updatedAt: new Date() } },
      );
    }
    await db.collection("users").updateOne(
      { _id: userId },
      { $set: { name, workspaceName, avatar: avatar || "", theme, statuses: normalized, updatedAt: new Date() } },
    );
    return res.status(200).json({ name, workspaceName, avatar: avatar || "", theme, statuses: normalized });
  } catch {
    return res.status(500).json({ error: "Could not save settings. Please try again." });
  }
}
