import test from 'node:test';
import assert from 'node:assert/strict';
import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda';
import { handler } from '../src/index.js';

test('adds phone_number, name, email to id and access token claims', async () => {
  const event = {
    version: '2',
    triggerSource: 'TokenGeneration_Authentication',
    request: {
      userAttributes: {
        sub: 'abc-123',
        phone_number: '+15555550123',
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
    },
    response: {},
  } as unknown as PreTokenGenerationV2TriggerEvent;

  const result = await handler(event, {} as never, () => {});
  const expected = {
    phone_number: '+15555550123',
    name: 'Jane Doe',
    email: 'jane@example.com',
  };

  assert.deepEqual(
    result!.response.claimsAndScopeOverrideDetails!.idTokenGeneration!.claimsToAddOrOverride,
    expected
  );
  assert.deepEqual(
    result!.response.claimsAndScopeOverrideDetails!.accessTokenGeneration!.claimsToAddOrOverride,
    expected
  );
});
