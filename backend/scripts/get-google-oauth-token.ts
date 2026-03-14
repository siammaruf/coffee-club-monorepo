/**
 * One-time script to generate a Google OAuth2 refresh token for personal Drive access.
 *
 * Prerequisites:
 *   1. Create OAuth 2.0 Client ID credentials in Google Cloud Console
 *      (project: coffee-club-489916 → APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID)
 *      Application type: Desktop app
 *      Add redirect URI: http://localhost:3001/callback
 *   2. Download the JSON and save it as: backend/scripts/oauth-client.json
 *
 * Usage:
 *   cd backend && npx ts-node --project tsconfig.json scripts/get-google-oauth-token.ts
 *
 * The refresh token will be printed — save it for use in backup settings.
 */

import { google } from 'googleapis';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';

const OAUTH_CLIENT_PATH = path.resolve(__dirname, 'oauth-client.json');
const REDIRECT_URI = 'http://localhost:3001/callback';
const SCOPES = ['https://www.googleapis.com/auth/drive'];

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const clientCreds = require(OAUTH_CLIENT_PATH) as {
    installed?: { client_id: string; client_secret: string };
    web?: { client_id: string; client_secret: string };
  };

  const creds = clientCreds.installed || clientCreds.web;
  if (!creds) {
    throw new Error('Invalid oauth-client.json — expected "installed" or "web" key.');
  }

  const oauth2 = new google.auth.OAuth2(creds.client_id, creds.client_secret, REDIRECT_URI);

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\nOpen this URL in your browser to authorize access:\n');
  console.log(authUrl);
  console.log('\nWaiting for authorization on http://localhost:3001/callback ...\n');

  // Start local server to capture the auth code
  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url || '', true);
      const authCode = parsed.query.code as string | undefined;
      if (authCode) {
        res.end('<h2>Authorization successful! You can close this tab.</h2>');
        server.close();
        resolve(authCode);
      } else {
        res.end('<h2>No code received. Please try again.</h2>');
        server.close();
        reject(new Error('No authorization code in callback'));
      }
    });
    server.listen(3001, () => {}).on('error', reject);
  });

  const { tokens } = await oauth2.getToken(code);

  console.log('Authorization successful!\n');
  console.log('=== Save these values in backup settings ===\n');
  console.log('google_oauth_client_id:', creds.client_id);
  console.log('google_oauth_client_secret:', creds.client_secret);
  console.log('google_oauth_refresh_token:', tokens.refresh_token);
  console.log('\n============================================');
  console.log('\nStore these via: PUT /api/v1/data-management/backup/settings');
}

main().catch((err: Error) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
