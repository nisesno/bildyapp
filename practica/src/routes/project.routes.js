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

/**
 * @openapi
 * tags:
 *   - name: Project
 *     description: Proyectos asociados a clientes
 */

/**
 * @openapi
 * /api/project:
 *   post:
 *     tags: [Project]
 *     summary: Crear un proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Project' }
 *     responses:
 *       201: { description: Proyecto creado }
 *       409: { description: Codigo de proyecto duplicado }
 *   get:
 *     tags: [Project]
 *     summary: Listar proyectos (paginado, filtros por cliente, name, active)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: active
 *         schema: { type: string, enum: [true, false] }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: -createdAt }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagination' }
 */
router.post('/', validate(createProjectSchema), ctrl.create);
router.get('/', validate(listProjectsSchema), ctrl.list);

/**
 * @openapi
 * /api/project/archived:
 *   get:
 *     tags: [Project]
 *     summary: Listar proyectos archivados
 *     responses:
 *       200: { description: Lista de archivados }
 */
router.get('/archived', ctrl.archived);

/**
 * @openapi
 * /api/project/{id}:
 *   get:
 *     tags: [Project]
 *     summary: Obtener un proyecto por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Project' }
 *   put:
 *     tags: [Project]
 *     summary: Actualizar un proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Proyecto actualizado }
 *   delete:
 *     tags: [Project]
 *     summary: Archivar (soft) o borrar (hard)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: soft
 *         schema: { type: string, enum: [true, false], default: true }
 *     responses:
 *       200: { description: Operacion realizada }
 */
router.get('/:id', validate(idParamSchema), ctrl.getOne);
router.put('/:id', validate(updateProjectSchema), ctrl.update);

/**
 * @openapi
 * /api/project/{id}/restore:
 *   patch:
 *     tags: [Project]
 *     summary: Restaurar un proyecto archivado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Proyecto restaurado }
 */
router.patch('/:id/restore', validate(idParamSchema), ctrl.restore);
router.delete('/:id', validate(removeProjectSchema), ctrl.remove);

export default router;
