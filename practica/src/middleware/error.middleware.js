import { AppError } from '../utils/handleError.js';
import { notifyError } from '../services/logger.service.js';

// Middleware global de errores. Express 5 captura solo los async,
// asi que todo acaba aqui si no se ha respondido antes.
const errorHandler = (err, req, res, next) => {
  // errores "controlados" por nosotros
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      details: err.details ?? undefined,
    });
  }

  // errores de validacion de mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: 'Datos invalidos',
      details: err.message,
    });
  }

  // clave duplicada (ej: email ya existe)
  if (err.code === 11000) {
    return res.status(409).json({
      error: true,
      message: 'Recurso duplicado',
      details: err.keyValue,
    });
  }

  // errores de multer
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: true,
      message: err.message,
    });
  }

  // fallback: log + 500
  console.error('[errorHandler]', err);

  // notificamos el 5xx a slack (no bloqueante)
  notifyError({
    method: req.method,
    path: req.originalUrl,
    status: 500,
    message: err.message,
  });

  res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
  });
};

export default errorHandler;
