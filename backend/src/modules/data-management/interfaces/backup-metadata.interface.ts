export interface BackupMetadata {
  version: string;
  created_at: string;
  table_prefix: string;
  entity_counts: Record<string, number>;
  total_records: number;
  checksum: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any[]>;
}

export interface ExportGroupInfo {
  group: string;
  label: string;
  description: string;
  entities: string[];
  record_count: number;
}

export interface ImportPreviewSheet {
  sheet_name: string;
  entity_type: string;
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

export interface ImportPreview {
  sheets: ImportPreviewSheet[];
  total_rows: number;
  total_errors: number;
}

export interface ImportResult {
  success: boolean;
  imported_counts: Record<string, number>;
  skipped_counts: Record<string, number>;
  errors: Array<{ entity: string; row: number; message: string }>;
}

export interface RestorePreviewBackup {
  id: string;
  filename: string;
  file_size: number;
  total_records: number;
  type: string;
  status: string;
  created_at: string;
  created_by: { first_name: string; last_name: string } | null;
}

export interface RestorePreview {
  backup: RestorePreviewBackup;
  entity_counts: Record<string, number>;
  current_counts: Record<string, number>;
  warnings: string[];
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restored_counts: Record<string, number>;
  errors: string[];
}
