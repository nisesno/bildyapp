import { z } from 'zod';
import { cifSchema, emailSchema, objectIdSchema } from './common.schema.js';

const addressSchema = z
  .object({
    street: z.string().default(''),
    number: z.coerce.number().int().min(0).default(0),
    postal: z.string().default(''),
    city: z.string().default(''),
    province: z.string().default(''),
  })
  .default({});

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nombre demasiado corto').trim(),
    cif: cifSchema,
    email: emailSchema.optional(),
    phone: z.string().trim().optional(),
    address: addressSchema,
  }),
});

export const updateClientSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z.string().min(2).trim().optional(),
    email: emailSchema.optional(),
    phone: z.string().trim().optional(),
    address: addressSchema.optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

// query de listado: paginacion + filtros
export const listClientsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    name: z.string().trim().optional(),
    sort: z.string().default('-createdAt'),
  }),
});

export const removeClientSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  query: z.object({
    soft: z
      .enum(['true', 'false'])
      .default('true')
      .transform((v) => v === 'true'),
  }),
});
