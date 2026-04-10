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

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);

router.put('/validation', auth, validate(validationSchema), ctrl.validateEmail);
router.put('/register', auth, validate(onboardingSchema), ctrl.onboarding);
router.patch('/company', auth, validate(companySchema), ctrl.setCompany);
router.patch('/logo', auth, upload.single('logo'), ctrl.uploadLogo);
router.get('/', auth, ctrl.getMe);
router.post('/logout', auth, ctrl.logout);
router.delete('/', auth, validate(deleteSchema), ctrl.remove);

router.post(
  '/invite',
  auth,
  checkRol(['admin']),
  validate(inviteSchema),
  ctrl.invite,
);

router.patch(
  '/password',
  auth,
  validate(changePasswordSchema),
  ctrl.changePassword,
);

export default router;
