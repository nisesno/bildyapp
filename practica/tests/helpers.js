import request from 'supertest';

// Helper que registra un usuario, le mete una empresa y devuelve token + ids.
// Lo uso en los tests de client/project/deliverynote para no repetirme.
export const createCompanyUser = async (app, email = 'owner@bildy.test') => {
  const reg = await request(app)
    .post('/api/user/register')
    .send({ email, password: 'Password123' });
  const token = reg.body.accessToken;

  // onboarding
  await request(app)
    .put('/api/user/register')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Pepe', lastName: 'Garcia', nif: '12345678Z' });

  // crear empresa
  const comp = await request(app)
    .patch('/api/user/company')
    .set('Authorization', `Bearer ${token}`)
    .send({
      type: 'business',
      name: 'Bildy SL',
      cif: 'B12345678',
      street: 'Calle Falsa',
      number: 1,
      postal: '28080',
      city: 'Madrid',
      province: 'Madrid',
    });

  return {
    token,
    userId: reg.body.user._id,
    companyId: comp.body.company,
  };
};

export const createClientFor = async (app, token, overrides = {}) => {
  const res = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Cliente Test',
      cif: 'B87654321',
      email: 'cli@bildy.test',
      ...overrides,
    });
  return res.body;
};

export const createProjectFor = async (app, token, clientId, overrides = {}) => {
  const res = await request(app)
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Proyecto Test',
      projectCode: 'PRJ-001',
      client: clientId,
      ...overrides,
    });
  return res.body;
};
