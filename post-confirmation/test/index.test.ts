import test from 'node:test';
import assert from 'node:assert/strict';
import type { PostConfirmationConfirmForgotPassword } from 'aws-lambda';
import { handler } from '../src/index.js';

test('sends HENNGE email on password-change confirmation', async (t) => {
  process.env.HENNGE_API_URL = 'https://hennge.example.com/send';
  process.env.HENNGE_API_KEY = 'test-key';

  const calls: unknown[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(init.body as string) });
    return new Response(null, { status: 200 });
  });

  const event = {
    version: '1',
    triggerSource: 'PostConfirmation_ConfirmForgotPassword',
    request: {
      userAttributes: {
        sub: 'abc-123',
        email: 'jane@example.com',
        name: 'Jane Doe',
      },
    },
    response: {},
  } as unknown as PostConfirmationConfirmForgotPassword;

  const result = await handler(event, {} as never, () => {});

  assert.equal(calls.length, 1);
  assert.deepEqual(result, event);
});

test('skips email on non-password-change confirmation', async (t) => {
  const calls: unknown[] = [];
  t.mock.method(globalThis, 'fetch', async () => {
    calls.push(1);
    return new Response(null, { status: 200 });
  });

  const event = {
    version: '1',
    triggerSource: 'PostConfirmation_ConfirmSignUp',
    request: {
      userAttributes: { sub: 'abc-123', email: 'jane@example.com', name: 'Jane Doe' },
    },
    response: {},
  } as unknown as PostConfirmationConfirmForgotPassword;

  await handler(event, {} as never, () => {});

  assert.equal(calls.length, 0);
});
