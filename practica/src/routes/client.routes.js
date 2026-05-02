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

router.use(auth);

/**
 * @openapi
 * tags:
 *   - name: Client
 *     description: Clientes de la empresa
 */

/**
 * @openapi
 * /api/client:
 *   post:
 *     tags: [Client]
 *     summary: Crear un cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Client' }
 *     responses:
 *       201: { description: Cliente creado }
 *       409: { description: CIF duplicado en la empresa }
 *   get:
 *     tags: [Client]
 *     summary: Listar clientes (paginado)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: -createdAt }
 *     responses:
 *       200:
 *         description: Lista paginada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagination' }
 */
router.post('/', validate(createClientSchema), ctrl.create);
router.get('/', validate(listClientsSchema), ctrl.list);

/**
 * @openapi
 * /api/client/archived:
 *   get:
 *     tags: [Client]
 *     summary: Listar clientes archivados (soft deleted)
 *     responses:
 *       200: { description: Lista de archivados }
 */
router.get('/archived', ctrl.archived);

/**
 * @openapi
 * /api/client/{id}:
 *   get:
 *     tags: [Client]
 *     summary: Obtener un cliente por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Client' }
 *       404: { description: No encontrado }
 *   put:
 *     tags: [Client]
 *     summary: Actualizar un cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cliente actualizado }
 *   delete:
 *     tags: [Client]
 *     summary: Archivar (soft) o borrar (hard) un cliente
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
router.put('/:id', validate(updateClientSchema), ctrl.update);

/**
 * @openapi
 * /api/client/{id}/restore:
 *   patch:
 *     tags: [Client]
 *     summary: Restaurar un cliente archivado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cliente restaurado }
 */
router.patch('/:id/restore', validate(idParamSchema), ctrl.restore);
router.delete('/:id', validate(removeClientSchema), ctrl.remove);

export default router;
