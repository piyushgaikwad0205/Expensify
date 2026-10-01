import { z } from 'zod';

export const setBudgetDto = z.object({
  amount: z.number().nonnegative('Budget amount must be a positive number')
});
