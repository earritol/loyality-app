import { z } from 'zod'

export const adminRedemptionSchema = z.object({
  userId: z.string().uuid(),
  businessId: z.string().uuid(),
  rewardId: z.string().uuid(),
})
