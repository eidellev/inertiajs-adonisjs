import test from 'japa';
import supertest from 'supertest';
import { codeBlock } from 'common-tags';
import { createServer } from 'http';
import { Inertia } from '../src/Inertia';
import { setupSSR, teardown } from './utils';

test.group('SSR', (group) => {
  group.afterEach(async () => {
    await teardown();
    Inertia.share({});
  });

  test('Should return pre-rendered react component HTML', async (assert) => {
    const props = {
      some: {
        props: {
          for: ['your', 'page'],
        },
      },
    };
    const app = await setupSSR();
    const server = createServer(async (req, res) => {
      const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
      const respose = await ctx.inertia.render('SomePage', props);

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
    <body><div id="app" data-page="{&quot;component&quot;:&quot;SomePage&quot;,&quot;props&quot;:{&quot;some&quot;:{&quot;props&quot;:{&quot;for&quot;:[&quot;your&quot;,&quot;page&quot;]}}},&quot;url&quot;:&quot;/&quot;}" data-reactroot=""><h1>Hello react!</h1></div>
    </body>
    </html>`,
    );
  });
});
