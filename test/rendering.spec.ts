import test from 'japa';
import supertest from 'supertest';
import { codeBlock } from 'common-tags';
import { createServer } from 'http';
import { Inertia } from '../src/Inertia';
import { HEADERS } from '../src/utils';
import { setup, teardown } from './utils';

test.group('Rendering', (group) => {
  group.afterEach(async () => {
    await teardown();
    Inertia.share({});
  });

  test('Should return HTML', async (assert) => {
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
      const respose = await ctx.inertia.render('Some/Page', props);

      res.write(respose);
      res.end();
    });

    const response = await supertest(server).get('/').expect(200);

    assert.equal(
      response.text,
      codeBlock`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Journeyman</title>
    </head>
    <body><div id="app" data-page="{&quot;component&quot;:&quot;Some/Page&quot;,&quot;props&quot;:{&quot;some&quot;:{&quot;props&quot;:{&quot;for&quot;:[&quot;your&quot;,&quot;page&quot;]}}},&quot;url&quot;:&quot;/&quot;}"></div>
    </body>
    </html>`,
    );
  });

  test('Should render HTML with page-only props', async (assert) => {
    const props = {
      some: {
        props: {
          for: ['your', 'page'],
        },
      },
    };
    const pageOnlyProps = {
      test: 'page only prop',
    };
    const app = await setup();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      const respose = await ctx.inertia.render('Some/Page', props, pageOnlyProps);

      res.write(respose);
      res.end();
    });

    const response = await supertest(server).get('/').expect(200);

    assert.equal(
      response.text,
      codeBlock`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Journeyman</title>
    </head>
    <body>
        page only prop<div id="app" data-page="{&quot;component&quot;:&quot;Some/Page&quot;,&quot;props&quot;:{&quot;some&quot;:{&quot;props&quot;:{&quot;for&quot;:[&quot;your&quot;,&quot;page&quot;]}}},&quot;url&quot;:&quot;/&quot;}"></div>
    </body>
    </html>`,
    );
  });

  test('Should return JSON', async (assert) => {
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
      const response = await ctx.inertia.render('Some/Page', props);

      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });

    const response = await supertest(server).get('/').set(HEADERS.INERTIA_HEADER, 'true').expect(200);
    assert.deepEqual(response.body, {
      component: 'Some/Page',
      props,
      url: '/',
    });
  });

  test('Should preserve Query paramaters', async (assert) => {
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
      const response = await ctx.inertia.render('Some/Page', props);

      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });

    const response = await supertest(server)
      .get('/')
      .query({ search: 'query' })
      .set(HEADERS.INERTIA_HEADER, 'true')
      .expect(200);

    assert.deepEqual(response.body, {
      component: 'Some/Page',
      props,
      url: '/?search=query',
    });
  });
});
