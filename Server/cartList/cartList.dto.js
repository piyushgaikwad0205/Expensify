import { z } from 'zod';

export const createItemDto = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty'),
  price: z.number().nonnegative('Price must be greater than or equal to 0'),
  quantity: z.number().int().positive('Quantity must be at least 1').optional().default(1),
  isLocked: z.boolean().optional().default(false)
});

export const updateItemDto = createItemDto.partial();
