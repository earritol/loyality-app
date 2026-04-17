import { z } from 'zod'

export const recordVisitSchema = z.object({
  businessId: z.uuid(),
  locationId: z.uuid().nullable().optional(),
  method: z.enum(['qr', 'manual']),
})
