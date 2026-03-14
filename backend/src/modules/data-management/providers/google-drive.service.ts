import { Injectable, Logger } from '@nestjs/common';
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
  ) {}

  private async getSettings(): Promise<BackupSettings | null> {
    return this.settingsRepo.findOne({ where: {} });
  }

  private async getClient(): Promise<drive_v3.Drive | null> {
    const settings = await this.getSettings();
    if (!settings?.google_drive_folder_id) {
      return null;
    }

    // OAuth2 (personal My Drive) takes priority over service account
    if (
      settings.google_oauth_client_id &&
      settings.google_oauth_client_secret &&
      settings.google_oauth_refresh_token
    ) {
      const oauth2 = new google.auth.OAuth2(
        settings.google_oauth_client_id,
        settings.google_oauth_client_secret,
      );
      oauth2.setCredentials({ refresh_token: settings.google_oauth_refresh_token });
      return google.drive({ version: 'v3', auth: oauth2 });
    }

    // Fallback: service account (requires Shared Drive)
    if (
      settings.google_drive_service_account_email &&
      settings.google_drive_private_key
    ) {
      const auth = new google.auth.JWT({
        email: settings.google_drive_service_account_email,
        key: settings.google_drive_private_key.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      return google.drive({ version: 'v3', auth });
    }

    return null;
  }

  private async isOAuthConfigured(): Promise<boolean> {
    const settings = await this.getSettings();
    return !!(
      settings?.google_oauth_client_id &&
      settings?.google_oauth_client_secret &&
      settings?.google_oauth_refresh_token
    );
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

  async checkConnection(): Promise<{
    connected: boolean;
    email: string;
    folder_id: string;
    error?: string;
  }> {
    const settings = await this.getSettings();
    const email = settings?.google_drive_service_account_email || '';
    const folderId = settings?.google_drive_folder_id || '';

    try {
      const client = await this.getClient();
      if (!client) {
        return { connected: false, email, folder_id: folderId };
      }

      const usingOAuth = await this.isOAuthConfigured();

      // Verify the folder exists
      const folderMeta = await client.files.get({
        fileId: folderId,
        fields: 'id, driveId',
        supportsAllDrives: true,
      });

      // Service accounts require Shared Drive; OAuth2 works with personal My Drive
      if (!usingOAuth && !folderMeta.data.driveId) {
        return {
          connected: false,
          email,
          folder_id: folderId,
          error:
            'The configured folder is in a personal My Drive. Service accounts cannot store files there. ' +
            'Please use a folder inside a Google Shared Drive (Team Drive), or configure OAuth2 credentials instead.',
        };
      }

      return { connected: true, email, folder_id: folderId };
    } catch (error) {
      this.logger.error(
        'Google Drive connection check failed',
        error instanceof Error ? error.stack : String(error),
      );
      return { connected: false, email, folder_id: folderId };
    }
  }
}
