/**
 * Verify Google Drive connection and upload a test file.
 *
 * Usage:
 *   # Test with OAuth2 (personal My Drive) — requires oauth-tokens.json
 *   cd backend && npx ts-node --project tsconfig.json scripts/test-google-drive.ts --oauth
 *
 *   # Test with service account (Shared Drive only)
 *   cd backend && npx ts-node --project tsconfig.json scripts/test-google-drive.ts
 *
 * oauth-tokens.json format:
 *   { "client_id": "...", "client_secret": "...", "refresh_token": "..." }
 */

import { google } from 'googleapis';
import { Readable } from 'stream';
import * as path from 'path';

const FOLDER_ID = '1InbZXYig5zR4XzwAHQMsb1jeKYfYElTz';
const CREDS_PATH = path.resolve(__dirname, '../../coffee-club-489916-f40f3f424e58.json');
const OAUTH_TOKENS_PATH = path.resolve(__dirname, 'oauth-tokens.json');

const useOAuth = process.argv.includes('--oauth');

async function main() {
  console.log('Auth mode:', useOAuth ? 'OAuth2 (personal Drive)' : 'Service account (Shared Drive)');
  console.log('Target folder ID:', FOLDER_ID);
  console.log('');

  let drive: ReturnType<typeof google.drive>;

  if (useOAuth) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tokens = require(OAUTH_TOKENS_PATH) as {
      client_id: string;
      client_secret: string;
      refresh_token: string;
    };
    const oauth2 = new google.auth.OAuth2(tokens.client_id, tokens.client_secret);
    oauth2.setCredentials({ refresh_token: tokens.refresh_token });
    drive = google.drive({ version: 'v3', auth: oauth2 });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const creds = require(CREDS_PATH) as { client_email: string; private_key: string };
    console.log('Service account:', creds.client_email);
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    drive = google.drive({ version: 'v3', auth });
  }

  // Verify folder exists
  console.log('Checking folder...');
  const folderMeta = await drive.files.get({
    fileId: FOLDER_ID,
    fields: 'id, name, driveId',
    supportsAllDrives: true,
  });

  if (!useOAuth && !folderMeta.data.driveId) {
    throw new Error(
      'Folder is in personal My Drive. Service accounts require Shared Drive. ' +
        'Run with --oauth flag and OAuth2 credentials to use personal Drive.',
    );
  }

  console.log('✓ Folder verified:', folderMeta.data.name || FOLDER_ID);
  if (folderMeta.data.driveId) {
    console.log('  Shared Drive ID:', folderMeta.data.driveId);
  } else {
    console.log('  Location: personal My Drive');
  }
  console.log('');

  // Upload test file
  const filename = `test-upload-${Date.now()}.txt`;
  const content = `CoffeeClub Google Drive connectivity test\nTimestamp: ${new Date().toISOString()}\nAuth: ${useOAuth ? 'OAuth2' : 'Service Account'}`;
  const buffer = Buffer.from(content);

  console.log('Uploading test file:', filename);
  const result = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: filename,
      parents: [FOLDER_ID],
      mimeType: 'text/plain',
    },
    media: {
      mimeType: 'text/plain',
      body: Readable.from(buffer),
    },
    fields: 'id, webViewLink',
  });

  console.log('✓ File uploaded successfully');
  console.log('  File ID:', result.data.id);
  console.log('  View link:', result.data.webViewLink);
}

main().catch((err: Error) => {
  console.error('✗ Failed:', err.message);
  process.exit(1);
});
