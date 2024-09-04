import { Connection, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Redis } from 'ioredis';
import LoggerService from './logger.service.js';
import env from '../env.js';
import idl from '../idl/game.json' assert { type: 'json' };;
import type { Game } from '../idl/game';
import { persistGame } from '../utils/db.js';

const gameVaultKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(env['VAULT_PRIVATE_KEY'])));

class AppService {
  private readonly _redisClient: Redis;
  private readonly _rpcConnection: Connection;
  private readonly _logger: typeof LoggerService;
  private readonly _program: anchor.Program<Game>;
  private readonly _programWithProvider: anchor.Program<Game>;
  private static _instance: AppService;

  private constructor() {
    const connection = new Connection(env['SOLANA_RPC_HTTPS'], {
      wsEndpoint: env['SOLANA_RPC_WSS'],
    });
    const program = new anchor.Program<Game>(idl as Game, { connection });

    const wallet = new anchor.Wallet(gameVaultKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    const programWithProvider = new anchor.Program<Game>(idl as Game, provider);

    const redisClient = new Redis(env.REDIS_CONNECTION_STRING);

    this._redisClient = redisClient;
    this._rpcConnection = connection;
    this._logger = LoggerService;
    this._program = program;
    this._programWithProvider = programWithProvider;

    this.initWatcher();
  }

  static getInstance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new AppService();
    return this._instance;
  }

  public get redisClient() {
    return this._redisClient;
  }

  public get rpcConnection() {
    return this._rpcConnection;
  }

  public get logger() {
    return this._logger;
  }

  public get program() {
    return this._program;
  }

  public get programWithProvider() {
    return this._programWithProvider;
  }

  async initWatcher() {
    this._rpcConnection.onProgramAccountChange(
      this._program.programId,
      async (updatedAccountInfo, context) => {
        let decodedGameData = null;
        try {
          decodedGameData = this._program.coder.accounts.decode('game', updatedAccountInfo.accountInfo.data);
        } catch (e) {
          console.log('Error decoding game data:', e);
        }

        if (decodedGameData) {
          // Get the transaction signature
          const signature = context.slot
            ? await this._rpcConnection.getSignaturesForAddress(
                updatedAccountInfo.accountInfo.owner,
                { limit: 1 },
                'confirmed',
              )
            : null;
          const transactionId = signature && signature.length > 0 ? signature[0].signature : null;

          persistGame(decodedGameData, transactionId);
        }
      },
      {
        commitment: 'confirmed',
        encoding: 'base64',
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: this._program.coder.accounts.memcmp('game').bytes,
            },
          },
        ],
      },
    );
  }
}

export default AppService;
