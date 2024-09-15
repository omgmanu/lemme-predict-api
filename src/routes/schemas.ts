import { z } from 'zod';

export const newGameSchema = z.object({
  timeframe: z.number(),
  betAmount: z.number(),
  prediction: z.boolean(),
});

