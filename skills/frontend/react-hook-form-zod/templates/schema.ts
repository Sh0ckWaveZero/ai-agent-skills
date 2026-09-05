import { z } from 'zod';

export const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export const errorResponseSchema = z.object({
  fieldErrors: z.object({ email: z.array(z.string()).optional() }),
});
