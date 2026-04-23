import { z } from 'zod'

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  slug: z.string().min(1, 'El slug es obligatorio').max(50, 'Máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  ownerEmail: z.email('Email inválido'),
})

export const addPaymentSchema = z.object({
  businessId: z.string().uuid(),
  amount: z.number({ error: 'Debe ser un número' }).positive('El monto debe ser mayor a 0'),
  paymentDate: z.string().min(1, 'La fecha es obligatoria'),
  method: z.enum(['cash', 'transfer', 'online'], { error: 'Método inválido' }),
  notes: z.string().max(500).optional().transform(v => v?.trim() || null),
})

export const updateStatusSchema = z.object({
  businessId: z.string().uuid(),
  status: z.enum(['active', 'past_due', 'suspended'], { error: 'Estatus inválido' }),
})
