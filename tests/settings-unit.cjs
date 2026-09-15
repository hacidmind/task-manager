const fs = require('node:fs');
const assert = require('node:assert/strict');

const defaults = [
  { key: 'Not Started', label: 'Not Started' }, { key: 'Planned', label: 'Planned' },
  { key: 'Ongoing', label: 'In Progress' }, { key: 'Waiting', label: 'Waiting' },
  { key: 'Blocked', label: 'Blocked' }, { key: 'Done', label: 'Completed' },
];
let taskUpdate;
let userUpdate;
const source = fs.readFileSync('pages/api/settings.js', 'utf8')
  .replace('import { ObjectId } from "mongodb";', 'const ObjectId = class ObjectId { constructor(value) { this.value = value; } };')
  .replace('import { getDatabase } from "@/lib/mongodb";', 'const getDatabase = async () => globalThis.settingsDb;')
  .replace('import { getUser, sameOrigin } from "@/lib/auth";', 'const getUser = async () => globalThis.settingsUser; const sameOrigin = () => true;')
  .replace('import { PREDEFINED_AVATARS, THEMES, statusesFor } from "@/lib/preferences";', 'const DEFAULT_STATUSES = globalThis.defaults; const PREDEFINED_AVATARS = ["🚀"]; const THEMES = [{ key: "light" }, { key: "ocean" }]; const statusesFor = user => user.statuses || DEFAULT_STATUSES;');

globalThis.defaults = defaults;
globalThis.settingsUser = { id: '0123456789abcdef01234567', name: 'Old Name', statuses: defaults };
globalThis.settingsDb = { collection: (name) => ({
  updateMany: async (filter, change) => { taskUpdate = { filter, change }; return { modifiedCount: 2 }; },
  updateOne: async (filter, change) => { if (name === 'users') userUpdate = { filter, change }; return { matchedCount: 1 }; },
}) };
process.env.MONGODB_URI = 'test-only';

(async () => {
  const { default: handler } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  async function request(body) {
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
    await handler({ method: 'PUT', body }, res);
    return res;
  }
  const statuses = defaults.filter(item => item.key !== 'Waiting').map(item => item.key === 'Done' ? { ...item, label: 'Finished' } : item);
  const valid = await request({ name: 'New Name', workspaceName: 'Delivery', avatar: '🚀', theme: 'ocean', statuses });
  assert.equal(valid.code, 200);
  assert.deepEqual(taskUpdate.filter, { userId: globalThis.settingsUser.id, status: { $in: ['Waiting'] } });
  assert.equal(taskUpdate.change.$set.status, 'Not Started');
  assert.equal(userUpdate.change.$set.name, 'New Name');
  assert.equal(userUpdate.change.$set.statuses.find(item => item.key === 'Done').label, 'Finished');
  assert.equal((await request({ name: 'A', workspaceName: 'Delivery', avatar: '', theme: 'light', statuses })).code, 400);
  assert.equal((await request({ name: 'Valid', workspaceName: 'Delivery', avatar: '', theme: 'invalid', statuses })).code, 400);
  assert.equal((await request({ name: 'Valid', workspaceName: 'Delivery', avatar: '', theme: 'light', statuses: statuses.filter(item => item.key !== 'Done') })).code, 400);
  assert.equal((await request({ name: 'Valid', workspaceName: 'Delivery', avatar: 'data:text/html;base64,QQ==', theme: 'light', statuses })).code, 400);
  console.log('PASS: settings validation, status rename/delete migration, avatar and theme preferences');
})().catch(error => { console.error(error); process.exitCode = 1; });
