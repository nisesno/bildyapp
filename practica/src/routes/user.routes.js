import { Router } from 'express';
import * as ctrl from '../controllers/user.controller.js';
import auth from '../middleware/session.middleware.js';
import checkRol from '../middleware/rol.middleware.js';
import validate from '../middleware/validator.middleware.js';
import upload from '../middleware/upload.middleware.js';
import {
  registerSchema,
  validationSchema,
  loginSchema,
  onboardingSchema,
  companySchema,
  refreshSchema,
  inviteSchema,
  deleteSchema,
  changePasswordSchema,
} from '../schemas/user.schema.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: Registro, login y datos del usuario
 */

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     tags: [User]
 *     summary: Registrar un nuevo usuario
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: alumno@bildy.test }
 *               password: { type: string, example: Password123 }
 *     responses:
 *       201: { description: Usuario creado, devuelve tokens y datos }
 *       409: { description: Email ya registrado }
 */
router.post('/register', validate(registerSchema), ctrl.register);

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     tags: [User]
 *     summary: Login con email y password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login correcto, devuelve tokens }
 *       401: { description: Credenciales invalidas }
 */
router.post('/login', validate(loginSchema), ctrl.login);

/**
 * @openapi
 * /api/user/refresh:
 *   post:
 *     tags: [User]
 *     summary: Renovar tokens
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Nuevos accessToken y refreshToken }
 *       401: { description: Refresh invalido o revocado }
 */
router.post('/refresh', validate(refreshSchema), ctrl.refresh);

/**
 * @openapi
 * /api/user/validation:
 *   put:
 *     tags: [User]
 *     summary: Validar el email con codigo de 6 digitos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Cuenta verificada }
 *       400: { description: Codigo incorrecto }
 *       403: { description: Sin intentos restantes }
 */
router.put('/validation', auth, validate(validationSchema), ctrl.validateEmail);

/**
 * @openapi
 * /api/user/register:
 *   put:
 *     tags: [User]
 *     summary: Onboarding (nombre, apellidos y NIF)
 *     responses:
 *       200: { description: Datos guardados }
 */
router.put('/register', auth, validate(onboardingSchema), ctrl.onboarding);

/**
 * @openapi
 * /api/user/company:
 *   patch:
 *     tags: [User]
 *     summary: Crear empresa o unirse a una existente por CIF
 *     responses:
 *       200: { description: Empresa asociada }
 */
router.patch('/company', auth, validate(companySchema), ctrl.setCompany);

/**
 * @openapi
 * /api/user/logo:
 *   patch:
 *     tags: [User]
 *     summary: Subir logo de la empresa (multipart)
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo: { type: string, format: binary }
 *     responses:
 *       200: { description: Logo subido }
 */
router.patch('/logo', auth, upload.single('logo'), ctrl.uploadLogo);

/**
 * @openapi
 * /api/user:
 *   get:
 *     tags: [User]
 *     summary: Datos del usuario autenticado
 *     responses:
 *       200:
 *         description: Usuario con la empresa populada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 */
router.get('/', auth, ctrl.getMe);

/**
 * @openapi
 * /api/user/logout:
 *   post:
 *     tags: [User]
 *     summary: Cierra sesion (invalida el refresh token)
 *     responses:
 *       200: { description: Sesion cerrada }
 */
router.post('/logout', auth, ctrl.logout);

/**
 * @openapi
 * /api/user:
 *   delete:
 *     tags: [User]
 *     summary: Eliminar cuenta (soft o hard segun ?soft=)
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema: { type: string, enum: [true, false], default: true }
 *     responses:
 *       200: { description: Borrado realizado }
 */
router.delete('/', auth, validate(deleteSchema), ctrl.remove);

/**
 * @openapi
 * /api/user/invite:
 *   post:
 *     tags: [User]
 *     summary: Invitar a un guest a la empresa (solo admin)
 *     responses:
 *       201: { description: Guest creado }
 *       403: { description: Sin permisos }
 */
router.post(
  '/invite',
  auth,
  checkRol(['admin']),
  validate(inviteSchema),
  ctrl.invite,
);

/**
 * @openapi
 * /api/user/password:
 *   patch:
 *     tags: [User]
 *     summary: Cambiar la contraseña
 *     responses:
 *       200: { description: Password actualizada }
 */
router.patch(
  '/password',
  auth,
  validate(changePasswordSchema),
  ctrl.changePassword,
);

export default router;
