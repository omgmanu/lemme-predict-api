import { Hono } from 'hono';
import { getFromSession, setToSession } from 'src/services/auth.service.js';
import { getUser } from 'src/utils/db.js';

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

  // get user from DB
  const user = await getUser(userId);

  return c.json({
    user,
  });
});

router.get('/profile/logout', async (c) => {
  setToSession(c, 'user-id', null);

  return c.json({
    success: true,
  });
});

export default router;
