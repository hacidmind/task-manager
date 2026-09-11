const assert = require('node:assert/strict');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

// Fake only the database and delivery boundaries. Password hashing is tested separately.
const source = fs.readFileSync('lib/otp.js', 'utf8')
  .replace('import { hashPassword, verifyPassword } from "./auth";', 'const hashPassword = async code => `hash:${code}`; const verifyPassword = async (code, hash) => hash === `hash:${code}`;')
  .replace('import { sendLoginCode } from "./email";', 'const sendLoginCode = (...args) => globalThis.__otpTestDelivery(...args);');
let row;
let deliveredCode;
let failDelivery = false;
globalThis.__otpTestDelivery = async (_email, code) => { if (failDelivery) throw new Error('Delivery unavailable'); deliveredCode = code; };
function matches(filter) {
  return row && row._id === filter._id && (!filter.challengeId || row.challengeId === filter.challengeId)
    && (!filter.expiresAt || row.expiresAt > filter.expiresAt.$gt)
    && (!filter.attempts || row.attempts < filter.attempts.$lt);
}
const collection = {
  async updateOne(filter, update) {
    if (row && !(row.sentAt <= filter.sentAt.$lte)) { const e = new Error('Duplicate'); e.code = 11000; throw e; }
    row = { _id: filter._id, ...update.$set };
  },
  async findOneAndUpdate(filter, update) {
    if (!matches(filter)) return null;
    row.attempts += update.$inc.attempts;
    return { ...row };
  },
  async deleteOne(filter) {
    if (!matches(filter)) return { deletedCount: 0 };
    row = undefined; return { deletedCount: 1 };
  },
};
const db = { collection: () => collection };
const email = 'test@example.invalid';

(async () => {
  const otp = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  let id = await otp.issueCode(db, email);
  assert.match(deliveredCode, /^\d{6}$/);
  assert.notEqual(row.codeHash, deliveredCode);
  await assert.rejects(() => otp.issueCode(db, email), e => e.status === 429);
  assert.equal(await otp.consumeCode(db, email, id, 'abcdef'), false);
  assert.equal(await otp.consumeCode(db, email, id, 123456), false);
  const attempts = await Promise.all([otp.consumeCode(db, email, id, deliveredCode), otp.consumeCode(db, email, id, deliveredCode)]);
  assert.equal(attempts.filter(Boolean).length, 1, 'Only one concurrent verification can consume a code');
  assert.equal(await otp.consumeCode(db, email, id, deliveredCode), false);
  id = await otp.issueCode(db, email);
  row.expiresAt = new Date(0);
  assert.equal(await otp.consumeCode(db, email, id, deliveredCode), false);
  row = undefined; id = await otp.issueCode(db, email);
  const incorrect = deliveredCode === '111111' ? '222222' : '111111';
  for (let i = 0; i < 5; i++) assert.equal(await otp.consumeCode(db, email, id, incorrect), false);
  assert.equal(await otp.consumeCode(db, email, id, deliveredCode), false, 'Five failed attempts lock a code');
  row.sentAt = new Date(0);
  const previousId = id;
  id = await otp.issueCode(db, email);
  assert.equal(await otp.consumeCode(db, email, previousId, deliveredCode), false, 'Resending invalidates the previous challenge');
  assert.equal(await otp.consumeCode(db, email, id, deliveredCode), true);
  failDelivery = true;
  await assert.rejects(() => otp.issueCode(db, email), e => e.status === 502);
  assert.equal(row, undefined, 'Failed delivery leaves no usable code');

  const { DEFAULT_ACCOUNT_EMAIL, linkLegacyTasks } = await import(pathToFileURL(path.resolve('lib/default-account.mjs')));
  const tasks = [{}, { userId: null }, { userId: '' }, { userId: 'someone-else' }];
  const taskDb = { collection: () => ({ updateMany: async (filter, update) => {
    assert.deepEqual(filter, { $or: [{ userId: null }, { userId: '' }] });
    let modifiedCount = 0;
    for (const task of tasks) if (task.userId == null || task.userId === '') { task.userId = update.$set.userId; modifiedCount++; }
    return { modifiedCount };
  } }) };
  assert.equal(await linkLegacyTasks(taskDb, { email: 'other@example.invalid', passwordSetupAt: new Date() }), 0);
  assert.equal(await linkLegacyTasks(taskDb, { email: DEFAULT_ACCOUNT_EMAIL }), 0);
  const owner = { _id: 'owner-id', email: DEFAULT_ACCOUNT_EMAIL, passwordSetupAt: new Date() };
  assert.equal(await linkLegacyTasks(taskDb, owner), 3);
  assert.equal(await linkLegacyTasks(taskDb, owner), 0, 'Ownership migration is idempotent');
  assert.equal(tasks[3].userId, 'someone-else');
  console.log('PASS: OTP expiry, attempt limits, cooldown, resend, single-use concurrency, malformed input, delivery failure, and verified default-account task ownership.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { delete globalThis.__otpTestDelivery; });
