import request from 'supertest';
import { startDb, stopDb, clearDb } from './setup.js';
import {
  createCompanyUser,
  createClientFor,
  createProjectFor,
} from './helpers.js';

let app;
let token;
let projectId;

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
  const p = await createProjectFor(app, token, c._id);
  projectId = p._id;
});

describe('albaranes', () => {
  it('crea un albaran de horas', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: projectId,
        format: 'hours',
        hours: 8,
        description: 'Dia normal',
      });
    expect(res.status).toBe(201);
    expect(res.body.format).toBe('hours');
    expect(res.body.hours).toBe(8);
  });

  it('rechaza un albaran de material sin "material"', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ project: projectId, format: 'material', quantity: 3 });
    expect(res.status).toBe(400);
  });

  it('lista albaranes filtrando por project', async () => {
    await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ project: projectId, format: 'hours', hours: 4 });

    const res = await request(app)
      .get(`/api/deliverynote?project=${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalItems).toBe(1);
  });

  it('descarga el pdf', async () => {
    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ project: projectId, format: 'hours', hours: 5 });

    const res = await request(app)
      .get(`/api/deliverynote/pdf/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
  });

  it('no deja borrar uno firmado', async () => {
    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({ project: projectId, format: 'hours', hours: 3 });

    // un png 1x1 valido
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4//8/AwAI/AL+9p1iggAAAABJRU5ErkJggg==',
      'base64',
    );

    const sign = await request(app)
      .patch(`/api/deliverynote/${created.body._id}/sign`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', png, { filename: 's.png', contentType: 'image/png' });
    expect(sign.status).toBe(200);
    expect(sign.body.signed).toBe(true);

    const del = await request(app)
      .delete(`/api/deliverynote/${created.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(409);
  });
});
