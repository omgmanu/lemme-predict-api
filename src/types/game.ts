import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export enum GameResultStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
}

export type Game = {
  player: PublicKey;
  startTime: BN;
  endTime: BN;
  betAmount: BN;
  prediction: boolean;
  id: BN;
  transactionId: string | null;
};

export type PersistedGame = {
  player: string;
  startTime: number;
  endTime: number;
  betAmount: number;
  prediction: boolean;
  id: string;
  transactionId: string | null;
};

export type PersistedPendingGameResult = {
  gameId: string;
  player: string;
  startTime: number;
  endTime: number;
  betAmount: number;
  prediction: boolean;
  type: GameResultStatus;
};

export type PersistedSettledGameResult = PersistedPendingGameResult & {
  priceAtStart: string;
  priceAtEnd: string;
  result: boolean;
  amountWon: number;
  transactionId: string | null;
};