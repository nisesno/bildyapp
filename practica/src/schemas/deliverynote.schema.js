import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

const workerSchema = z.object({
  name: z.string().min(1).trim(),
  hours: z.coerce.number().min(0),
});

// uso superRefine para que segun el format pida unos campos u otros
export const createDeliveryNoteSchema = z.object({
  body: z
    .object({
      project: objectIdSchema,
      format: z.enum(['material', 'hours']),
      description: z.string().optional(),
      workDate: z.coerce.date().optional(),
      // material
      material: z.string().optional(),
      quantity: z.coerce.number().min(0).optional(),
      unit: z.string().optional(),
      // horas
      hours: z.coerce.number().min(0).optional(),
      workers: z.array(workerSchema).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.format === 'material' && !data.material) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['material'],
          message: 'El material es obligatorio si format=material',
        });
      }
      if (data.format === 'hours') {
        const tieneHoras = (data.hours ?? 0) > 0;
        const tieneWorkers = (data.workers ?? []).length > 0;
        if (!tieneHoras && !tieneWorkers) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['hours'],
            message: 'Indica horas o al menos un trabajador',
          });
        }
      }
    }),
});

export const idParamSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

export const listDeliveryNotesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    project: objectIdSchema.optional(),
    client: objectIdSchema.optional(),
    format: z.enum(['material', 'hours']).optional(),
    signed: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    sort: z.string().default('-workDate'),
  }),
});
