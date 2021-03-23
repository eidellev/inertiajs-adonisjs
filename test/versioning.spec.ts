import test from 'japa';
import supertest from 'supertest';
import { Inertia } from '../src/Inertia';
import { HEADERS } from '../src/utils';
import { createServer } from 'http';
import { setup, teardown } from './utils';

test.group('Asset versioning', (group) => {
  group.afterEach(async () => {
    await teardown();
  });

  test('Should return 409 CONFLICT', async () => {
    const props = {
      some: {
        props: {
          for: ['your', 'page'],
        },
      },
    };
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      Inertia.version('new');

      await ctx.inertia.render('Some/Page', props);
      res.end();
    });

    await supertest(server)
      .get('/')
      .set(HEADERS.INERTIA_HEADER, 'true')
      .set(HEADERS.INERTIA_VERSION, 'old')
      .expect(409);
  });

  test('Should lazily evaluate version', async () => {
    const props = {
      some: {
        props: {
          for: ['your', 'page'],
        },
      },
    };
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      Inertia.version(() => 'new');

      await ctx.inertia.render('Some/Page', props);
      res.end();
    });

    await supertest(server)
      .get('/')
      .set(HEADERS.INERTIA_HEADER, 'true')
      .set(HEADERS.INERTIA_VERSION, 'old')
      .expect(409);
  });
});
