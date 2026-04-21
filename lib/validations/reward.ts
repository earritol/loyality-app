import { z } from 'zod'

// Existing — user-facing redeem
export const redeemRewardSchema = z.object({
  rewardId: z.uuid(),
})

// Admin — create/edit reward form
export const rewardFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .nullable()
    .transform((v) => (v?.trim() === '' ? null : v?.trim() ?? null)),
  requiredVisits: z
    .number({ error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .positive('Debe ser mayor a 0'),
})

// Admin — update existing reward
export const updateRewardSchema = rewardFormSchema.extend({
  rewardId: z.string().uuid(),
})

// Admin — toggle active/inactive
export const toggleRewardSchema = z.object({
  rewardId: z.string().uuid(),
})
