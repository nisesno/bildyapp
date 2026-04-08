import { handleHttpError } from '../utils/handleError.js';

// Middleware de autorizacion por rol.
// Uso: checkRol(['admin']) en la ruta.
const checkRol = (roles = []) => (req, res, next) => {
  try {
    if (!req.user) {
      return handleHttpError(res, 'No autenticado', 401);
    }
    if (!roles.includes(req.user.role)) {
      return handleHttpError(res, 'No tienes permisos para esta accion', 403);
    }
    next();
  } catch (err) {
    return handleHttpError(res, 'Error comprobando rol', 500);
  }
};

export default checkRol;
