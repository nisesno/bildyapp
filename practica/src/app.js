import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import errorHandler from './middleware/error.middleware.js';
import sanitizeBody from './middleware/sanitize.middleware.js';
import swaggerSpecs from './config/swagger.js';

// importar los listeners registra sus handlers en el bus
import './listeners/user.listeners.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());

// 100 reqs / 15min global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, message: 'Demasiadas peticiones, prueba mas tarde' },
});
app.use(limiter);

// mas estricto en login/register (fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: true, message: 'Demasiados intentos de autenticacion' },
});
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(sanitizeBody);

app.use('/storage', express.static('storage'));

// docs swagger - lo dejo sin auth para poder probarlo
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

export default app;
