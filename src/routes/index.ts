import { Hono } from 'hono';
import { cors } from 'hono/cors'
import { zValidator } from '@hono/zod-validator';
import { newGameSchema } from './schemas';
import AppService from '../services/app.service';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { buildGamePDA, settleGame } from '../utils/onchain';
import { getGame, getGamesByPlayer, getPendingGameResults, updateGameResult } from '../utils/db';
import { getPythPrices } from '../utils/app';
import { PersistedSettledGameResult } from '../types/game';

const router = new Hono();

// Enable CORS for all routes
router.use('/*', cors({
  origin: '*', // Allow any origin
}));


const validatorCb = (result: any, c: any) => {
  if (!result.success) {
    return c.text('Invalid!', 400);
  }
};

// router.post('/game', zValidator('json', newGameSchema, validatorCb), async (c) => {
//   const data = c.req.valid('json');

//   // build PDA and fetch data from solana RPC
//   const player = new PublicKey(data.player);
//   const gameId = new BN(data.gameId);

//   const gamePDA = buildGamePDA(player, gameId);
//   const gameAccount = await AppService.getInstance().program.account.game.fetch(gamePDA);

//   console.log(gameAccount);

//   await AppService.getInstance().redisClient.set(
//     `game:${data.player}:${data.gameId}`,
//     JSON.stringify({
//       startTime: gameAccount.startTime.toNumber(),
//       endTime: gameAccount.endTime.toNumber(),
//       betAmount: gameAccount.betAmount.toNumber(),
//       prediction: gameAccount.prediction,
//     }),
//   );

//   return c.json({
//     success: true,
//     message: 'OK',
//   });
// });

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
  // get games that needs to be settled
  const pendingGameResults = await getPendingGameResults();
  const pastPendingGameResults = pendingGameResults.filter(
    (game) => game.endTime < Math.floor(new Date().getTime() / 1000),
  );

  const settleResponse: {
    pending: string[];
    settled: string[];
  } = {
    pending: [],
    settled: [],
  };

  // decide game results
  for (const game of pastPendingGameResults) {
    const [priceAtStart, priceAtEnd] = await getPythPrices(game);

    if (priceAtStart && priceAtEnd) {
      const result = new BN(priceAtStart.price).lt(new BN(priceAtEnd.price)) === game.prediction;
      const amountWon = game.betAmount * (result ? 2 : 0);
      // settle game
      const transactionId = await settleGame(game, result, amountWon);
      console.log('transactionSignature', transactionId);

      const settledGameResult: PersistedSettledGameResult = {
        ...game,
        priceAtStart: priceAtStart.price,
        priceAtEnd: priceAtEnd.price,
        result,
        amountWon,
        transactionId: transactionId,
      };
      await updateGameResult(settledGameResult);
      settleResponse.settled.push(game.gameId);
    } else {
      console.log('No prices found for game', game.gameId);
    }
  }

  settleResponse.pending = pendingGameResults
    .filter((item) => !settleResponse.settled.includes(item.gameId))
    .map((item) => item.gameId);

  return c.json({
    success: true,
    message: settleResponse,
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

export default router;
