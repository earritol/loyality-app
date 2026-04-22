import { z } from 'zod'

export const businessSettingsSchema = z.object({
  businessId: z.string().uuid(),
  programName: z.string().max(100, 'Máximo 100 caracteres').optional()
    .transform(v => v?.trim() || null),
  rulesText: z.string().max(2000, 'Máximo 2000 caracteres').optional()
    .transform(v => v?.trim() || null),
  termsText: z.string().max(5000, 'Máximo 5000 caracteres').optional()
    .transform(v => v?.trim() || null),
  maxVisitsPerDay: z.number({ error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(1, 'Debe ser al menos 1'),
})

export const addTeamMemberSchema = z.object({
  businessId: z.string().uuid(),
  email: z.email('Email inválido'),
})

export const removeTeamMemberSchema = z.object({
  businessId: z.string().uuid(),
  userId: z.string().uuid(),
})
