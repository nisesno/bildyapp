import { z } from 'zod';

// Validaciones reutilizables para varios schemas

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID invalido');

export const emailSchema = z
  .string()
  .email('Email invalido')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Minimo 8 caracteres')
  .max(64, 'Maximo 64 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
  .regex(/[a-z]/, 'Debe contener al menos una minuscula')
  .regex(/[0-9]/, 'Debe contener al menos un numero');

// Los CIF/NIF reales tienen un algoritmo de letra de control, pero
// para la practica validamos solo el formato.
export const cifSchema = z
  .string()
  .regex(/^[A-HJNPQRSUVW][0-9]{7}[0-9A-J]$/i, 'CIF invalido')
  .transform((v) => v.toUpperCase());

export const nifSchema = z
  .string()
  .regex(/^[0-9]{8}[A-Z]$/i, 'NIF invalido')
  .transform((v) => v.toUpperCase());
