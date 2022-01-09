import { createServer } from 'http';
import test from 'japa';
import supertest from 'supertest';
import { HEADERS } from '../src/utils';
import { setup, teardown } from './utils';

test.group('Redirect', (group) => {
  group.afterEach(async () => {
    await teardown();
  });

  test('Should set HTTP status code to 303 on PUT', async (assert) => {
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      ctx.response.redirect('/some/other/route');
      assert.equal(ctx.response.getStatus(), 303);
      res.end();
    });

    await supertest(server).put('/').set(HEADERS.INERTIA_HEADER, 'true');
  });

  test('Should set HTTP status code to 303 on PATCH', async (assert) => {
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      ctx.response.redirect('/some/other/route');
      assert.equal(ctx.response.getStatus(), 303);
      res.end();
    });

    await supertest(server).patch('/').set(HEADERS.INERTIA_HEADER, 'true');
  });

  test('Should set HTTP status code to 303 on DELETE', async (assert) => {
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      ctx.response.redirect('/some/other/route');
      assert.equal(ctx.response.getStatus(), 303);
      res.end();
    });

    await supertest(server).delete('/').set(HEADERS.INERTIA_HEADER, 'true');
  });
});
