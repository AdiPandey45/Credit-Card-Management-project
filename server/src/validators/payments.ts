import { z } from 'zod';

export const createPaymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed ₹10,00,000'),
  method: z.enum(['bank', 'card', 'instant'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  })
});

export const paymentIdSchema = z.object({
  id: z.string().transform(Number)
});

export const cardIdSchema = z.object({
  cardId: z.string().transform(Number)
});