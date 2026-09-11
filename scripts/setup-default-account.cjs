// Trusted local administration; never exposed through the public API.
require('@next/env').loadEnvConfig(process.cwd());
const { MongoClient } = require('mongodb');
const { randomBytes, scrypt } = require('node:crypto');
const { promisify } = require('node:util');
const readline = require('node:readline');
const { Writable } = require('node:stream');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

async function hiddenPrompt(label) {
  process.stdout.write(label);
  const output = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
  const input = readline.createInterface({ input: process.stdin, output, terminal: true });
  input.on('SIGINT', () => { input.close(); process.stdout.write('\nCancelled.\n'); process.exit(1); });
  return new Promise(resolve => input.question('', value => { input.close(); process.stdout.write('\n'); resolve(value); }));
}

(async () => {
  if (!process.stdin.isTTY) throw new Error('Run npm run account:setup in an interactive terminal. Passwords are entered privately, not as command arguments.');
  if (!process.env.MONGODB_URI) throw new Error('Set your online MONGODB_URI in .env.local first.');
  const { DEFAULT_ACCOUNT_EMAIL, ensureDefaultAccount, linkLegacyTasks } = await import(pathToFileURL(path.resolve(__dirname, '../lib/default-account.mjs')));
  console.log(`Set or reset the password for ${DEFAULT_ACCOUNT_EMAIL}. Existing sessions will be signed out.`);
  const password = await hiddenPrompt('New password (12–128 characters, hidden): ');
  if (password.length < 12 || password.length > 128) throw new Error('Password must be between 12 and 128 characters.');
  if (password !== await hiddenPrompt('Confirm password (hidden): ')) throw new Error('Passwords did not match. Nothing was changed.');
  const salt = randomBytes(16).toString('hex');
  const key = await promisify(scrypt)(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 });
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'task_manager');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    const user = await ensureDefaultAccount(db);
    const passwordSetupAt = new Date();
    await db.collection('users').updateOne({ _id: user._id }, { $set: { passwordHash: `${salt}:${key.toString('hex')}`, passwordSetupAt } });
    await db.collection('sessions').deleteMany({ userId: user._id });
    const linked = await linkLegacyTasks(db, { ...user, passwordSetupAt });
    console.log(`Password saved. ${linked} unassigned tasks linked. Sign in with your email and new password.`);
  } finally { await client.close(); }
})().catch(error => {
  const message = /auth/i.test(error.message) && error.name.startsWith('Mongo') ? 'MongoDB authentication failed. Check the database credentials in .env.local.' : error.name.startsWith('Mongo') ? 'Unable to connect to MongoDB. Check your connection settings.' : error.message;
  console.error(message); process.exitCode = 1;
});
