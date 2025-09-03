import { z } from 'zod';

export const cardApplicationSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  pan: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format: ABCDE1234F')
    .length(10, 'PAN must be exactly 10 characters'),
  income: z.number()
    .min(50000, 'Minimum annual income is ₹50,000')
    .max(10000000, 'Maximum annual income is ₹1,00,00,000'),
  product: z.enum(['Silver', 'Gold', 'Platinum'], {
    errorMap: () => ({ message: 'Please select a valid card product' })
  })
});

export const cardIdSchema = z.object({
  id: z.string().transform(Number)
});

export const cardStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED', 'INACTIVE'])
});

export const autopaySchema = z.object({
  enabled: z.boolean()
});