import request from 'supertest';
import { startDb, stopDb, clearDb } from './setup.js';
import { createCompanyUser, createClientFor } from './helpers.js';

let app;
let token;
let clientId;

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
  const c = await createClientFor(app, token);
  clientId = c._id;
});

describe('proyectos', () => {
  it('crea un proyecto enlazado al cliente', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Proyecto X', projectCode: 'PRJ-X', client: clientId });
    expect(res.status).toBe(201);
    expect(res.body.client).toBe(clientId);
  });

  it('rechaza projectCode duplicado en la misma empresa', async () => {
    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'P1', projectCode: 'PRJ-DUP', client: clientId });
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'P2', projectCode: 'PRJ-DUP', client: clientId });
    expect(res.status).toBe(409);
  });

  it('lista filtrando por cliente', async () => {
    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'P1', projectCode: 'PRJ-1', client: clientId });

    const res = await request(app)
      .get(`/api/project?client=${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalItems).toBe(1);
  });

  it('archiva y restaura', async () => {
    const created = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Proyecto X', projectCode: 'PRJ-ARCH', client: clientId });

    await request(app)
      .delete(`/api/project/${created.body._id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const arch = await request(app)
      .get('/api/project/archived')
      .set('Authorization', `Bearer ${token}`);
    expect(arch.body.totalItems).toBe(1);

    const r = await request(app)
      .patch(`/api/project/${created.body._id}/restore`)
      .set('Authorization', `Bearer ${token}`);
    expect(r.status).toBe(200);
  });
});
