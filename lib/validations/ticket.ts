import { z } from 'zod'

export const uploadTicketSchema = z.object({
  businessId: z.uuid(),
  imageUrl: z.url(),
})

export const reviewTicketSchema = z.object({
  ticketId: z.uuid(),
  status: z.enum(['approved', 'rejected']),
})
