import { Router } from 'express';
import * as ctrl from '../controllers/deliverynote.controller.js';
import auth from '../middleware/session.middleware.js';
import validate from '../middleware/validator.middleware.js';
import uploadMemory from '../middleware/uploadMemory.middleware.js';
import {
  createDeliveryNoteSchema,
  idParamSchema,
  listDeliveryNotesSchema,
} from '../schemas/deliverynote.schema.js';

const router = Router();

router.use(auth);

/**
 * @openapi
 * tags:
 *   - name: DeliveryNote
 *     description: Albaranes (horas o materiales)
 */

/**
 * @openapi
 * /api/deliverynote:
 *   post:
 *     tags: [DeliveryNote]
 *     summary: Crear un albaran
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/DeliveryNote' }
 *     responses:
 *       201: { description: Albaran creado }
 *   get:
 *     tags: [DeliveryNote]
 *     summary: Listar albaranes (paginado, varios filtros)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: project
 *         schema: { type: string }
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [hours, material] }
 *       - in: query
 *         name: signed
 *         schema: { type: string, enum: [true, false] }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pagination' }
 */
router.post('/', validate(createDeliveryNoteSchema), ctrl.create);
router.get('/', validate(listDeliveryNotesSchema), ctrl.list);

/**
 * @openapi
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     tags: [DeliveryNote]
 *     summary: Descargar el albaran en PDF (o redirigir al de la nube si esta firmado)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF binario
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 */
router.get('/pdf/:id', validate(idParamSchema), ctrl.downloadPdf);

/**
 * @openapi
 * /api/deliverynote/{id}:
 *   get:
 *     tags: [DeliveryNote]
 *     summary: Obtener un albaran (con user, client y project populados)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/DeliveryNote' }
 *   delete:
 *     tags: [DeliveryNote]
 *     summary: Borrar un albaran (no permitido si esta firmado)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Borrado correcto }
 *       409: { description: Esta firmado, no se puede borrar }
 */
router.get('/:id', validate(idParamSchema), ctrl.getOne);

/**
 * @openapi
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     tags: [DeliveryNote]
 *     summary: Firmar un albaran (multipart con la imagen "signature")
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature: { type: string, format: binary }
 *     responses:
 *       200: { description: Albaran firmado }
 *       409: { description: Ya estaba firmado }
 */
router.patch('/:id/sign', uploadMemory.single('signature'), ctrl.sign);
router.delete('/:id', validate(idParamSchema), ctrl.remove);

export default router;
