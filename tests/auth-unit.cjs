const fs = require('node:fs');
const assert = require('node:assert/strict');

// Load the server helper with the database boundary stubbed. No account data is used.
const source = fs.readFileSync('lib/auth.js', 'utf8').replace('import { DEFAULT_ACCOUNT_EMAIL } from "./default-account.mjs";', 'const DEFAULT_ACCOUNT_EMAIL = "abiolahafeez@gmail.com";').replace(
  'import { getDatabase } from "./mongodb";',
  'const getDatabase = () => { if (globalThis.__authTestDb) return globalThis.__authTestDb; throw new Error("Unexpected database access"); };',
);
(async () => {
  const auth = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const first = await auth.hashPassword('a-long-test-passphrase');
  const second = await auth.hashPassword('a-long-test-passphrase');
  assert.notEqual(first, second, 'Each password must have a random salt');
  assert.equal(await auth.verifyPassword('a-long-test-passphrase', first), true);
  assert.equal(await auth.verifyPassword('wrong-password', first), false);
  assert.equal(auth.sameOrigin({ headers: { origin: 'https://evil.example', host: 'localhost:3001' } }), false);
  assert.equal(auth.sameOrigin({ headers: { origin: 'http://localhost:3001', host: 'localhost:3001' } }), true);
  assert.equal(auth.sameOrigin({ headers: { 'sec-fetch-site': 'cross-site' } }), false);
  assert.equal(auth.sessionToken({ cookies: { 'momentum-session': 'invalid' } }), null);
  assert.equal(await auth.getUser({ cookies: {} }), null);
  const setup = new Date();
  const owner = { _id: 'owner-id', name: 'Owner', email: 'abiolahafeez@gmail.com', passwordSetupAt: setup };
  const session = { userId: 'owner-id', passwordVersion: setup.toISOString() };
  globalThis.__authTestDb = { collection: name => ({ findOne: async () => name === 'sessions' ? session : owner }) };
  const request = { cookies: { 'momentum-session': 'a'.repeat(64) } };
  assert.equal((await auth.getUser(request)).email, owner.email);
  session.passwordVersion = new Date(0).toISOString();
  assert.equal(await auth.getUser(request), null, 'Password reset invalidates older sessions');
  delete owner.passwordSetupAt;
  assert.equal(await auth.getUser(request), null, 'Default account requires trusted password setup');
  delete globalThis.__authTestDb;
  console.log('PASS: random password salts, password verification, origin checks, malformed sessions, unauthenticated access.');
})().catch(error => { console.error(error); process.exitCode = 1; });
