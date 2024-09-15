import BN from 'bn.js';
import { Keypair, PublicKey, SendTransactionError } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { PersistedSettledGameResult } from '../types/game.js';
import { buildGamePDA, settleGame } from '../utils/onchain.js';
import { getPythPrices } from '../utils/app.js';
import { PersistedPendingGameResult } from '../types/game.js';
import { deletePendingGameResult, getUser, updateGameResult } from '../utils/db.js';
import AppService from './app.service.js';
import { getPrivateKey, getPrivateKeyBuffer } from './wallet.service.js';

export const settlePendingGames = async (pendingGameResults: PersistedPendingGameResult[]) => {
  const settleResponse: {
    pending: string[];
    settled: string[];
  } = {
    pending: [],
    settled: [],
  };

  // decide game results
  for (const game of pendingGameResults) {
    const [priceAtStart, priceAtEnd] = await getPythPrices(game);

    if (priceAtStart && priceAtEnd) {
      try {
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
      } catch (e) {
        console.log(`Error settling game. GameId: ${game.gameId}. Reason: ${e}`);
        if ((e as SendTransactionError).logs?.find((log) => log.includes('already in use')) !== undefined) {
          await deletePendingGameResult(game.gameId);
        }
      }
    } else {
      console.log('No prices found for game', game.gameId);
    }
  }

  settleResponse.pending = pendingGameResults
    .filter((item) => !settleResponse.settled.includes(item.gameId))
    .map((item) => item.gameId);

  return settleResponse;
};

const generateGameId = (size = 8): BN => {
  const result = crypto.getRandomValues(new Uint8Array(size));
  return new BN(result);
};

export const createGame = async (
  userId: string,
  timeframe: number,
  betAmount: number,
  prediction: boolean,
): Promise<{ gameId: string; transactionSignature: string }> => {
  const user = await getUser(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const privateKeyBuffer = getPrivateKeyBuffer(user.walletId);
  const walletOwner = Keypair.fromSecretKey(privateKeyBuffer);
  const gameId = generateGameId();
  console.log('gameId', gameId.toString());
  const gamePDA = buildGamePDA(new PublicKey(user.publicKey), gameId);

  const transactionSignature = await AppService.getInstance()
    .programWithProvider.methods.newGame(gameId, new BN(timeframe), new BN(betAmount), prediction)
    .accounts({
      player: new PublicKey(user.publicKey),
      // @ts-expect-error - TODO: fix this
      game: gamePDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([walletOwner])
    .rpc();

  return { gameId: gameId.toString(), transactionSignature };
};
