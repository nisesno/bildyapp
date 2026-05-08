import request from 'supertest';
import { startDb, stopDb, clearDb } from './setup.js';
import {
  createCompanyUser,
  joinCompanyUser,
  createClientFor,
  createProjectFor,
} from './helpers.js';

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

// PNG 1x1 valido para los tests que requieren firma
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4//8/AwAI/AL+9p1iggAAAABJRU5ErkJggg==',
  'base64',
);

describe('aislamiento multi-tenant y contrato del albaran', () => {
  it('dado dos empresas con sus albaranes, cuando empresa B lista, entonces no ve los de empresa A', async () => {
    const a = await createCompanyUser(app, 'a@bildy.test', 'B11111111');
    const b = await createCompanyUser(app, 'b@bildy.test', 'B22222222');

    // empresa A crea cliente, proyecto y albaran
    const cliA = await createClientFor(app, a.token, { cif: 'B33333333' });
    const prjA = await createProjectFor(app, a.token, cliA._id, {
      projectCode: 'PRJ-A-1',
    });
    await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ project: prjA._id, format: 'hours', hours: 8 });

    // empresa B lista sus albaranes -> 0
    const list = await request(app)
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${b.token}`);

    expect(list.status).toBe(200);
    expect(list.body.totalItems).toBe(0);
    expect(list.body.data).toEqual([]);
  });

  it('dado un albaran de empresa A, cuando empresa B intenta descargar el pdf, entonces 404', async () => {
    const a = await createCompanyUser(app, 'a@bildy.test', 'B11111111');
    const b = await createCompanyUser(app, 'b@bildy.test', 'B22222222');

    const cliA = await createClientFor(app, a.token, { cif: 'B33333333' });
    const prjA = await createProjectFor(app, a.token, cliA._id, {
      projectCode: 'PRJ-A-1',
    });
    const noteA = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ project: prjA._id, format: 'hours', hours: 4 });

    // empresa B intenta descargar el pdf del albaran de A
    const res = await request(app)
      .get(`/api/deliverynote/pdf/${noteA.body._id}`)
      .set('Authorization', `Bearer ${b.token}`);

    expect(res.status).toBe(404);
  });

  it('dado un albaran de un usuario y otro usuario en la misma empresa, cuando este firma, entonces 200', async () => {
    // user1 crea la empresa con cif B11111111
    const owner = await createCompanyUser(app, 'owner@bildy.test', 'B11111111');
    // user2 se une a la misma empresa por el mismo cif
    const guest = await joinCompanyUser(app, 'guest@bildy.test', 'B11111111');

    expect(guest.companyId).toBe(owner.companyId);

    // owner crea el albaran
    const cli = await createClientFor(app, owner.token, { cif: 'B33333333' });
    const prj = await createProjectFor(app, owner.token, cli._id, {
      projectCode: 'PRJ-1',
    });
    const note = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ project: prj._id, format: 'hours', hours: 6 });

    // guest (mismo company) firma el albaran
    const res = await request(app)
      .patch(`/api/deliverynote/${note.body._id}/sign`)
      .set('Authorization', `Bearer ${guest.token}`)
      .attach('signature', png, { filename: 's.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.signed).toBe(true);
  });

  it('dado un albaran ya firmado, cuando se intenta borrar, entonces 409 con el body exacto del contrato', async () => {
    const a = await createCompanyUser(app, 'a@bildy.test', 'B11111111');
    const cli = await createClientFor(app, a.token, { cif: 'B33333333' });
    const prj = await createProjectFor(app, a.token, cli._id, {
      projectCode: 'PRJ-1',
    });
    const note = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ project: prj._id, format: 'hours', hours: 3 });

    // firmo
    await request(app)
      .patch(`/api/deliverynote/${note.body._id}/sign`)
      .set('Authorization', `Bearer ${a.token}`)
      .attach('signature', png, { filename: 's.png', contentType: 'image/png' });

    // intento borrar
    const del = await request(app)
      .delete(`/api/deliverynote/${note.body._id}`)
      .set('Authorization', `Bearer ${a.token}`);

    expect(del.status).toBe(409);
    expect(del.body).toEqual({
      error: true,
      message: 'No se puede borrar un albaran firmado',
    });
  });

  it('dado una peticion sin token, cuando GET /api/deliverynote, entonces 401', async () => {
    const res = await request(app).get('/api/deliverynote');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
  });
});
