import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "task_manager";

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, db: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) throw new Error("MongoDB is not configured");
  if (cached.conn) {
    return cached.conn;
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  cached.conn = client;
  cached.db = client.db(MONGODB_DB);

  return cached.conn;
}

export async function getDatabase() {
  const client = await connectToDatabase();
  return client.db(MONGODB_DB);
}
