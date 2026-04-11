import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

// Firma del access token (corto, 15 min)
// El jti garantiza que cada token sea unico aunque se firmen
// en el mismo segundo (si no, el iat en segundos colisiona).
export const signAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
      type: 'access',
      jti: crypto.randomUUID(),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
  );
};

// Firma del refresh token (7 dias)
export const signRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      type: 'refresh',
      jti: crypto.randomUUID(),
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
