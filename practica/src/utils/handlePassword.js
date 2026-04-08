import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const encrypt = async (plain) => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

export const compare = async (plain, hashed) => {
  return bcrypt.compare(plain, hashed);
};
