import { Hono } from 'hono';
import { getGame, getGamesByPlayer, getPendingGameResults } from '../utils/db.js';
import env from '../env.js';
import { createGame, settlePendingGames } from 'src/services/game.service.js';
import { getFromSession } from 'src/services/auth.service.js';
import { validator } from 'hono/validator';
import { newGameSchema } from './schemas.js';

const router = new Hono();

router.get('/game/:gameId', async (c) => {
  const gameId = c.req.param('gameId');

  const game = await getGame(gameId);

  if (!game) {
    return c.json({
      success: false,
      message: 'Cannot find game in DB.',
    });
  }

  return c.json({
    success: true,
    message: game,
  });
});

router.get('/games/settle', async (c) => {
  const authKey = c.req.query('authKey');

  if (authKey !== env.SETTLE_AUTH_KEY) {
    return c.json(
      {
        success: false,
        message: 'Unauthorized: Invalid auth key',
      },
      401,
    );
  }

  // get games that needs to be settled
  const pendingGameResults = await getPendingGameResults();
  const pastPendingGameResults = pendingGameResults.filter(
    (game) => game.endTime < Math.floor(new Date().getTime() / 1000),
  );

  const result = await settlePendingGames(pastPendingGameResults);

  return c.json({
    success: true,
    message: result,
  });
});

router.get('/games/:playerAddress', async (c) => {
  const playerAddress = c.req.param('playerAddress');
  const games = await getGamesByPlayer(playerAddress);

  return c.json({
    success: true,
    message: games.sort((a, b) => b.startTime - a.startTime),
  });
});

router.post(
  '/games/create',
  validator('json', (value, c) => {
    const parsed = newGameSchema.safeParse(value);

    return !parsed.success
      ? c.json(
          {
            error: 'Invalid request',
          },
          400,
        )
      : parsed.data;
  }),
  async (c) => {
    const userId = getFromSession(c, 'user-id');
    const { timeframe, betAmount, prediction } = c.req.valid('json');

    if (!userId) {
      return c.json(
        {
          error: 'User not logged in',
        },
        401,
      );
    }

    const game = await createGame(userId, timeframe, betAmount, prediction);

    return c.json({
      success: true,
      message: game,
    });
  },
);

export default router;
