export const DEFAULT_ACCOUNT_EMAIL = "abiolahafeez@gmail.com";

export async function ensureDefaultAccount(db) {
  return db.collection("users").findOneAndUpdate(
    { email: DEFAULT_ACCOUNT_EMAIL },
    { $setOnInsert: { email: DEFAULT_ACCOUNT_EMAIL, name: "Hafeez Abiola", createdAt: new Date() } },
    { upsert: true, returnDocument: "after" },
  );
}

export async function linkLegacyTasks(db, user) {
  if (user.email !== DEFAULT_ACCOUNT_EMAIL || !user.passwordSetupAt) return 0;
  const result = await db.collection("tasks").updateMany(
    { $or: [{ userId: null }, { userId: "" }] },
    { $set: { userId: user._id.toString() } },
  );
  return result.modifiedCount;
}
