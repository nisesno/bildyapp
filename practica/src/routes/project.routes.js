import { Router } from 'express';
import * as ctrl from '../controllers/project.controller.js';
import auth from '../middleware/session.middleware.js';
import validate from '../middleware/validator.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  idParamSchema,
  listProjectsSchema,
  removeProjectSchema,
} from '../schemas/project.schema.js';

const router = Router();

router.use(auth);

router.post('/', validate(createProjectSchema), ctrl.create);
router.get('/', validate(listProjectsSchema), ctrl.list);
router.get('/archived', ctrl.archived);
router.get('/:id', validate(idParamSchema), ctrl.getOne);
router.put('/:id', validate(updateProjectSchema), ctrl.update);
router.patch('/:id/restore', validate(idParamSchema), ctrl.restore);
router.delete('/:id', validate(removeProjectSchema), ctrl.remove);

export default router;
