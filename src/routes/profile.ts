import { Hono } from 'hono';
import { getFromSession, setToSession } from '../services/auth.service.js';
import { getUser } from '../utils/db.js';
import { getPrivateKey } from '../services/wallet.service.js';

const router = new Hono();

router.use('/profile/*', async (c, next) => {
  const userId = getFromSession(c, 'user-id');

  if (!userId) {
    return c.json(
      {
        error: 'User not logged in',
      },
      401,
    );
  }
  return next();
});

router.get('/profile/me', async (c) => {
  const userId = getFromSession(c, 'user-id');
  const user = await getUser(userId);

  return c.json({
    user,
  });
});

router.get('/profile/private-key', async (c) => {
  const userId = getFromSession(c, 'user-id');
  const user = await getUser(userId);

  if (!user) {
    return c.json(
      {
        error: 'User not found',
      },
      404,
    );
  }

  const privateKey = getPrivateKey(user.walletId);

  return c.json({
    privateKey,
  });
});

router.get('/profile/logout', async (c) => {
  setToSession(c, 'user-id', null);

  return c.json({
    success: true,
  });
});

export default router;
