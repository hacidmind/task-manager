import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDatabase } from "./mongodb";
import { DEFAULT_ACCOUNT_EMAIL } from "./default-account.mjs";

const derive = promisify(scrypt);
const COOKIE = "momentum-session";
const AGE = 60 * 60 * 24 * 7;
const digest = (value) => createHash("sha256").update(value).digest("hex");

export async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const key = await derive(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 });
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password, encoded) {
  const [salt, expected] = encoded.split(":");
  const actual = (await hashPassword(password, salt)).split(":")[1];
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sessionToken(req) {
  const token = req.cookies?.[COOKIE];
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function cookie(res, value, age) {
  res.setHeader("Set-Cookie", `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
}

export function sameOrigin(req) {
  if (req.headers["sec-fetch-site"] === "cross-site") return false;
  if (!req.headers.origin) return true;
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}

export async function authDatabase() {
  const db = await getDatabase();
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("authAttempts").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("tasks").createIndex({ userId: 1 }),
  ]);
  return db;
}

export async function getUser(req) {
  const token = sessionToken(req);
  if (!token) return null;
  const db = await getDatabase();
  const session = await db.collection("sessions").findOne({ _id: digest(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await db.collection("users").findOne({ _id: session.userId }, { projection: { name: 1, email: 1, passwordSetupAt: 1 } });
  if (user?.email === DEFAULT_ACCOUNT_EMAIL && !user.passwordSetupAt) return null;
  if (user?.email === DEFAULT_ACCOUNT_EMAIL && session.passwordVersion !== user.passwordSetupAt.toISOString()) return null;
  return user ? { id: user._id.toString(), name: user.name, email: user.email } : null;
}

export async function createSession(req, res, db, userId, passwordSetupAt = null) {
  const old = sessionToken(req);
  if (old) await db.collection("sessions").deleteOne({ _id: digest(old) });
  const token = randomBytes(32).toString("hex");
  await db.collection("sessions").insertOne({ _id: digest(token), userId, passwordVersion: passwordSetupAt?.toISOString() || null, expiresAt: new Date(Date.now() + AGE * 1000) });
  cookie(res, token, AGE);
}

export async function logout(req, res) {
  const token = sessionToken(req);
  if (token) {
    const db = await getDatabase();
    await db.collection("sessions").deleteOne({ _id: digest(token) });
  }
  cookie(res, "", 0);
}

export async function rateLimit(db, req, email) {
  // Fixed windows in MongoDB also apply across server instances.
  const window = Math.floor(Date.now() / 900000);
  const ip = req.socket.remoteAddress || "unknown";
  for (const value of [`ip:${ip}`, `email:${email}`]) {
    const result = await db.collection("authAttempts").findOneAndUpdate(
      { _id: digest(`${window}:${value}`) },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * 900000) } },
      { upsert: true, returnDocument: "after" },
    );
    if (result.count > (value.startsWith("ip:") ? 100 : 15)) return false;
  }
  return true;
}
