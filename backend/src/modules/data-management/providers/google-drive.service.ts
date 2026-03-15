import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { BackupSettings } from '../entities/backup-settings.entity';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);

  constructor(
    @InjectRepository(BackupSettings)
    private readonly settingsRepo: Repository<BackupSettings>,
    private readonly configService: ConfigService,
  ) {}

  private getClientId(): string | undefined {
    return this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID') || undefined;
  }

  private getClientSecret(): string | undefined {
    return this.configService.get<string>('GOOGLE_OAUTH_CLIENT_SECRET') || undefined;
  }

  private async getSettings(): Promise<BackupSettings | null> {
    return this.settingsRepo.findOne({ where: {} });
  }

  private async getClient(): Promise<drive_v3.Drive | null> {
    const settings = await this.getSettings();
    if (!settings?.google_drive_folder_id) {
      return null;
    }

    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    if (!clientId || !clientSecret || !settings.google_oauth_refresh_token) {
      return null;
    }

    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: settings.google_oauth_refresh_token });
    return google.drive({ version: 'v3', auth: oauth2 });
  }

  private async getAuthenticatedClient(): Promise<drive_v3.Drive | null> {
    const settings = await this.getSettings();
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    if (!clientId || !clientSecret || !settings?.google_oauth_refresh_token) {
      return null;
    }
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: settings.google_oauth_refresh_token });
    return google.drive({ version: 'v3', auth: oauth2 });
  }

  private async getFolderId(): Promise<string | null> {
    const settings = await this.getSettings();
    return settings?.google_drive_folder_id || null;
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
  ): Promise<{ fileId: string; webViewLink: string } | null> {
    const client = await this.getClient();
    if (!client) {
      this.logger.warn(
        'Google Drive not configured. Skipping upload.',
      );
      return null;
    }

    const folderId = await this.getFolderId();
    if (!folderId) {
      this.logger.warn(
        'Google Drive folder ID not configured. Skipping upload.',
      );
      return null;
    }

    let fileCreateResponse: { data: { id?: string | null; webViewLink?: string | null } };
    try {
      fileCreateResponse = await client.files.create({
        supportsAllDrives: true,
        requestBody: {
          name: filename,
          parents: [folderId],
          mimeType: 'application/octet-stream',
        },
        media: {
          mimeType: 'application/octet-stream',
          body: Readable.from(buffer),
        },
        fields: 'id, webViewLink',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('storage quota') || msg.toLowerCase().includes('storagequota')) {
        throw new Error(
          'Backup failed: The configured Google Drive folder is in a personal My Drive. ' +
            'Service accounts require a Shared Drive (Team Drive) folder. ' +
            'Please update backup settings with a folder ID that is inside a Shared Drive.',
        );
      }
      throw err;
    }

    const fileId = fileCreateResponse.data.id || '';
    const webViewLink = fileCreateResponse.data.webViewLink || '';

    this.logger.log(
      `Uploaded file "${filename}" to Google Drive (ID: ${fileId})`,
    );

    return { fileId, webViewLink };
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    const client = await this.getClient();
    if (!client) {
      throw new Error('Google Drive is not configured');
    }

    const response = await client.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' },
    );

    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      (response.data as NodeJS.ReadableStream)
        .on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', (err) => reject(err));
    });
  }

  async listFiles(): Promise<
    Array<{ id: string; name: string; size: string; createdTime: string }>
  > {
    const client = await this.getClient();
    if (!client) {
      return [];
    }

    const folderId = await this.getFolderId();
    if (!folderId) {
      return [];
    }

    const response = await client.files.list({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      q: `'${folderId}' in parents and trashed = false and name contains '.ccbak'`,
      fields: 'files(id, name, size, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    });

    return (response.data.files || []).map((file) => ({
      id: file.id || '',
      name: file.name || '',
      size: file.size || '0',
      createdTime: file.createdTime || '',
    }));
  }

  async deleteFile(fileId: string): Promise<void> {
    const client = await this.getClient();
    if (!client) {
      this.logger.warn(
        'Google Drive not configured. Cannot delete file.',
      );
      return;
    }

    try {
      await client.files.delete({ fileId, supportsAllDrives: true });
      this.logger.log(`Deleted file from Google Drive (ID: ${fileId})`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file from Google Drive (ID: ${fileId})`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async listFolders(): Promise<Array<{ id: string; name: string }>> {
    const client = await this.getAuthenticatedClient();
    if (!client) {
      return [];
    }

    try {
      const response = await client.files.list({
        q: "mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false",
        fields: 'files(id, name)',
        orderBy: 'name',
        pageSize: 100,
      });
      return (response.data.files || []).map((f) => ({
        id: f.id || '',
        name: f.name || '',
      }));
    } catch (error) {
      this.logger.error(
        'Failed to list Google Drive folders',
        error instanceof Error ? error.stack : String(error),
      );
      return [];
    }
  }

  // Short-lived state store for CSRF protection: state → expiry timestamp (ms)
  private readonly pendingOAuthStates = new Map<string, number>();
  private readonly STATE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  async getOAuthAuthorizationUrl(callbackUrl: string): Promise<string | null> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    if (!clientId || !clientSecret) {
      return null;
    }
    const state = crypto.randomUUID();
    this.pendingOAuthStates.set(state, Date.now() + this.STATE_TTL_MS);
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
    return oauth2.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
      prompt: 'consent select_account',
      state,
    });
  }

  validateOAuthState(state: string): boolean {
    const expiry = this.pendingOAuthStates.get(state);
    this.pendingOAuthStates.delete(state);
    return expiry !== undefined && Date.now() < expiry;
  }

  async exchangeOAuthCode(code: string, callbackUrl: string): Promise<string> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth2 Client ID and Secret are not configured. Set them via dashboard or environment variables.');
    }
    const settings = await this.getSettings();
    if (!settings) {
      throw new Error('Backup settings not found.');
    }
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error(
        'No refresh token returned. Ensure "prompt: consent" is set and the app is not already authorized. ' +
        'Revoke access at https://myaccount.google.com/permissions and try again.',
      );
    }
    await this.settingsRepo.update(settings.id, { google_oauth_refresh_token: tokens.refresh_token });
    this.logger.log('Google OAuth2 refresh token saved successfully.');
    return tokens.refresh_token;
  }

  async checkConnection(): Promise<{
    connected: boolean;
    email: string;
    folder_id: string;
    error?: string;
  }> {
    const settings = await this.getSettings();
    const folderId = settings?.google_drive_folder_id || '';

    try {
      const client = await this.getClient();
      if (!client) {
        return { connected: false, email: '', folder_id: folderId };
      }

      // Resolve the authenticated identity's email
      let email = '';
      try {
        const about = await client.about.get({ fields: 'user' });
        email = about.data.user?.emailAddress || 'OAuth2 User';
      } catch {
        email = 'OAuth2 User';
      }

      // Verify the folder exists
      await client.files.get({
        fileId: folderId,
        fields: 'id',
        supportsAllDrives: true,
      });

      return { connected: true, email, folder_id: folderId };
    } catch (error) {
      this.logger.error(
        'Google Drive connection check failed',
        error instanceof Error ? error.stack : String(error),
      );
      return { connected: false, email: '', folder_id: folderId };
    }
  }
}
