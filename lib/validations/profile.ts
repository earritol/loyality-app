import { z } from 'zod'

export const updateProfileSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .nullable(),
})
