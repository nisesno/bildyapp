// Middleware generico que valida req.body / req.params / req.query contra
// un schema de Zod. Si pasa, sustituye los objetos por los datos parseados
// (asi nos beneficiamos de los .transform()).
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    // devolvemos solo el primer error para no marear
    const first = result.error.errors[0];
    return res.status(400).json({
      error: true,
      message: first.message,
      path: first.path,
    });
  }

  // sustituimos con los datos ya normalizados (body y params son mutables).
  // En Express 5, req.query es un getter inmutable, asi que guardamos los
  // datos validados en req.validatedQuery para acceder desde los controllers.
  if (result.data.body) req.body = result.data.body;
  if (result.data.params) req.params = result.data.params;
  if (result.data.query) req.validatedQuery = result.data.query;

  next();
};

export default validate;
