import { Filesystem } from '@poppinss/dev-utils';
import { join } from 'path';
import { codeBlock } from 'common-tags';
import { Application } from '@adonisjs/core/build/standalone';

export const fs = new Filesystem(join(__dirname, 'app'));

export async function setup() {
  await fs.add('.env', '');

  await fs.add(
    'config/app.ts',
    codeBlock`export const appKey = '${Math.random().toFixed(36).substring(2, 38)}',
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }`,
  );

  await fs.add(
    'config/inertia.ts',
    codeBlock`import { InertiaConfig } from '@ioc:EidelLev/Inertia';

    export const inertia: InertiaConfig = {
      view: 'app',
    };`,
  );

  await fs.add(
    'config/session.ts',
    codeBlock`import Env from '@ioc:Adonis/Core/Env';
    import { SessionConfig } from '@ioc:Adonis/Addons/Session';

    const sessionConfig: SessionConfig = {
      driver: 'cookie',
      cookieName: 'test',
      age: '2h',
      cookie: {
        path: '/',
        httpOnly: true,
        sameSite: false,
      },
    }

    export default sessionConfig;`,
  );

  await fs.add(
    'resources/views/app.edge',
    codeBlock`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Journeyman</title>
    </head>
    <body>
      @if(test)
        {{ test }}
      @endif
      @inertia()
    </body>
    </html>
  `,
  );

  const app = new Application(fs.basePath, 'web', {
    providers: ['@adonisjs/core', '@adonisjs/view', '@adonisjs/session', '../../providers/InertiaProvider'],
  });

  await app.setup();
  await app.registerProviders();
  await app.bootProviders();

  return app;
}

export async function teardown() {
  await fs.cleanup();
}
