import { XUser } from '@hono/oauth-providers/x';
import { Context } from 'hono';
import { getUser, getUsersCount, persistUser } from '../utils/db';
import { generateWallet } from './wallet.service';

export const getFromSession = (c: Context, key: string): string => {
  // @ts-ignore
  const session: any = c.get('session');
  return session.get(key);
};

export const setToSession = (c: Context, key: string, value: any): void => {
  // @ts-ignore
  const session: any = c.get('session');
  session.set(key, value);
};

export const onAfterLogin = async (c: Context, user: XUser) => {
  const existingUser = await getUser(user.id);

  if (!existingUser) {
    const usersCount = await getUsersCount();
    const walletId = usersCount + 1;
    const publicKey = generateWallet(walletId);

    persistUser({ ...user, publicKey, walletId }, walletId);
  }

  setToSession(c, 'user-id', user.id);
};
