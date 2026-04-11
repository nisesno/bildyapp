// Mini sanitizador anti inyeccion NoSQL.
// Recorre recursivamente req.body y elimina claves sospechosas
// (las que empiezan por "$" o contienen ".").
// No tocamos req.query porque en Express 5 es un getter inmutable,
// y de todas formas lo valida Zod en el middleware de validacion.
const sanitizeBody = (req, res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }
      if (typeof obj[key] === 'object') {
        clean(obj[key]);
      }
    }
  };

  clean(req.body);
  next();
};

export default sanitizeBody;
