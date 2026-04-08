// Clase de error personalizada para lanzar errores "controlados"
// desde los controladores con un codigo HTTP concreto.
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper rapido para respuestas de error desde los middlewares
// (lo uso cuando no quiero montar toda una AppError).
export const handleHttpError = (res, message = 'Algo ha ido mal', code = 500) => {
  res.status(code).json({ error: true, message });
};
