import { randomInt, randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "./auth";
import { sendLoginCode } from "./email";

export const OTP_LIFETIME_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export async function issueCode(db, email) {
  const challenges = db.collection("emailCodes");
  const now = new Date();
  const challengeId = randomBytes(32).toString("hex");
  const code = randomInt(0, 1000000).toString().padStart(6, "0");
  const codeHash = await hashPassword(code);
  // Unique email _id makes simultaneous sends obey the same cooldown.
  try {
    await challenges.updateOne(
      { _id: email, sentAt: { $lte: new Date(Date.now() - 60000) } },
      { $set: { challengeId, codeHash, attempts: 0, sentAt: now, expiresAt: new Date(Date.now() + OTP_LIFETIME_MS) } },
      { upsert: true },
    );
  } catch (error) {
    if (error.code === 11000) { const cooldown = new Error("Please wait one minute before requesting another code."); cooldown.status = 429; throw cooldown; }
    throw error;
  }
  try { await sendLoginCode(email, code); }
  catch { await challenges.deleteOne({ _id: email, challengeId }); const error = new Error("Unable to send your code. Please check the email service configuration and try again."); error.status = 502; throw error; }
  return challengeId;
}

export async function consumeCode(db, email, challengeId, code) {
  if (typeof challengeId !== "string" || typeof code !== "string" || !/^[a-f0-9]{64}$/.test(challengeId) || !/^\d{6}$/.test(code)) return false;
  const challenges = db.collection("emailCodes");
  const challenge = await challenges.findOneAndUpdate(
    { _id: email, challengeId, expiresAt: { $gt: new Date() }, attempts: { $lt: OTP_MAX_ATTEMPTS } },
    { $inc: { attempts: 1 } },
    { returnDocument: "after" },
  );
  if (!challenge || !await verifyPassword(code, challenge.codeHash)) return false;
  // Atomic deletion means only one request can consume a code and get a session.
  const result = await challenges.deleteOne({ _id: email, challengeId, expiresAt: { $gt: new Date() } });
  return result.deletedCount === 1;
}
