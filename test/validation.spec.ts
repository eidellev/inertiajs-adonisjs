import test from 'japa';
import { HEADERS } from '../src/utils';
import { setup, teardown } from './utils';

test.group('Validation negotiator', (group) => {
  group.afterEach(async () => {
    await teardown();
  });

  test('Should use vanilla validator for Inertia requests', async (assert) => {
    const app = await setup();
    const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
    const { schema } = app.container.use('Adonis/Core/Validator');

    ctx.request.request.headers.accept = 'application/json';
    ctx.request.request.headers[HEADERS.INERTIA_HEADER] = 'true';

    class Validator {
      public schema = schema.create({
        username: schema.string(),
      });
    }

    try {
      ctx.request.headers();
      await ctx.request.validate(Validator);
    } catch (error) {
      assert.deepEqual(error.messages, {
        errors: [
          {
            field: 'username',
            message: 'required validation failed',
            rule: 'required',
          },
        ],
      });
    }
  });
  test('Should use vanilla validator for HTML requests', async (assert) => {
    const app = await setup();
    const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
    const { schema } = app.container.use('Adonis/Core/Validator');

    ctx.request.request.headers.accept = 'text/html';

    class Validator {
      public schema = schema.create({
        username: schema.string(),
      });
    }

    try {
      ctx.request.headers();
      await ctx.request.validate(Validator);
    } catch (error) {
      assert.deepEqual(error.messages, {
        username: ['required validation failed'],
      });
    }
  });

  test('Should use JSON API validator for JSON API requests', async (assert) => {
    const app = await setup();
    const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
    const { schema } = app.container.use('Adonis/Core/Validator');

    ctx.request.request.headers.accept = 'application/vnd.api+json';

    class Validator {
      public schema = schema.create({
        username: schema.string(),
      });
    }

    try {
      ctx.request.headers();
      await ctx.request.validate(Validator);
    } catch (error) {
      assert.deepEqual(error.messages, {
        errors: [
          {
            code: 'required',
            source: {
              pointer: 'username',
            },
            title: 'required validation failed',
          },
        ],
      });
    }
  });

  test('Should use Ajax validator for API requests', async (assert) => {
    const app = await setup();
    const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
    const { schema } = app.container.use('Adonis/Core/Validator');

    ctx.request.request.headers.accept = 'application/json';

    class Validator {
      public schema = schema.create({
        username: schema.string(),
      });
    }

    try {
      ctx.request.headers();
      await ctx.request.validate(Validator);
    } catch (error) {
      assert.deepEqual(error.messages, {
        errors: [
          {
            rule: 'required',
            message: 'required validation failed',
            field: 'username',
          },
        ],
      });
    }
  });

  test('Should use Ajax validator for API requests made from client', async (assert) => {
    const app = await setup();
    const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
    const { schema } = app.container.use('Adonis/Core/Validator');

    ctx.request.request.headers['x-requested-with'] = 'xmlhttprequest';

    class Validator {
      public schema = schema.create({
        username: schema.string(),
      });
    }

    try {
      ctx.request.headers();
      await ctx.request.validate(Validator);
    } catch (error) {
      assert.deepEqual(error.messages, {
        errors: [
          {
            rule: 'required',
            message: 'required validation failed',
            field: 'username',
          },
        ],
      });
    }
  });
});
