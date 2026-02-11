import axios from 'axios';
import { httpService } from '../httpService';
import { ImportMode } from '~/types/dataManagement';
import type {
  ExportGroupInfo,
  ExportParams,
  ImportPreview,
  ImportResult,
  BackupHistory,
  BackupHistoryResponse,
  BackupSettings,
  BackupSettingsUpdatePayload,
  DriveStatus,
  RestorePreview,
  RestoreResult,
  DataManagementApiResponse,
} from '~/types/dataManagement';

const BASE = '/data-management';

/**
 * Creates an Axios instance configured identically to httpService but capable
 * of returning Blob responses. The main httpService always returns
 * `response.data` which works fine for JSON but for binary downloads we need
 * `responseType: 'blob'` and direct access to the raw Axios response so we
 * can also read Content-Disposition headers.
 */
const blobClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
  timeout: 120000, // longer timeout for large exports / backups
});

// ─── Export ──────────────────────────────────────────────────────────────────

const getExportGroups = () =>
  httpService.get<DataManagementApiResponse<ExportGroupInfo[]>>(
    `${BASE}/export/groups`,
  );

const exportToExcel = async (params: ExportParams): Promise<{ blob: Blob; filename: string }> => {
  const response = await blobClient.post(`${BASE}/export/excel`, params, {
    responseType: 'blob',
  });

  // Try to extract filename from Content-Disposition header
  const disposition = response.headers['content-disposition'] as string | undefined;
  let filename = 'export.xlsx';
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  return { blob: response.data as Blob, filename };
};

const downloadTemplate = async (group: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await blobClient.get(`${BASE}/export/template/${group}`, {
    responseType: 'blob',
  });

  const disposition = response.headers['content-disposition'] as string | undefined;
  let filename = `${group}-template.xlsx`;
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  return { blob: response.data as Blob, filename };
};

// ─── Import ──────────────────────────────────────────────────────────────────

const importPreview = (file: FormData) =>
  httpService.post<DataManagementApiResponse<ImportPreview>>(
    `${BASE}/import/preview`,
    file,
  );

const executeImport = (file: FormData, mode: ImportMode = ImportMode.INSERT) => {
  file.append('mode', mode);
  return httpService.post<DataManagementApiResponse<ImportResult>>(
    `${BASE}/import/execute`,
    file,
  );
};

// ─── Backup ──────────────────────────────────────────────────────────────────

const createBackup = () =>
  httpService.post<DataManagementApiResponse<BackupHistory>>(
    `${BASE}/backup/create`,
    {},
  );

const getBackupHistory = (page: number = 1, limit: number = 10) =>
  httpService.get<DataManagementApiResponse<BackupHistoryResponse>>(
    `${BASE}/backup/history`,
    { params: { page, limit } },
  );

const getBackupDetail = (id: string) =>
  httpService.get<DataManagementApiResponse<BackupHistory>>(
    `${BASE}/backup/history/${id}`,
  );

const deleteBackup = (id: string) =>
  httpService.delete<DataManagementApiResponse<null>>(
    `${BASE}/backup/history/${id}`,
  );

const downloadBackup = async (id: string): Promise<{ blob: Blob; filename: string }> => {
  const response = await blobClient.get(`${BASE}/backup/history/${id}/download`, {
    responseType: 'blob',
  });

  const disposition = response.headers['content-disposition'] as string | undefined;
  let filename = `backup-${id}.zip`;
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)/);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  return { blob: response.data as Blob, filename };
};

// ─── Restore ─────────────────────────────────────────────────────────────────

const previewRestore = (id: string) =>
  httpService.get<DataManagementApiResponse<RestorePreview>>(
    `${BASE}/backup/restore/${id}/preview`,
  );

const restoreBackup = (id: string) =>
  httpService.post<DataManagementApiResponse<RestoreResult>>(
    `${BASE}/backup/restore/${id}`,
    {},
  );

// ─── Backup Settings ────────────────────────────────────────────────────────

const getBackupSettings = () =>
  httpService.get<DataManagementApiResponse<BackupSettings>>(
    `${BASE}/backup/settings`,
  );

const updateBackupSettings = (data: BackupSettingsUpdatePayload) =>
  httpService.put<DataManagementApiResponse<BackupSettings>>(
    `${BASE}/backup/settings`,
    data,
  );

// ─── Google Drive ────────────────────────────────────────────────────────────

const getDriveStatus = () =>
  httpService.get<DataManagementApiResponse<DriveStatus>>(
    `${BASE}/backup/drive/status`,
  );

// ─── Public API ──────────────────────────────────────────────────────────────

export const dataManagementService = {
  // Export
  getExportGroups,
  exportToExcel,
  downloadTemplate,

  // Import
  importPreview,
  executeImport,

  // Backup
  createBackup,
  getBackupHistory,
  getBackupDetail,
  deleteBackup,
  downloadBackup,

  // Restore
  previewRestore,
  restoreBackup,

  // Settings
  getBackupSettings,
  updateBackupSettings,

  // Google Drive
  getDriveStatus,
};
