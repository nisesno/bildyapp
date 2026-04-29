import { Router } from 'express';
import userRoutes from './user.routes.js';
import clientRoutes from './client.routes.js';

const router = Router();

router.use('/user', userRoutes);
router.use('/client', clientRoutes);

// healthcheck por si acaso
router.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

export default router;
