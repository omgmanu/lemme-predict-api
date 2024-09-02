import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import idl from '../idl/game.json';
import AppService from '../services/app.service';
import { PersistedPendingGameResult } from '../types/game';
import env from '../env';

const gameVaultKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(env['VAULT_PRIVATE_KEY'])));

export const buildGamePDA = (playerPublicKey: PublicKey, gameId: BN): PublicKey => {
  const programId = AppService.getInstance().program.programId;

  const gamePDA = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), playerPublicKey.toBuffer(), gameId.toArrayLike(Buffer, 'le', 8)],
    programId,
  )[0];

  return gamePDA;
};

export const buildGameResultPDA = (gameId: BN): PublicKey => {
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
  const gameId = new BN(game.gameId);
  const gameResultPDA = buildGameResultPDA(gameId);

  const transaction = await AppService.getInstance()
    .programWithProvider.methods.settleGame(gameId, result, new BN(amountWon))
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
