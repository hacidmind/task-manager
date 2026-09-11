import { authDatabase, createSession, getUser, hashPassword, logout, rateLimit, sameOrigin, verifyPassword } from "@/lib/auth";
import { DEFAULT_ACCOUNT_EMAIL, linkLegacyTasks } from "@/lib/default-account.mjs";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const { action } = req.query;
  if (["send-code", "verify-code"].includes(action)) return res.status(403).json({ error: "Email OTP is disabled. Sign in with your email and password." });
  if (!["login", "register", "logout", "me"].includes(action)) return res.status(404).json({ error: "Not found" });
  if (req.method !== (action === "me" ? "GET" : "POST")) {
    res.setHeader("Allow", action === "me" ? "GET" : "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (req.method === "POST" && (!sameOrigin(req) || !req.headers["content-type"]?.startsWith("application/json"))) return res.status(403).json({ error: "Invalid request origin or content type" });
  try {
    if (action === "me") return res.status(200).json({ user: await getUser(req) });
    if (action === "logout") { await logout(req, res); return res.status(200).json({ ok: true }); }
    if (!process.env.MONGODB_URI) return res.status(503).json({ error: "Online MongoDB is not configured. Set MONGODB_URI in .env.local and restart the app." });
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: "Enter a valid email address." });
    if (action === "register" && email === DEFAULT_ACCOUNT_EMAIL) return res.status(403).json({ error: "The default account is managed locally. Set its password with npm run account:setup on the server." });
    const password = req.body?.password;
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== "string" || password.length > 128 || !password.length) return res.status(400).json({ error: "Enter a valid email and password." });
    if (action === "register" && (password.length < 12 || !name || name.length > 80)) return res.status(400).json({ error: "Enter your name and a password of 12–128 characters." });
    const db = await authDatabase();
    if (!await rateLimit(db, req, email)) { res.setHeader("Retry-After", "900"); return res.status(429).json({ error: "Too many attempts. Please try again in 15 minutes." }); }
    let user = await db.collection("users").findOne({ email });
    if (action === "register") {
      if (user) return res.status(409).json({ error: "Unable to create this account. Try signing in instead." });
      const result = await db.collection("users").insertOne({ email, name, passwordHash: await hashPassword(password), createdAt: new Date() });
      user = { _id: result.insertedId };
    } else {
      // Derive a key for unknown users too, to avoid a fast account-existence check.
      const encoded = user?.passwordHash || `${"0".repeat(32)}:${"0".repeat(128)}`;
      const valid = await verifyPassword(password, encoded);
      if (!user || !valid || (email === DEFAULT_ACCOUNT_EMAIL && !user.passwordSetupAt)) return res.status(401).json({ error: "Email or password is incorrect." });
    }
    await linkLegacyTasks(db, user);
    await createSession(req, res, db, user._id, user.passwordSetupAt);
    return res.status(action === "register" ? 201 : 200).json({ ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Unable to create this account. Try signing in instead." });
    console.error("Authentication failed:", error.name);
    return res.status(503).json({ error: "Unable to connect to your online workspace. Please try again shortly." });
  }
}
