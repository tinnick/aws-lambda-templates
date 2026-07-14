import test from 'node:test';
import assert from 'node:assert/strict';
import type { PostAuthenticationTriggerEvent } from 'aws-lambda';
import { handler } from '../src/index.js';

test('sends HENNGE email on login', async (t) => {
  process.env.HENNGE_API_URL = 'https://hennge.example.com/send';
  process.env.HENNGE_API_KEY = 'test-key';

  const calls: unknown[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(init.body as string) });
    return new Response(null, { status: 200 });
  });

  const event = {
    version: '1',
    triggerSource: 'PostAuthentication_Authentication',
    request: {
      userAttributes: {
        sub: 'abc-123',
        email: 'jane@example.com',
        name: 'Jane Doe',
      },
      newDeviceUsed: false,
    },
    response: {},
  } as unknown as PostAuthenticationTriggerEvent;

  const result = await handler(event, {} as never, () => {});

  assert.equal(calls.length, 1);
  assert.deepEqual(result, event);
});
