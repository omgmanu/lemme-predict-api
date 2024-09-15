import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { sessionMiddleware, CookieStore } from 'hono-sessions';
import AppService from './services/app.service.js';
import gameRouter from './routes/game.js';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import env from './env.js';
import { cors } from 'hono/cors';
const app = new Hono();

app.use(
  '/*',
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

const store = new CookieStore();

app.use(
  sessionMiddleware({
    store,
    encryptionKey: env.SESSION_ENCRYPTION_KEY, // Required for CookieStore
    expireAfterSeconds: env.SESSION_EXPIRE_AFTER_SECONDS, // Expire session after X seconds of inactivity
    cookieOptions: {
      sameSite: 'lax', // Recommended for basic CSRF protection in modern browsers
      path: '/', // Required for this library to work properly
      httpOnly: true, // Recommended to avoid XSS attacks
    },
  }),
);

app.route('/api/v1', gameRouter);
app.route('/api/v1', authRouter);
app.route('/api/v1', profileRouter);

const port = env.PORT;
console.log(`Server is running on port ${port}`);

// init
AppService.getInstance();

serve({
  fetch: app.fetch,
  port,
});
