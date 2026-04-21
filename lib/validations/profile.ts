import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .nullable()
    .transform((v) => (v?.trim() === '' ? null : v?.trim() ?? null)),
  lastName: z
    .string()
    .max(100, 'El apellido no puede tener más de 100 caracteres')
    .nullable()
    .transform((v) => (v?.trim() === '' ? null : v?.trim() ?? null)),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido')
    .nullable()
    .transform((v) => (v?.trim() === '' ? null : v?.trim() ?? null)),
})
