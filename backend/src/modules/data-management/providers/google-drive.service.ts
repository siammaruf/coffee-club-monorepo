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
    if (
      !settings?.google_drive_service_account_email ||
      !settings?.google_drive_private_key ||
      !settings?.google_drive_folder_id
    ) {
      return null;
    }

    const auth = new google.auth.JWT(
      settings.google_drive_service_account_email,
      undefined,
      settings.google_drive_private_key.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive.file'],
    );

    return google.drive({ version: 'v3', auth });
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

    const response = await client.files.create({
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

    const fileId = response.data.id;
    const webViewLink = response.data.webViewLink || '';

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
      { fileId, alt: 'media' },
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
      await client.files.delete({ fileId });
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
  }> {
    const settings = await this.getSettings();
    const email = settings?.google_drive_service_account_email || '';
    const folderId = settings?.google_drive_folder_id || '';

    try {
      const client = await this.getClient();
      if (!client) {
        return { connected: false, email, folder_id: folderId };
      }

      await client.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id)',
        pageSize: 1,
      });

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
