import { XUser } from "@hono/oauth-providers/x";

export type User = Partial<XUser> & {
  publicKey: string;
  walletId: number;
};