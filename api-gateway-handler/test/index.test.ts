import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { handler } from '../src/index.js';

test('GET returns 200 ok', async () => {
  const event = {
    version: '2.0',
    requestContext: { http: { method: 'GET' } },
  } as unknown as APIGatewayProxyEventV2;

  const result = (await handler(
    event,
    {} as never,
    () => {}
  )) as APIGatewayProxyStructuredResultV2;

  assert.equal(result?.statusCode, 200);
});

test('unhandled method returns 404', async () => {
  const event = {
    version: '2.0',
    requestContext: { http: { method: 'POST' } },
  } as unknown as APIGatewayProxyEventV2;

  const result = (await handler(
    event,
    {} as never,
    () => {}
  )) as APIGatewayProxyStructuredResultV2;

  assert.equal(result?.statusCode, 404);
});
