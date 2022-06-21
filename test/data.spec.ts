import test from 'japa';
import supertest from 'supertest';
import { createServer } from 'http';
import { Inertia } from '../src/Inertia';
import { HEADERS } from '../src/utils';
import { setup, teardown } from './utils';

test.group('Data', (group) => {
  group.afterEach(async () => {
    await teardown();
    // @ts-ignore
    Inertia.sharedData = {};
  });

  test('Should return shared data', async (assert) => {
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
      Inertia.share({
        shared: 'data',
      });
      const response = await ctx.inertia.render('Some/Page', props);

      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });

    const response = await supertest(server).get('/').set(HEADERS.INERTIA_HEADER, 'true').expect(200);
    assert.deepEqual(response.body, {
      component: 'Some/Page',
      props: { ...props, shared: 'data' },
      url: '/',
    });
  });

  test('Should combine shared data(multiple calls)', async (assert) => {
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
      Inertia.share({
        shared: 'data',
      }).share({ additional: 'shared data' });
      const response = await ctx.inertia.render('Some/Page', props);

      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });

    const response = await supertest(server).get('/').set(HEADERS.INERTIA_HEADER, 'true').expect(200);
    assert.deepEqual(response.body, {
      component: 'Some/Page',
      props: { ...props, shared: 'data', additional: 'shared data' },
      url: '/',
    });
  });

  test('Should resolve lazy props', async (assert) => {
    const props = {
      some() {
        return {
          props: {
            for: ['your', 'page'],
          },
        };
      },
      another: 'prop',
    };
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      const response = await ctx.inertia.render('Some/Page', props);

      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });

    const response = await supertest(server).get('/').set(HEADERS.INERTIA_HEADER, 'true').expect(200);

    assert.deepEqual(response.body, {
      component: 'Some/Page',
      props: {
        some: {
          props: {
            for: ['your', 'page'],
          },
        },
        another: 'prop',
      },
      url: '/',
    });
  });

  test('Should return partial data', async (assert) => {
    const props = {
      some() {
        return {
          props: {
            for: ['your', 'page'],
          },
        };
      },
      another: 'prop',
      partial: 1234,
    };
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      const response = await ctx.inertia.render('Some/Page', props);

      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });

    const response = await supertest(server)
      .get('/')
      .set(HEADERS.INERTIA_HEADER, 'true')
      .set(HEADERS.INERTIA_PARTIAL_DATA, 'partial,another')
      .set(HEADERS.INERTIA_PARTIAL_DATA_COMPONENT, 'Some/Page')
      .expect(200);

    assert.deepEqual(response.body, {
      component: 'Some/Page',
      props: {
        another: 'prop',
        partial: 1234,
      },
      url: '/',
    });
  });

  test('Should return full data', async (assert) => {
    const props = {
      some() {
        return {
          props: {
            for: ['your', 'page'],
          },
        };
      },
      another: 'prop',
      partial: 1234,
    };
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      const response = await ctx.inertia.render('Some/Page', props);

      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });

    const response = await supertest(server)
      .get('/')
      .set(HEADERS.INERTIA_HEADER, 'true')
      .set(HEADERS.INERTIA_PARTIAL_DATA, 'partial,another')
      .set(HEADERS.INERTIA_PARTIAL_DATA_COMPONENT, 'Some/Other/Page')
      .expect(200);

    assert.deepEqual(response.body, {
      component: 'Some/Page',
      props: {
        another: 'prop',
        partial: 1234,
        some: {
          props: {
            for: ['your', 'page'],
          },
        },
      },
      url: '/',
    });
  });
});
