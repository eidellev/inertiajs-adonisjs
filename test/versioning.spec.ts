import test from 'japa';
import supertest from 'supertest';
import { createServer } from 'http';
import { setup, teardown } from './utils';

test.group('Asset versioning', (group) => {
  group.afterEach(async () => {
    await teardown();
  });

  test('should ');
});
