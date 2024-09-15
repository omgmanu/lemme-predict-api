import {
  GameResultStatus,
  Game as GameType,
  PersistedGame,
  PersistedPendingGameResult,
  PersistedSettledGameResult,
} from '../types/game.js';
import AppService from '../services/app.service.js';
import { User } from '../types/user.js';

const GAME_KEY_PREFIX = 'game';
const GAME_RESULT_KEY_PREFIX = 'game-result';

export const persistGame = async (decodedGameData: GameType, transactionId: string | null): Promise<void> => {
  const redisClient = AppService.getInstance().redisClient;

  Promise.all([
    redisClient.set(
      `${GAME_KEY_PREFIX}:${decodedGameData.player.toString()}:${decodedGameData.id.toString()}`,
      JSON.stringify({
        startTime: decodedGameData.startTime.toNumber(),
        endTime: decodedGameData.endTime.toNumber(),
        betAmount: decodedGameData.betAmount.toNumber(),
        prediction: decodedGameData.prediction,
        id: decodedGameData.id.toString(),
        player: decodedGameData.player.toString(),
        transactionId: transactionId,
      }),
    ),
    redisClient.set(
      `${GAME_RESULT_KEY_PREFIX}:${decodedGameData.player.toString()}:${decodedGameData.id.toString()}:${
        GameResultStatus.PENDING
      }`,
      JSON.stringify({
        gameId: decodedGameData.id.toString(),
        player: decodedGameData.player.toString(),
        startTime: decodedGameData.startTime.toNumber(),
        endTime: decodedGameData.endTime.toNumber(),
        betAmount: decodedGameData.betAmount.toNumber(),
        prediction: decodedGameData.prediction,
        type: GameResultStatus.PENDING,
      }),
    ),
  ]);
};

export const getGame = async (
  gameId: string,
): Promise<{ game: PersistedGame; gameResult: PersistedPendingGameResult } | null> => {
  const redisClient = AppService.getInstance().redisClient;
  const [gameKeys, gameResultKeys] = await Promise.all([
    redisClient.keys(`${GAME_KEY_PREFIX}:*:${gameId}`),
    redisClient.keys(`${GAME_RESULT_KEY_PREFIX}:*:${gameId}:*`),
  ]);

  if (!gameKeys.length && !gameResultKeys.length) {
    return null;
  }

  const [game, gameResult] = (await redisClient.mget([...gameKeys, ...gameResultKeys])).filter(
    (item) => item !== null,
  ) as string[];

  return {
    game: JSON.parse(game),
    gameResult: JSON.parse(gameResult),
  };
};

export const getGamesByPlayer = async (playerAddress: string): Promise<PersistedGame[]> => {
  const redisClient = AppService.getInstance().redisClient;

  const [pendingGameKeys, settledGameKeys] = await Promise.all([
    redisClient.keys(`${GAME_RESULT_KEY_PREFIX}:${playerAddress}:*:${GameResultStatus.PENDING}`),
    redisClient.keys(`${GAME_RESULT_KEY_PREFIX}:${playerAddress}:*:${GameResultStatus.SETTLED}`),
  ]);

  if (!pendingGameKeys.length && !settledGameKeys.length) {
    return [];
  }

  const valuesNotNull = (await redisClient.mget([...pendingGameKeys, ...settledGameKeys])).filter(
    (item) => item !== null,
  ) as string[];

  return valuesNotNull.map((item) => JSON.parse(item));
};

export const getPendingGameResults = async (): Promise<PersistedPendingGameResult[]> => {
  const redisClient = AppService.getInstance().redisClient;
  const keys = await redisClient.keys(`${GAME_RESULT_KEY_PREFIX}:*:*:${GameResultStatus.PENDING}`);

  if (!keys.length) {
    return [];
  }

  const valuesNotNull = (await redisClient.mget(keys)).filter((item) => item !== null) as string[];

  return valuesNotNull.map((item) => JSON.parse(item));
};

export const updateGameResult = async (game: PersistedSettledGameResult) => {
  const redisClient = AppService.getInstance().redisClient;

  const { gameId, player } = game;

  Promise.all([
    redisClient.del(`${GAME_RESULT_KEY_PREFIX}:${player}:${gameId}:${GameResultStatus.PENDING}`),
    redisClient.set(
      `${GAME_RESULT_KEY_PREFIX}:${player}:${gameId}:${GameResultStatus.SETTLED}`,
      JSON.stringify({ ...game, type: GameResultStatus.SETTLED }),
    ),
  ]);
};

export const deletePendingGameResult = async (gameId: string): Promise<number> => {
  const redisClient = AppService.getInstance().redisClient;
  return redisClient.del(`${GAME_RESULT_KEY_PREFIX}:*:${gameId}:${GameResultStatus.PENDING}`);
};

export const persistUser = async (user: User, walletId: number) => {
  const redisClient = AppService.getInstance().redisClient;

  return redisClient.set(`user:${user.id}:${walletId}`, JSON.stringify(user));
};

export const getUser = async (userId: string): Promise<User | null> => {
  const redisClient = AppService.getInstance().redisClient;

  const userKeys = await redisClient.keys(`user:${userId}:*`);

  if (!userKeys.length) {
    return null;
  }

  const valuesNotNull = (await redisClient.mget(userKeys)).filter((item) => item !== null) as string[];
  const users = valuesNotNull.map((item) => JSON.parse(item));

  return users.length ? users[0] : null;
};

export const deleteUser = async (userId: string): Promise<number> => {
  const redisClient = AppService.getInstance().redisClient;
  return redisClient.del(`user:${userId}`);
};

export const getUsersCount = async (): Promise<number> => {
  const redisClient = AppService.getInstance().redisClient;

  const keys = await redisClient.keys('user:*:*');

  return keys.length;
};
