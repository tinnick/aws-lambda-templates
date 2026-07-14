import test from 'node:test';
import assert from 'node:assert/strict';
import type { S3Event } from 'aws-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { SSMClient } from '@aws-sdk/client-ssm';
import { google } from 'googleapis';
import { handler } from '../src/index.js';

test('copies each S3 record to Google Drive', async (t) => {
  process.env.GOOGLE_SA_SECRET_ID = 'test-secret-id';
  process.env.DRIVE_FOLDER_ID_PARAM = 'test-param-name';

  const s3Calls: unknown[] = [];
  t.mock.method(S3Client.prototype, 'send', async (command: unknown) => {
    s3Calls.push(command);
    return { Body: 'fake-stream' };
  });

  t.mock.method(SecretsManagerClient.prototype, 'send', async () => ({
    SecretString: JSON.stringify({ client_email: 'sa@example.com', private_key: 'fake-key' }),
  }));

  t.mock.method(SSMClient.prototype, 'send', async () => ({
    Parameter: { Value: 'test-folder-id' },
  }));

  const driveCalls: Array<{ requestBody?: { name?: string; parents?: string[] } }> = [];
  const googleMutable = google as unknown as { drive: unknown };
  const originalDrive = googleMutable.drive;
  googleMutable.drive = () => ({
    files: {
      create: async (params: { requestBody?: { name?: string; parents?: string[] } }) => {
        driveCalls.push(params);
        return {};
      },
    },
  });
  t.after(() => {
    googleMutable.drive = originalDrive;
  });

  const event = {
    Records: [
      {
        s3: {
          bucket: { name: 'my-bucket' },
          object: { key: 'path/to/file.txt' },
        },
      },
    ],
  } as unknown as S3Event;

  await handler(event, {} as never, () => {});

  assert.equal(s3Calls.length, 1);
  assert.equal(driveCalls.length, 1);
  assert.deepEqual(driveCalls[0].requestBody, {
    name: 'path/to/file.txt',
    parents: ['test-folder-id'],
  });
});
