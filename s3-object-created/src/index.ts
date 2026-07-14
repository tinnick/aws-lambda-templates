import type { S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { google, drive_v3 } from 'googleapis';

// Env vars (provisioned outside this repo):
//   GOOGLE_SA_SECRET_ID  — Secrets Manager secret id holding the full service-account JSON key
//   DRIVE_FOLDER_ID_PARAM — SSM Parameter Store name holding the target Drive folder id

const s3 = new S3Client({});
const secretsManager = new SecretsManagerClient({});
const ssm = new SSMClient({});

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

let driveClientPromise: Promise<{ drive: drive_v3.Drive; folderId: string }> | undefined;

function getDriveClient(): Promise<{ drive: drive_v3.Drive; folderId: string }> {
  if (!driveClientPromise) {
    driveClientPromise = (async () => {
      const [secret, parameter] = await Promise.all([
        secretsManager.send(
          new GetSecretValueCommand({ SecretId: process.env.GOOGLE_SA_SECRET_ID })
        ),
        ssm.send(new GetParameterCommand({ Name: process.env.DRIVE_FOLDER_ID_PARAM })),
      ]);

      const key = JSON.parse(secret.SecretString ?? '{}') as ServiceAccountKey;
      const folderId = parameter.Parameter?.Value;
      if (!folderId) {
        throw new Error('DRIVE_FOLDER_ID_PARAM parameter has no value');
      }

      const auth = new google.auth.JWT({
        email: key.client_email,
        key: key.private_key,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      return { drive: google.drive({ version: 'v3', auth }), folderId };
    })();
  }
  return driveClientPromise;
}

export const handler: S3Handler = async (event) => {
  const { drive, folderId } = await getDriveClient();

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

    await drive.files.create({
      requestBody: {
        name: key,
        parents: [folderId],
      },
      media: {
        body: object.Body as NodeJS.ReadableStream,
      },
    });
  }
};
