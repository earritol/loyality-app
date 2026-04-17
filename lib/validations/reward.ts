import { z } from 'zod'

export const redeemRewardSchema = z.object({
  rewardId: z.uuid(),
})
