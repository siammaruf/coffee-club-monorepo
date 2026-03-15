import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Download,
  Trash2,
  RotateCcw,
  Plus,
  Settings,
  Clock,
  HardDrive,
  Cloud,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  CloudUpload,
  LogIn,
  LogOut,
} from "lucide-react";
import { API_URL } from "~/lib/config";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Loading } from "~/components/ui/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import { Pagination } from "~/components/ui/pagination";
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { dataManagementService } from "~/services/httpServices/dataManagementService";
import { BackupStatus, BackupType } from "~/types/dataManagement";
import type {
  BackupHistory,
  BackupSettings,
  DriveStatus,
  DriveFolder,
  RestorePreview,
} from "~/types/dataManagement";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getStatusBadge(status: BackupStatus) {
  switch (status) {
    case BackupStatus.COMPLETED:
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case BackupStatus.IN_PROGRESS:
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          In Progress
        </Badge>
      );
    case BackupStatus.UPLOADING:
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <CloudUpload className="w-3 h-3 mr-1" />
          Uploading
        </Badge>
      );
    case BackupStatus.FAILED:
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTypeBadge(type: BackupType) {
  switch (type) {
    case BackupType.MANUAL:
      return (
        <Badge variant="outline" className="text-xs">
          Manual
        </Badge>
      );
    case BackupType.SCHEDULED:
      return (
        <Badge className="bg-purple-100 text-purple-800 text-xs">
          Scheduled
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

// ─── Backup Settings Dialog ─────────────────────────────────────────────────

interface BackupSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: BackupSettings | null;
  driveStatus: DriveStatus | null;
  onSaved: () => void;
}

function BackupSettingsDialog({
  open,
  onOpenChange,
  settings,
  driveStatus,
  onSaved,
}: BackupSettingsDialogProps) {
  const [autoBackup, setAutoBackup] = useState(false);
  const [scheduleType, setScheduleType] = useState("daily");
  const [cronExpression, setCronExpression] = useState("0 2 * * *");
  const [retentionDays, setRetentionDays] = useState(30);
  const [maxBackups, setMaxBackups] = useState(50);
  const [driveFolderId, setDriveFolderId] = useState("");
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [saving, setSaving] = useState(false);

  const isConnected = driveStatus?.connected ?? false;

  // Populate form when dialog opens
  useEffect(() => {
    if (!open || !settings) return;
    setAutoBackup(settings.auto_backup_enabled);
    setScheduleType(settings.schedule_type);
    setCronExpression(settings.cron_expression);
    setRetentionDays(settings.retention_days);
    setMaxBackups(settings.max_backups);
    setDriveFolderId(settings.google_drive_folder_id ?? "");
  }, [open, settings]);

  // Load folders when connected and dialog opens
  useEffect(() => {
    if (!open || !isConnected) return;
    setLoadingFolders(true);
    dataManagementService
      .listDriveFolders()
      .then((res) => {
        setFolders(res.data ?? []);
      })
      .catch(() => setFolders([]))
      .finally(() => setLoadingFolders(false));
  }, [open, isConnected]);

  // Update cron when schedule type changes
  useEffect(() => {
    switch (scheduleType) {
      case "daily":
        setCronExpression("0 2 * * *");
        break;
      case "weekly":
        setCronExpression("0 2 * * 0");
        break;
      case "disabled":
        setCronExpression("");
        break;
    }
  }, [scheduleType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dataManagementService.updateBackupSettings({
        auto_backup_enabled: autoBackup,
        schedule_type: scheduleType,
        cron_expression: cronExpression,
        retention_days: retentionDays,
        max_backups: maxBackups,
        google_drive_folder_id: driveFolderId || null,
      });
      toast.success("Backup settings saved");
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = () => {
    setConnecting(true);

    const popup = window.open(
      `${API_URL}/data-management/backup/drive/oauth/authorize`,
      "oauth_popup",
      "width=600,height=700,left=200,top=100"
    );

    if (!popup) {
      toast.error("Popup was blocked. Allow popups for this site and try again.");
      setConnecting(false);
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "oauth_success") {
        toast.success("Google Drive connected!");
        setConnecting(false);
        window.removeEventListener("message", onMessage);
        clearInterval(pollInterval);
        onSaved(); // refresh driveStatus + settings in parent
      } else if (event.data?.type === "oauth_error") {
        toast.error(event.data.error || "Google authorization failed.");
        setConnecting(false);
        window.removeEventListener("message", onMessage);
        clearInterval(pollInterval);
      }
    };

    window.addEventListener("message", onMessage);

    const pollInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollInterval);
        window.removeEventListener("message", onMessage);
        setConnecting(false);
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await dataManagementService.disconnectDrive();
      toast.success("Google Drive disconnected");
      setFolders([]);
      setDriveFolderId("");
      onSaved();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to disconnect";
      toast.error(message);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Backup Settings
          </DialogTitle>
          <DialogDescription>
            Configure automatic backup schedule and Google Drive integration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Auto Backup */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="auto-backup"
              checked={autoBackup}
              onChange={(e) =>
                setAutoBackup((e.target as HTMLInputElement).checked)
              }
            />
            <Label htmlFor="auto-backup" className="cursor-pointer">
              Enable automatic backups
            </Label>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="schedule-type">Schedule Type</Label>
            <Select
              id="schedule-type"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="disabled">Disabled</option>
            </Select>
          </div>

          {scheduleType !== "disabled" && (
            <div className="space-y-2">
              <Label htmlFor="cron-expression">Cron Expression</Label>
              <Input
                id="cron-expression"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="0 2 * * *"
              />
              <p className="text-xs text-muted-foreground">
                {scheduleType === "daily"
                  ? "Runs daily at 2:00 AM"
                  : "Runs weekly on Sunday at 2:00 AM"}
              </p>
            </div>
          )}

          {/* Retention */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retention-days">Retention (days)</Label>
              <Input
                id="retention-days"
                type="number"
                min={1}
                max={365}
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-backups">Max Backups</Label>
              <Input
                id="max-backups"
                type="number"
                min={1}
                max={1000}
                value={maxBackups}
                onChange={(e) => setMaxBackups(Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          {/* Google Drive Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Google Drive
            </h4>

            {isConnected ? (
              /* ── Connected state ── */
              <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2"
                  >
                    {disconnecting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    <span className="ml-1 text-xs">Disconnect</span>
                  </Button>
                </div>
                {driveStatus?.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {driveStatus.email}
                  </p>
                )}
                {driveStatus && !driveStatus.folder_configured && (
                  <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>No backup folder selected — choose a folder below to enable cloud backups.</span>
                  </div>
                )}
              </div>
            ) : (
              /* ── Not connected state ── */
              <div className="rounded-lg border border-dashed p-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect your Google account to enable cloud backup storage.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Waiting for authorization...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Connect Google Drive
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Folder picker — shown only when connected */}
            {isConnected && (
              <div className="space-y-2">
                <Label htmlFor="drive-folder">Backup Folder</Label>
                {loadingFolders ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading folders...
                  </div>
                ) : folders.length > 0 ? (
                  <Select
                    id="drive-folder"
                    value={driveFolderId}
                    onChange={(e) => setDriveFolderId(e.target.value)}
                  >
                    <option value="">— Select a folder —</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id="drive-folder"
                    value={driveFolderId}
                    onChange={(e) => setDriveFolderId(e.target.value)}
                    placeholder="Folder ID from drive.google.com/drive/folders/..."
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Backups will be uploaded to this folder in your Google Drive.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loading size="sm" variant="default" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Restore Preview Dialog ─────────────────────────────────────────────────

interface RestorePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: RestorePreview | null;
  loading: boolean;
  restoring: boolean;
  onRestore: () => void;
}

function RestorePreviewDialog({
  open,
  onOpenChange,
  preview,
  loading,
  restoring,
  onRestore,
}: RestorePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="w-5 h-5" />
            Restore Backup
          </DialogTitle>
          <DialogDescription>
            This will replace current data with the backup data. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loading size="md" />
          </div>
        ) : preview ? (
          <div className="space-y-4 py-2">
            <div className="text-sm">
              <p className="font-medium mb-1">Backup Details</p>
              <p className="text-muted-foreground">
                {preview.backup.filename} &mdash;{" "}
                {formatDate(preview.backup.created_at)}
              </p>
            </div>

            {/* Entity counts comparison */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Data Comparison</p>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead className="text-right">
                        Current
                      </TableHead>
                      <TableHead className="text-right">
                        Backup
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(preview.entity_counts).map((entity) => (
                      <TableRow key={entity}>
                        <TableCell className="capitalize text-sm">
                          {entity}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {(
                            preview.current_counts[entity] ?? 0
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {preview.entity_counts[entity].toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Warnings */}
            {preview.warnings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-700">Warnings</p>
                <ul className="space-y-1">
                  {preview.warnings.map((warning, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-yellow-700"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            Failed to load restore preview
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onRestore}
            disabled={restoring || loading || !preview}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {restoring ? (
              <>
                <Loading size="sm" variant="default" />
                Restoring...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Restore Backup
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Backup Tab ────────────────────────────────────────────────────────

export default function BackupTab() {
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveStatus | null>(null);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [testingDrive, setTestingDrive] = useState(false);

  // Restore state
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restorePreview, setRestorePreview] = useState<RestorePreview | null>(
    null
  );
  const [restorePreviewLoading, setRestorePreviewLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreTargetId, setRestoreTargetId] = useState<string | null>(null);

  const itemsPerPage = 10;

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dataManagementService.getBackupHistory(
        page,
        itemsPerPage
      );
      const data = response.data;
      setHistory(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load backup history";
      toast.error(message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadDriveStatus = useCallback(async () => {
    try {
      const response = await dataManagementService.getDriveStatus();
      setDriveStatus(response.data);
    } catch {
      setDriveStatus(null);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const response = await dataManagementService.getBackupSettings();
      setSettings(response.data);
    } catch {
      setSettings(null);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    loadDriveStatus();
    loadSettings();
  }, [loadDriveStatus, loadSettings]);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await dataManagementService.createBackup();
      toast.success("Backup creation started");
      loadHistory();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create backup";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleTestDrive = async () => {
    setTestingDrive(true);
    try {
      const response = await dataManagementService.testDriveConnection();
      toast.success(response.data?.message ?? "Test upload successful");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Test upload failed";
      toast.error(message);
    } finally {
      setTestingDrive(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await dataManagementService.deleteBackup(deleteId);
      toast.success("Backup deleted");
      setDeleteId(null);
      loadHistory();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete backup";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (backup: BackupHistory) => {
    setDownloadingId(backup.id);
    try {
      const { blob, filename } = await dataManagementService.downloadBackup(
        backup.id
      );
      downloadBlob(blob, filename);
      toast.success("Backup downloaded");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to download backup";
      toast.error(message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRestoreClick = async (id: string) => {
    setRestoreTargetId(id);
    setRestoreDialogOpen(true);
    setRestorePreview(null);
    setRestorePreviewLoading(true);
    try {
      const response = await dataManagementService.previewRestore(id);
      setRestorePreview(response.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load restore preview";
      toast.error(message);
    } finally {
      setRestorePreviewLoading(false);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!restoreTargetId) return;
    setRestoring(true);
    try {
      const response = await dataManagementService.restoreBackup(
        restoreTargetId
      );
      if (response.data.success) {
        toast.success("Backup restored successfully");
      } else {
        toast.warning("Restore completed with errors");
      }
      setRestoreDialogOpen(false);
      setRestoreTargetId(null);
      loadHistory();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to restore backup";
      toast.error(message);
    } finally {
      setRestoring(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const lastBackup = history.find(
    (b) => b.status === BackupStatus.COMPLETED
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Drive Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driveStatus?.connected ? (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      driveStatus.folder_configured
                        ? "bg-green-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-lg font-semibold">
                    {driveStatus.folder_configured ? "Connected" : "Token Active"}
                  </span>
                </div>
                {driveStatus.email && (
                  <p className="text-xs text-muted-foreground mt-1 truncate" title={driveStatus.email}>
                    {driveStatus.email}
                  </p>
                )}
                {!driveStatus.folder_configured && (
                  <p className="text-xs text-amber-600 mt-1">
                    No folder selected
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-lg font-semibold">Not Connected</span>
                </div>
                {driveStatus?.error && (
                  <p className="text-xs text-red-500 mt-1 leading-snug">
                    {driveStatus.error}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Last Backup */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastBackup ? (
              <>
                <p className="text-lg font-semibold">
                  {formatDate(lastBackup.created_at)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(lastBackup.file_size)} &mdash;{" "}
                  {lastBackup.total_records.toLocaleString()} records
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold text-muted-foreground">
                No backups yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Total Backups */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>

        {/* Schedule Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {settings ? (
              <>
                <p className="text-lg font-semibold capitalize">
                  {settings.auto_backup_enabled
                    ? settings.schedule_type
                    : "Disabled"}
                </p>
                {settings.auto_backup_enabled && settings.cron_expression && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {settings.cron_expression}
                  </p>
                )}
              </>
            ) : (
              <p className="text-lg font-semibold text-muted-foreground">--</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Backup History</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          {driveStatus?.connected && driveStatus?.folder_configured && (
            <Button
              variant="outline"
              onClick={handleTestDrive}
              disabled={testingDrive}
              title="Upload a small test file to verify Google Drive integration"
            >
              {testingDrive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  Test Backup
                </>
              )}
            </Button>
          )}
          <Button
            onClick={handleCreateBackup}
            disabled={creating}
            className="min-w-[160px]"
          >
            {creating ? (
              <>
                <Loading size="sm" variant="default" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Backup Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Backup History Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loading size="lg" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No backups yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first backup to protect your data
              </p>
              <Button onClick={handleCreateBackup} disabled={creating}>
                <Plus className="w-4 h-4" />
                Create First Backup
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>{getTypeBadge(backup.type)}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(backup.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatFileSize(backup.file_size)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {backup.total_records.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(backup.status)}</TableCell>
                      <TableCell className="text-sm">
                        {backup.created_by
                          ? `${backup.created_by.first_name} ${backup.created_by.last_name}`
                          : "System"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {backup.status === BackupStatus.COMPLETED && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRestoreClick(backup.id)}
                                title="Restore this backup"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownload(backup)}
                                disabled={downloadingId === backup.id}
                                title="Download backup"
                              >
                                {downloadingId === backup.id ? (
                                  <Loading size="sm" variant="default" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(backup.id)}
                            title="Delete backup"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Backup Settings Dialog */}
      <BackupSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        driveStatus={driveStatus}
        onSaved={() => {
          loadSettings();
          loadDriveStatus();
        }}
      />

      {/* Restore Preview Dialog */}
      <RestorePreviewDialog
        open={restoreDialogOpen}
        onOpenChange={(open) => {
          setRestoreDialogOpen(open);
          if (!open) {
            setRestoreTargetId(null);
            setRestorePreview(null);
          }
        }}
        preview={restorePreview}
        loading={restorePreviewLoading}
        restoring={restoring}
        onRestore={handleRestoreConfirm}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Backup"
        message="Are you sure you want to delete this backup? This action cannot be undone."
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
