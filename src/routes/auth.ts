import { Hono } from 'hono';
import env from '../env.js';
import { xAuth } from '@hono/oauth-providers/x';
import { setToSession } from 'src/services/auth.service.js';
import { persistUser } from 'src/utils/db.js';

const router = new Hono();

router.use(
  '/auth/x',
  xAuth({
    client_id: env.TWITTER_CLIENT_ID,
    client_secret: env.TWITTER_CLIENT_SECRET,
    scope: ['users.read', 'tweet.read'],
    fields: ['profile_image_url', 'username'],
    redirect_uri: `${env.TWITTER_CALLBACK_URL_BASE}/api/v1/auth/x`,
  }),
);

router.get('/auth/x', (c) => {
  const token = c.get('token');
  const refreshToken = c.get('refresh-token');
  const grantedScopes = c.get('granted-scopes');
  const user = c.get('user-x');

  if (user && user.id) {
    persistUser(user.id, user);
    setToSession(c, 'user-id', user.id);
  } else {
    return c.json(
      {
        error: 'Cannot login with Twitter',
      },
      401,
    );
  }

  return c.redirect(env.TWITTER_REDIRECT_AFTER_LOGIN);
});

export default router;
