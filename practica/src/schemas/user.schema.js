import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  cifSchema,
  nifSchema,
} from './common.schema.js';

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const validationSchema = z.object({
  body: z.object({
    code: z
      .string()
      .length(6, 'El codigo debe tener 6 digitos')
      .regex(/^[0-9]+$/, 'El codigo solo puede contener numeros'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password requerida'),
  }),
});

// refine para que nombre y apellidos no sean el mismo string
export const onboardingSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Nombre demasiado corto').trim(),
      lastName: z.string().min(2, 'Apellidos demasiado cortos').trim(),
      nif: nifSchema,
    })
    .refine((data) => data.name !== data.lastName, {
      message: 'Nombre y apellidos no pueden ser identicos',
      path: ['lastName'],
    }),
});

// discriminated union segun el tipo de cuenta
const companyBusiness = z.object({
  type: z.literal('business'),
  name: z.string().min(2, 'Nombre de empresa requerido').trim(),
  cif: cifSchema,
  street: z.string().default(''),
  number: z.coerce.number().int().min(0).default(0),
  postal: z.string().default(''),
  city: z.string().default(''),
  province: z.string().default(''),
});

const companyFreelance = z.object({
  type: z.literal('freelance'),
  street: z.string().default(''),
  number: z.coerce.number().int().min(0).default(0),
  postal: z.string().default(''),
  city: z.string().default(''),
  province: z.string().default(''),
});

export const companySchema = z.object({
  body: z.discriminatedUnion('type', [companyBusiness, companyFreelance]),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'refreshToken requerido'),
  }),
});

export const inviteSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const deleteSchema = z.object({
  query: z.object({
    soft: z
      .enum(['true', 'false'])
      .default('true')
      .transform((v) => v === 'true'),
  }),
});
