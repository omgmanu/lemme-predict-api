import { Context } from 'hono';

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
