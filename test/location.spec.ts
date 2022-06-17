import { createServer } from 'http';
import test from 'japa';
import supertest from 'supertest';
import { HEADERS } from '../src/utils';
import { setup, teardown } from './utils';

test.group('Location', (group) => {
  group.afterEach(async () => {
    await teardown();
  });

  test('Should set HTTP status code to 409 external redirect', async () => {
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      ctx.inertia.location('https://adonisjs.com');

      res.end();
    });

    await supertest(server).put('/').set(HEADERS.INERTIA_HEADER, 'true').expect(409);
  });
});
