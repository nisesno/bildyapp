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

const register = (extra = {}) =>
  request(app)
    .post('/api/user/register')
    .send({ email: 'flow@bildy.test', password: 'Password123', ...extra });

describe('flujo completo del usuario', () => {
  it('valida el email con el codigo', async () => {
    const reg = await register();
    const token = reg.body.accessToken;

    // saco el codigo del usuario en bd, en una app real iria por mail
    const mongoose = (await import('mongoose')).default;
    const user = await mongoose.connection.db
      .collection('users')
      .findOne({ email: 'flow@bildy.test' });

    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: user.verificationCode });
    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('verified');
  });

  it('hace onboarding y crea empresa', async () => {
    const reg = await register();
    const token = reg.body.accessToken;

    const onb = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Pepe', lastName: 'Garcia', nif: '12345678Z' });
    expect(onb.status).toBe(200);
    expect(onb.body.name).toBe('Pepe');

    const comp = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'business',
        name: 'Bildy SL',
        cif: 'B12345678',
      });
    expect(comp.status).toBe(200);
    expect(comp.body.company).toBeDefined();
  });

  it('refresca el token y luego cierra sesion', async () => {
    const reg = await register();

    const ref = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken: reg.body.refreshToken });
    expect(ref.status).toBe(200);
    expect(ref.body.accessToken).toBeDefined();

    const logout = await request(app)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${ref.body.accessToken}`);
    expect(logout.status).toBe(200);
  });

  it('cambia la contraseña', async () => {
    const reg = await register();

    const res = await request(app)
      .patch('/api/user/password')
      .set('Authorization', `Bearer ${reg.body.accessToken}`)
      .send({
        currentPassword: 'Password123',
        newPassword: 'NuevaPass456',
        confirmPassword: 'NuevaPass456',
      });
    expect(res.status).toBe(200);
  });

  it('borra cuenta soft', async () => {
    const reg = await register();
    const res = await request(app)
      .delete('/api/user?soft=true')
      .set('Authorization', `Bearer ${reg.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.soft).toBe(true);
  });
});
