import { z } from 'zod';
import { emailSchema, objectIdSchema } from './common.schema.js';

const addressSchema = z
  .object({
    street: z.string().default(''),
    number: z.coerce.number().int().min(0).default(0),
    postal: z.string().default(''),
    city: z.string().default(''),
    province: z.string().default(''),
  })
  .default({});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nombre demasiado corto').trim(),
    projectCode: z.string().min(1, 'Codigo de proyecto requerido').trim(),
    client: objectIdSchema,
    email: emailSchema.optional(),
    notes: z.string().optional(),
    address: addressSchema,
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z.string().min(2).trim().optional(),
    email: emailSchema.optional(),
    notes: z.string().optional(),
    address: addressSchema.optional(),
    active: z.boolean().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    name: z.string().trim().optional(),
    client: objectIdSchema.optional(),
    active: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    sort: z.string().default('-createdAt'),
  }),
});

export const removeProjectSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  query: z.object({
    soft: z
      .enum(['true', 'false'])
      .default('true')
      .transform((v) => v === 'true'),
  }),
});
