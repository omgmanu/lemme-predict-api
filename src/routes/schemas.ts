import { z } from 'zod';

export const newGameSchema = z.object({
  gameId: z.string(),
  player: z.string(),
});

