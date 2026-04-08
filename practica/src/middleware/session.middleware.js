import { verifyAccessToken } from '../utils/handleJwt.js';
import { handleHttpError } from '../utils/handleError.js';
import User from '../models/user.model.js';

// Comprueba el Bearer token y adjunta el usuario a req.user
const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return handleHttpError(res, 'Token no proporcionado', 401);
    }

    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      return handleHttpError(res, 'Tipo de token invalido', 401);
    }

    const user = await User.findById(payload._id);
    if (!user || user.deleted) {
      return handleHttpError(res, 'Usuario no encontrado', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    // cualquier error de jwt (expirado, invalido...) cae aqui
    return handleHttpError(res, 'Token invalido o expirado', 401);
  }
};

export default authMiddleware;
