import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import AppService from '../services/app.service.js';
import { PersistedPendingGameResult } from '../types/game.js';
import env from '../env.js';

const gameVaultKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(env['VAULT_PRIVATE_KEY'])));

export const buildGamePDA = (playerPublicKey: PublicKey, gameId: anchor.BN): PublicKey => {
  const programId = AppService.getInstance().program.programId;

  const gamePDA = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), playerPublicKey.toBuffer(), gameId.toArrayLike(Buffer, 'le', 8)],
    programId,
  )[0];

  return gamePDA;
};

export const buildGameResultPDA = (gameId: anchor.BN): PublicKey => {
  const programId = AppService.getInstance().programWithProvider.programId;

  const gameResultPDA = PublicKey.findProgramAddressSync(
    [Buffer.from('game_result'), gameId.toArrayLike(Buffer, 'le', 8)],
    programId,
  )[0];

  return gameResultPDA;
};

export const settleGame = async (
  game: PersistedPendingGameResult,
  result: boolean,
  amountWon: number,
): Promise<string> => {
  const gameId = new anchor.BN(game.gameId);
  const gameResultPDA = buildGameResultPDA(gameId);

  const transaction = await AppService.getInstance()
    .programWithProvider.methods.settleGame(gameId, result, new anchor.BN(amountWon))
    .accounts({
      player: game.player,
      // @ts-ignore
      gameResult: gameResultPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([gameVaultKeypair])
    .rpc();

  console.log('Transaction signature:', transaction);

  return transaction;
};
