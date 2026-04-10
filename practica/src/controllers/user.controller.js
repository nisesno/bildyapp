import crypto from 'node:crypto';
import User from '../models/user.model.js';
import { encrypt, compare } from '../utils/handlePassword.js';
import { signAccessToken, signRefreshToken } from '../utils/handleJwt.js';
import { AppError } from '../utils/handleError.js';
import ee from '../utils/eventBus.js';

// genera un codigo de 6 digitos con ceros a la izquierda tipo "042915"
const generateVerificationCode = () => {
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, '0');
};

export const register = async (req, res) => {
  const { email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('El email ya esta registrado', 409);

  const hash = await encrypt(password);
  const code = generateVerificationCode();

  const user = await User.create({
    email,
    password: hash,
    verificationCode: code,
    verificationAttempts: 3,
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  ee.emit('user:registered', { userId: user._id, email: user.email, code });

  res.status(201).json({ accessToken, refreshToken, user });
};

export const validateEmail = async (req, res) => {
  const { code } = req.body;

  // releo el user pidiendo los campos con select:false
  const user = await User.findById(req.user._id).select(
    '+verificationCode +verificationAttempts',
  );

  if (!user) throw new AppError('Usuario no encontrado', 404);
  if (user.status === 'verified') {
    throw new AppError('La cuenta ya estaba verificada', 400);
  }
  if (user.verificationAttempts <= 0) {
    throw new AppError('Has agotado los intentos de verificacion', 403);
  }

  if (user.verificationCode !== code) {
    user.verificationAttempts -= 1;
    await user.save();
    throw new AppError(
      `Codigo incorrecto. Te quedan ${user.verificationAttempts} intento(s)`,
      400,
    );
  }

  user.status = 'verified';
  user.verificationCode = undefined;
  await user.save();

  ee.emit('user:verified', { userId: user._id, email: user.email });

  res.json({ acknowledged: true, user });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, deleted: false }).select('+password');
  if (!user) throw new AppError('Credenciales invalidas', 401);

  const ok = await compare(password, user.password);
  if (!ok) throw new AppError('Credenciales invalidas', 401);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken, user });
};
