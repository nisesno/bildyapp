import request from 'supertest';
import { startDb, stopDb, clearDb } from './setup.js';
import { createCompanyUser, createClientFor } from './helpers.js';

let app;
let token;

beforeAll(async () => {
  await startDb();
  ({ default: app } = await import('../src/app.js'));
});

afterAll(async () => {
  await stopDb();
});

beforeEach(async () => {
  await clearDb();
  ({ token } = await createCompanyUser(app));
});

describe('clientes', () => {
  it('crea un cliente', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente A',
        cif: 'B11111111',
        email: 'a@x.com',
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Cliente A');
  });

  it('rechaza CIF duplicado en la misma empresa', async () => {
    await createClientFor(app, token, { cif: 'B22222222' });
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Otro', cif: 'B22222222' });
    expect(res.status).toBe(409);
  });

  it('lista clientes paginados', async () => {
    await createClientFor(app, token, { cif: 'B30000001' });
    await createClientFor(app, token, { cif: 'B30000002' });

    const res = await request(app)
      .get('/api/client?limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalItems).toBe(2);
    expect(res.body.totalPages).toBe(1);
    expect(res.body.currentPage).toBe(1);
  });

  it('obtiene un cliente por id', async () => {
    const c = await createClientFor(app, token, { cif: 'B40000001' });
    const res = await request(app)
      .get(`/api/client/${c._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(c._id);
  });

  it('archiva (soft) y luego restaura', async () => {
    const c = await createClientFor(app, token, { cif: 'B50000001' });

    const del = await request(app)
      .delete(`/api/client/${c._id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    const archived = await request(app)
      .get('/api/client/archived')
      .set('Authorization', `Bearer ${token}`);
    expect(archived.body.totalItems).toBe(1);

    const restored = await request(app)
      .patch(`/api/client/${c._id}/restore`)
      .set('Authorization', `Bearer ${token}`);
    expect(restored.status).toBe(200);
    expect(restored.body.deleted).toBe(false);
  });

  it('borra hard', async () => {
    const c = await createClientFor(app, token, { cif: 'B60000001' });
    const del = await request(app)
      .delete(`/api/client/${c._id}?soft=false`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    const get = await request(app)
      .get(`/api/client/${c._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(404);
  });
});
