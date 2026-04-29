import { Router } from 'express';
import * as ctrl from '../controllers/client.controller.js';
import auth from '../middleware/session.middleware.js';
import validate from '../middleware/validator.middleware.js';
import {
  createClientSchema,
  updateClientSchema,
  idParamSchema,
  listClientsSchema,
  removeClientSchema,
} from '../schemas/client.schema.js';

const router = Router();

// todo bajo auth, los clients son siempre por compañia
router.use(auth);

router.post('/', validate(createClientSchema), ctrl.create);
router.get('/', validate(listClientsSchema), ctrl.list);
router.get('/archived', ctrl.archived);
router.get('/:id', validate(idParamSchema), ctrl.getOne);
router.put('/:id', validate(updateClientSchema), ctrl.update);
router.patch('/:id/restore', validate(idParamSchema), ctrl.restore);
router.delete('/:id', validate(removeClientSchema), ctrl.remove);

export default router;
