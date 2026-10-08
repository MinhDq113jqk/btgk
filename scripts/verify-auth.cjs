require('reflect-metadata');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { JwtService } = require('@nestjs/jwt');
const { DataSource } = require('typeorm');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');

async function verify() {
  assert.equal(process.env.DB_DATABASE, 'btgk', 'Test requires the local btgk database');
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  const userIds = [];
  const fixture = {};
  let db;
  let baseline;
  const passed = [];
  function status(response, expected, label) {
    assert.equal(response.status, expected, label);
    passed.push(`${label}: ${expected}`);
  }
  async function counts() {
    return (await db.query('SELECT (SELECT COUNT(*)::int FROM users) AS users, (SELECT COUNT(*)::int FROM books) AS books, (SELECT COUNT(*)::int FROM readers) AS readers, (SELECT COUNT(*)::int FROM borrowed_records) AS borrows'))[0];
  }
  try {
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    db = app.get(DataSource);
    assert.equal((await db.query('SELECT current_database() AS name'))[0].name, 'btgk');
    baseline = await counts();
    const server = app.getHttpServer();
    const suffix = randomBytes(8).toString('hex');
    const password = randomBytes(24).toString('base64url');
    const email = `auth-test-${suffix}@example.test`;
    const adminEmail = `admin-test-${suffix}@example.test`;
    const register = await request(server).post('/auth/register').send({ fullName: 'Auth test', email, password });
    if (register.body.id) userIds.push(register.body.id);
    status(register, 201, 'Register USER');
    assert.equal(register.body.role, 'USER');
    assert.ok(!('passwordHash' in register.body) && !('password' in register.body));
    const stored = (await db.query('SELECT "passwordHash", role FROM users WHERE id = $1', [register.body.id]))[0];
    assert.ok(stored.passwordHash.startsWith('scrypt:') && !stored.passwordHash.includes(password));
    status(await request(server).post('/auth/register').send({ fullName: 'Duplicate', email: email.toUpperCase(), password }), 409, 'Duplicate normalized email');
    status(await request(server).post('/auth/register').send({ fullName: 'Escalation', email: `extra-${email}`, password, role: 'ADMIN' }), 400, 'Reject client role');
    status(await request(server).post('/auth/login').send({ email, password: 'WrongPassword' }), 401, 'Wrong password');
    const login = await request(server).post('/auth/login').send({ email, password });
    status(login, 200, 'Login');
    const token = login.body.access_token;
    assert.equal(typeof token, 'string');
    assert.ok(!('passwordHash' in login.body.user));
    status(await request(server).get('/auth/profile'), 401, 'Missing token');
    status(await request(server).get('/auth/profile').set('Authorization', 'Bearer invalid'), 401, 'Invalid token');
    const jwt = app.get(JwtService);
    const expired = await jwt.signAsync({ sub: register.body.id }, { expiresIn: -1 });
    status(await request(server).get('/auth/profile').set('Authorization', `Bearer ${expired}`), 401, 'Expired token');
    const altered = token.slice(0, -3) + (token.slice(-3) === 'AAA' ? 'BBB' : 'AAA');
    status(await request(server).get('/auth/profile').set('Authorization', `Bearer ${altered}`), 401, 'Tampered signature');
    const profile = await request(server).get('/auth/profile').set('Authorization', `Bearer ${token}`);
    status(profile, 200, 'Authenticated profile');
    assert.equal(profile.body.id, register.body.id);
    status(await request(server).get('/books').set('Authorization', `Bearer ${token}`), 200, 'USER reads books');
    status(await request(server).post('/books').set('Authorization', `Bearer ${token}`).send({ title: 'Forbidden', author: 'Demo' }), 403, 'USER cannot create books');
    status(await request(server).get('/readers').set('Authorization', `Bearer ${token}`), 403, 'USER cannot list readers');
    status(await request(server).get('/borrowed-records').set('Authorization', `Bearer ${token}`), 403, 'USER cannot list borrows');
    status(await request(server).post('/borrowed-records').set('Authorization', `Bearer ${token}`).send({}), 403, 'USER cannot create borrows');
    const forgedRole = await jwt.signAsync({ sub: register.body.id, role: 'ADMIN' });
    status(await request(server).get('/readers').set('Authorization', `Bearer ${forgedRole}`), 403, 'Role read from database');
    const admin = await request(server).post('/auth/register').send({ fullName: 'Admin test', email: adminEmail, password });
    if (admin.body.id) userIds.push(admin.body.id);
    status(admin, 201, 'Register test admin account as USER');
    await db.query('UPDATE users SET role = $1 WHERE id = $2', ['ADMIN', admin.body.id]);
    const adminLogin = await request(server).post('/auth/login').send({ email: adminEmail, password });
    status(adminLogin, 200, 'ADMIN login');
    const adminToken = adminLogin.body.access_token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const book = await request(server).post('/books').set(adminHeaders).send({ title: `Auth test ${suffix}`, author: 'Demo' });
    fixture.bookId = book.body.id;
    status(book, 201, 'ADMIN creates book');
    const reader = await request(server).post('/readers').set(adminHeaders).send({ fullName: 'Auth test reader', email: `reader-${suffix}@example.test` });
    fixture.readerId = reader.body.id;
    status(reader, 201, 'ADMIN creates reader');
    const borrow = await request(server).post('/borrowed-records').set(adminHeaders).send({ bookId: fixture.bookId, readerId: fixture.readerId, borrowedDate: '2026-10-08', dueDate: '2026-10-22' });
    fixture.borrowId = borrow.body.id;
    status(borrow, 201, 'ADMIN creates borrow');
    const list = await request(server).get('/borrowed-records').set(adminHeaders);
    status(list, 200, 'ADMIN lists borrows');
    const saved = list.body.find(record => record.id === fixture.borrowId);
    assert.ok(saved && saved.book.id === fixture.bookId && saved.reader.id === fixture.readerId);
    assert.equal(saved.borrowedDate, '08/10/2026');
    await db.query('UPDATE users SET role = $1 WHERE id = $2', ['USER', admin.body.id]);
    status(await request(server).get('/readers').set(adminHeaders), 403, 'Demotion applies to existing token');
    await db.query('DELETE FROM users WHERE id = $1', [register.body.id]);
    status(await request(server).get('/auth/profile').set('Authorization', `Bearer ${token}`), 401, 'Deleted account token rejected');
  } finally {
    if (db) {
      if (fixture.borrowId) await db.query('DELETE FROM borrowed_records WHERE id = $1', [fixture.borrowId]);
      if (fixture.readerId) await db.query('DELETE FROM readers WHERE id = $1', [fixture.readerId]);
      if (fixture.bookId) await db.query('DELETE FROM books WHERE id = $1', [fixture.bookId]);
      if (userIds.length) await db.query('DELETE FROM users WHERE id = ANY($1::int[])', [userIds]);
      if (baseline) assert.deepEqual(await counts(), baseline, 'Test rows must be cleaned up');
    }
    await app.close();
  }
  console.log(JSON.stringify({ result: 'PASS', database: 'btgk', checks: passed, passwordStorage: 'salted scrypt hash', credentialsDisplayed: false, fixturesRemoved: true }, null, 2));
}

verify().catch(error => {
  console.error('Authentication verification failed:', error.code || error.name);
  process.exitCode = 1;
});
