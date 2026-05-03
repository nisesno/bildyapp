import request from 'supertest';
import { startDb, stopDb, clearDb } from './setup.js';

let app;

beforeAll(async () => {
  await startDb();
  ({ default: app } = await import('../src/app.js'));
});

afterAll(async () => {
  await stopDb();
});

beforeEach(async () => {
  await clearDb();
});

const baseUser = {
  email: 'auth@bildy.test',
  password: 'Password123',
};

describe('POST /api/user/register', () => {
  it('crea un usuario y devuelve tokens', async () => {
    const res = await request(app).post('/api/user/register').send(baseUser);
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe(baseUser.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('rechaza email duplicado', async () => {
    await request(app).post('/api/user/register').send(baseUser);
    const res = await request(app).post('/api/user/register').send(baseUser);
    expect(res.status).toBe(409);
  });

  it('rechaza datos invalidos', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'no-email', password: 'corta' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/user/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/user/register').send(baseUser);
  });

  it('hace login con credenciales correctas', async () => {
    const res = await request(app).post('/api/user/login').send(baseUser);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('rechaza password incorrecta', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email: baseUser.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/user', () => {
  it('rechaza sin token', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(401);
  });

  it('devuelve el usuario autenticado', async () => {
    const reg = await request(app).post('/api/user/register').send(baseUser);
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${reg.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(baseUser.email);
  });
});
