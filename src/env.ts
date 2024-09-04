import { config } from 'dotenv';
import { ZodError, z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  REDIS_CONNECTION_STRING: z.string(),
  SOLANA_RPC_HTTPS: z.string(),
  SOLANA_RPC_WSS: z.string(),
  VAULT_PRIVATE_KEY: z.string(),
  PYTH_PROGRAM_ID: z.string(),
  SETTLE_AUTH_KEY: z.string(),
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