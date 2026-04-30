import { Router } from 'express';
import * as ctrl from '../controllers/deliverynote.controller.js';
import auth from '../middleware/session.middleware.js';
import validate from '../middleware/validator.middleware.js';
import {
  createDeliveryNoteSchema,
  idParamSchema,
  listDeliveryNotesSchema,
} from '../schemas/deliverynote.schema.js';

const router = Router();

router.use(auth);

router.post('/', validate(createDeliveryNoteSchema), ctrl.create);
router.get('/', validate(listDeliveryNotesSchema), ctrl.list);
router.get('/:id', validate(idParamSchema), ctrl.getOne);
router.delete('/:id', validate(idParamSchema), ctrl.remove);

export default router;
