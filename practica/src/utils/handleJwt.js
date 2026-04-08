import jwt from 'jsonwebtoken';

// access token corto, 15 min
export const signAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
      type: 'access',
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
  );
};

// refresh token largo, 7 dias
export const signRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      type: 'refresh',
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
