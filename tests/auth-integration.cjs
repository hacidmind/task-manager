// Run against the dev server: node tests/auth-integration.cjs
// Creates two temporary accounts and removes their users, tasks, and sessions.
require('@next/env').loadEnvConfig(process.cwd());
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { MongoClient } = require('mongodb');
const base = process.env.TEST_BASE_URL || 'http://localhost:3001';
const suffix = randomBytes(8).toString('hex');
const emails = [`qa-${suffix}-a@example.invalid`, `qa-${suffix}-b@example.invalid`];
const password = randomBytes(24).toString('hex');
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
let cookie = '';
async function request(path, method = 'GET', body, customCookie = cookie) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Origin: base, Cookie: customCookie }, body: body ? JSON.stringify(body) : undefined, redirect: 'manual' });
  const data = await response.json();
  return { status: response.status, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
async function run() {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'task_manager');
  try {
    assert.equal((await request('/api/tasks')).status, 401);
    const a = await request('/api/auth/register', 'POST', { name: 'Temporary QA A', email: emails[0], password });
    assert.equal(a.status, 201, JSON.stringify(a.data)); cookie = a.cookie; assert.ok(cookie);
    const user = (await request('/api/auth/me')).data.user; assert.equal(user.email, emails[0]);
    const task = await request('/api/tasks', 'POST', { title: 'Temporary isolated test task', category: 'Engineering', status: 'Ongoing', priority: 'High', owner: 'QA', notes: '', subtasks: [] });
    assert.equal(task.status, 201); const id = task.data.id;
    const cookieA = cookie;
    const b = await request('/api/auth/register', 'POST', { name: 'Temporary QA B', email: emails[1], password }, '');
    assert.equal(b.status, 201); cookie = b.cookie;
    assert.equal((await request('/api/tasks')).data.dailyTasks.length, 0);
    assert.equal((await request('/api/tasks', 'PUT', { id, title: 'Cannot edit another account' })).status, 404);
    assert.equal((await request('/api/tasks', 'DELETE', { id })).status, 404);
    cookie = cookieA;
    assert.equal((await request('/api/tasks', 'PUT', { id, title: 'Completed test task', status: 'Done', category: 'Engineering', priority: 'High', owner: 'QA', notes: '', subtasks: [{ id: 'test-step', text: 'Verify isolation', done: true }] })).status, 200);
    const saved = (await request('/api/tasks')).data.dailyTasks.find(t => t._id === id);
    assert.equal(saved.status, 'Done'); assert.equal(saved.subtasks[0].done, true);
    assert.equal((await request('/api/tasks', 'DELETE', { id })).status, 200);
    assert.equal((await request('/api/auth/logout', 'POST', {})).status, 200);
    assert.equal((await request('/api/tasks')).status, 401);
    assert.equal((await request('/api/auth/login', 'POST', { email: emails[0], password: 'incorrect-password' }, '')).status, 401);
    const login = await request('/api/auth/login', 'POST', { email: emails[0], password }, '');
    assert.equal(login.status, 200); cookie = login.cookie;
    const stored = await db.collection('users').findOne({ email: emails[0] });
    assert.notEqual(stored.passwordHash, password);
    await db.collection('sessions').updateMany({ userId: stored._id }, { $set: { expiresAt: new Date(0) } });
    assert.equal((await request('/api/tasks')).status, 401);
    const csrf = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' }, body: JSON.stringify({ email: emails[0], password }) });
    assert.equal(csrf.status, 403);
    console.log('PASS: registration, login, wrong password, sessions, expiration, logout, task CRUD, account isolation, and cross-origin rejection.');
  } finally {
    const users = await db.collection('users').find({ email: { $in: emails } }).toArray();
    const ids = users.map(u => u._id);
    await db.collection('tasks').deleteMany({ userId: { $in: ids.map(String) } });
    await db.collection('sessions').deleteMany({ userId: { $in: ids } });
    await db.collection('users').deleteMany({ _id: { $in: ids } });
    await client.close();
  }
}
run().catch(async error => { console.error('FAIL:', error.message); await client.close(); process.exitCode = 1; });
