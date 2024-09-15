import { Keypair } from '@solana/web3.js';
import slip10 from 'micro-key-producer/slip10.js';
import * as bip39 from 'bip39';
import env from '../env.js';

export const generateWallet = (index: number) => {
  const seed = bip39.mnemonicToSeedSync(env.MASTER_MNEMONIC, ''); // (mnemonic, password)
  const hd = slip10.fromMasterSeed(seed.toString('hex'));
  const path = `m/44'/501'/${index}'/0'`;
  const keypair = Keypair.fromSeed(hd.derive(path).privateKey);

  return keypair.publicKey.toBase58();
};

const buildPrivateKey = (index: number) => {
  const seed = bip39.mnemonicToSeedSync(env.MASTER_MNEMONIC, '');
  const hd = slip10.fromMasterSeed(seed.toString('hex'));
  const path = `m/44'/501'/${index}'/0'`;
  const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
  const privateKeyBuffer = Buffer.from(keypair.secretKey);
  const privateKey = privateKeyBuffer.toString('base64');

  return { privateKey, privateKeyBuffer };
};

export const getPrivateKey = (index: number) => {
  return buildPrivateKey(index).privateKey;
};

export const getPrivateKeyBuffer = (index: number) => {
  return buildPrivateKey(index).privateKeyBuffer;
};
