import test from 'japa';
import InertiaMiddleware from '../middleware/Inertia';
import { fs, setup } from './utils';

test.group('Inertia middleware', (group) => {
  group.afterEach(async () => {
    await fs.cleanup();
  });

  test('register inertia middleware', async (assert) => {
    const app = await setup();

    assert.deepEqual(app.container.use('EidelLev/Inertia/Middleware'), InertiaMiddleware);
  });

  test('Make inertia middleware instance via container', async (assert) => {
    const app = await setup();

    assert.instanceOf(app.container.make(app.container.use('EidelLev/Inertia/Middleware')), InertiaMiddleware);
  });
});
