// ─── Enums ───────────────────────────────────────────────────────────────────

export enum ExportGroup {
  MENU = 'menu',
  ORDERS = 'orders',
  CUSTOMERS = 'customers',
  STAFF = 'staff',
  ATTENDANCE = 'attendance',
  KITCHEN = 'kitchen',
  FINANCIAL = 'financial',
  DISCOUNTS = 'discounts',
  TABLES = 'tables',
  REPORTS = 'reports',
}

export enum ImportMode {
  INSERT = 'insert',
  UPSERT = 'upsert',
}

export enum BackupType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
}

export enum BackupStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  UPLOADING = 'uploading',
}

// ─── Export ──────────────────────────────────────────────────────────────────

export interface ExportGroupInfo {
  group: string;
  label: string;
  description: string;
  entities: string[];
  record_count: number;
}

export interface ExportParams {
  groups: ExportGroup[];
  date_from?: string;
  date_to?: string;
}

// ─── Import ──────────────────────────────────────────────────────────────────

export interface ImportSheetError {
  row: number;
  field: string;
  message: string;
}

export interface ImportPreviewSheet {
  sheet_name: string;
  entity_type: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  errors: ImportSheetError[];
}

export interface ImportPreview {
  sheets: ImportPreviewSheet[];
  total_rows: number;
  total_errors: number;
}

export interface ImportEntityError {
  entity: string;
  row: number;
  message: string;
}

export interface ImportResult {
  success: boolean;
  imported_counts: Record<string, number>;
  skipped_counts: Record<string, number>;
  errors: ImportEntityError[];
}

export interface ImportExecuteParams {
  mode: ImportMode;
}

// ─── Backup ──────────────────────────────────────────────────────────────────

export interface BackupCreatedBy {
  id: string;
  first_name: string;
  last_name: string;
}

export interface BackupHistory {
  id: string;
  filename: string;
  google_drive_file_id: string | null;
  file_size: number;
  total_records: number;
  entity_counts: Record<string, number> | null;
  version: string;
  type: BackupType;
  status: BackupStatus;
  error_message: string | null;
  created_by: BackupCreatedBy | null;
  created_at: string;
  updated_at: string;
}

export interface BackupHistoryResponse {
  items: BackupHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BackupSettings {
  id: string;
  auto_backup_enabled: boolean;
  schedule_type: string;
  cron_expression: string;
  retention_days: number;
  max_backups: number;
  google_drive_service_account_email: string | null;
  google_drive_private_key: string | null;
  google_drive_folder_id: string | null;
  updated_at: string;
}

export interface BackupSettingsUpdatePayload {
  auto_backup_enabled?: boolean;
  schedule_type?: string;
  cron_expression?: string;
  retention_days?: number;
  max_backups?: number;
  google_drive_service_account_email?: string | null;
  google_drive_private_key?: string | null;
  google_drive_folder_id?: string | null;
}

export interface DriveStatus {
  connected: boolean;
  email: string;
  folder_id: string;
}

// ─── Restore ─────────────────────────────────────────────────────────────────

export interface RestorePreview {
  backup: BackupHistory;
  entity_counts: Record<string, number>;
  current_counts: Record<string, number>;
  warnings: string[];
}

export interface RestoreResult {
  success: boolean;
  restored_counts: Record<string, number>;
  errors: string[];
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface DataManagementApiResponse<T> {
  data: T;
  status: string;
  message: string;
  statusCode: number;
}

// ─── Pagination Params ──────────────────────────────────────────────────────

export interface BackupHistoryParams {
  page?: number;
  limit?: number;
}
