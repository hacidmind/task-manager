const fs = require('node:fs');
const assert = require('node:assert/strict');
let update;
const source = fs.readFileSync('pages/api/tasks.js', 'utf8')
  .replace('import { connectToDatabase, getDatabase } from "@/lib/mongodb";', 'const connectToDatabase = async () => {}; const getDatabase = async () => globalThis.focusDb;')
  .replace('import { ObjectId } from "mongodb";', 'const ObjectId = globalThis.focusObjectId;')
  .replace('import { getUser, sameOrigin } from "@/lib/auth";', 'const getUser = async () => globalThis.focusUser; const sameOrigin = () => true;');
globalThis.focusObjectId = class ObjectId { constructor(value) { this.value = value; } static isValid(value) { return /^[a-f0-9]{24}$/i.test(value); } };
globalThis.focusUser = { id: 'account-a' };
globalThis.focusDb = { collection: () => ({ updateOne: async (filter, change) => { update = { filter, change }; return { matchedCount: 1 }; } }) };
process.env.MONGODB_URI = 'test-only';
(async () => {
  const { default: handler } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  async function request(body) {
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await handler({ method: 'PATCH', body }, res);
    return res;
  }
  const id = '0123456789abcdef01234567';
  assert.equal((await request({ id, focusDate: '2026-09-15' })).code, 200);
  assert.equal(update.filter.userId, 'account-a');
  assert.equal(update.change.$set.focusDate, '2026-09-15');
  assert.deepEqual(Object.keys(update.change.$set).sort(), ['focusDate', 'updatedAt']);
  assert.equal((await request({ id, focusDate: null })).code, 200);
  assert.equal(update.change.$set.focusDate, null);
  for (const focusDate of ['2026-02-30', 'bad', {}, undefined]) assert.equal((await request({ id, focusDate })).code, 400);
  assert.equal((await request({ id: 'invalid', focusDate: null })).code, 400);
  globalThis.focusUser = null;
  assert.equal((await request({ id, focusDate: null })).code, 401);
  console.log('PASS: focus selection, removal, ownership scoping, isolated updates, invalid dates and authentication');
})().catch((error) => { console.error(error); process.exitCode = 1; });
