import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import AppService from './services/app.service.js';
import router from './routes/index.js';

const app = new Hono();

app.route('/api/v1', router); 


const port = 3000;
console.log(`Server is running on port ${port}`);

// init purpose
AppService.getInstance();

serve({
  fetch: app.fetch,
  port,
});
