import { Router } from 'express';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/user', userRoutes);

// healthcheck por si acaso
router.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

export default router;
