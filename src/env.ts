import { config } from 'dotenv';
import { ZodError, z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().transform((v) => parseInt(v)),
  REDIS_CONNECTION_STRING: z.string(),
  SOLANA_RPC_HTTPS: z.string(),
  SOLANA_RPC_WSS: z.string(),
  VAULT_PRIVATE_KEY: z.string(),
  PYTH_PROGRAM_ID: z.string(),
  SETTLE_AUTH_KEY: z.string(),
  TWITTER_CLIENT_ID: z.string(),
  TWITTER_CLIENT_SECRET: z.string(),
  TWITTER_CALLBACK_URL_BASE: z.string(),
  SESSION_ENCRYPTION_KEY: z.string(),
  SESSION_EXPIRE_AFTER_SECONDS: z.string().transform((v) => parseInt(v)),
  TWITTER_REDIRECT_AFTER_LOGIN: z.string(),
  FRONTEND_URL: z.string(),
  MASTER_MNEMONIC: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

config();

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = 'Missing required values in .env:\n';
    error.issues.forEach((issue) => {
      message += issue.path[0] + '\n';
    });
    const e = new Error(message);
    e.stack = '';
    throw e;
  } else {
    console.error(error);
  }
}

export default EnvSchema.parse(process.env);