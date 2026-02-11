import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  FileUp,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Select } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
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
import { Separator } from "~/components/ui/separator";
import { dataManagementService } from "~/services/httpServices/dataManagementService";
import { ImportMode } from "~/types/dataManagement";
import type { ImportPreview, ImportResult } from "~/types/dataManagement";
import { toast } from "sonner";

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

const TEMPLATE_GROUPS = [
  { value: "menu", label: "Menu (Products & Categories)" },
  { value: "orders", label: "Orders" },
  { value: "customers", label: "Customers" },
  { value: "staff", label: "Staff / Employees" },
  { value: "attendance", label: "Attendance" },
  { value: "kitchen", label: "Kitchen Items & Stock" },
  { value: "financial", label: "Financial (Expenses)" },
  { value: "discounts", label: "Discounts" },
  { value: "tables", label: "Tables" },
];

export default function ImportTab() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>(ImportMode.UPSERT);
  const [skipErrors, setSkipErrors] = useState(true);
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [templateGroup, setTemplateGroup] = useState("");
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setPreviewing(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await dataManagementService.importPreview(formData);
      setPreview(response.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to preview file";
      toast.error(message);
      setPreview(null);
    } finally {
      setPreviewing(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExecuteImport = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("skip_errors", String(skipErrors));
      const response = await dataManagementService.executeImport(
        formData,
        importMode
      );
      setResult(response.data);
      if (response.data.success) {
        toast.success("Import completed successfully");
      } else {
        toast.warning("Import completed with errors");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Import failed";
      toast.error(message);
    } finally {
      setImporting(false);
    }
  };

  const handleTemplateDownload = async () => {
    if (!templateGroup) {
      toast.error("Please select a data group first");
      return;
    }

    setDownloadingTemplate(true);
    try {
      const { blob, filename } =
        await dataManagementService.downloadTemplate(templateGroup);
      downloadBlob(blob, filename);
      toast.success("Template downloaded");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to download template";
      toast.error(message);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setImportMode(ImportMode.UPSERT);
    setSkipErrors(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Download Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
              1
            </span>
            Download Template
          </CardTitle>
          <CardDescription>
            Download an Excel template pre-filled with the correct column
            headers for the data you want to import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 min-w-[240px]">
              <Label htmlFor="template-group">Data Group</Label>
              <Select
                id="template-group"
                value={templateGroup}
                onChange={(e) => setTemplateGroup(e.target.value)}
              >
                <option value="">Select a group...</option>
                {TEMPLATE_GROUPS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={handleTemplateDownload}
              disabled={!templateGroup || downloadingTemplate}
            >
              {downloadingTemplate ? (
                <>
                  <Loading size="sm" variant="default" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Template
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Upload File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
              2
            </span>
            Upload File
          </CardTitle>
          <CardDescription>
            Upload your filled-in Excel file (.xlsx) for import
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 cursor-pointer transition-colors ${
                isDragOver
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                  : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <FileUp className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drag and drop your Excel file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse (.xlsx, .xls)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
              <FileSpreadsheet className="w-8 h-8 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              {previewing && <Loading size="sm" />}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="shrink-0"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Preview & Import */}
      {preview && !result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                3
              </span>
              Preview &amp; Import
            </CardTitle>
            <CardDescription>
              Review detected data sheets before importing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-sm">
                <FileSpreadsheet className="w-4 h-4" />
                {preview.sheets.length} sheet(s) detected
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                {preview.total_rows.toLocaleString()} total rows
              </div>
              {preview.total_errors > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {preview.total_errors} validation error(s)
                </div>
              )}
            </div>

            {/* Sheet Details Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sheet Name</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead className="text-right">Total Rows</TableHead>
                  <TableHead className="text-right">Valid</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.sheets.map((sheet) => (
                  <TableRow key={sheet.sheet_name}>
                    <TableCell className="font-medium">
                      {sheet.sheet_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sheet.entity_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {sheet.total_rows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {sheet.valid_rows.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {sheet.error_rows > 0 ? (
                        <span className="text-red-600">
                          {sheet.error_rows.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Validation Errors Detail */}
            {preview.sheets.some((s) => s.errors.length > 0) && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Validation Errors
                </h4>
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sheet</TableHead>
                        <TableHead>Row</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.sheets.flatMap((sheet) =>
                        sheet.errors.map((err, idx) => (
                          <TableRow key={`${sheet.sheet_name}-${idx}`}>
                            <TableCell className="text-xs">
                              {sheet.sheet_name}
                            </TableCell>
                            <TableCell className="text-xs">{err.row}</TableCell>
                            <TableCell className="text-xs font-mono">
                              {err.field}
                            </TableCell>
                            <TableCell className="text-xs text-red-600">
                              {err.message}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Separator />

            {/* Import Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Import Options</h4>
              <div className="flex flex-wrap gap-6">
                <div className="space-y-2 min-w-[200px]">
                  <Label htmlFor="import-mode">Import Mode</Label>
                  <Select
                    id="import-mode"
                    value={importMode}
                    onChange={(e) =>
                      setImportMode(e.target.value as ImportMode)
                    }
                  >
                    <option value={ImportMode.INSERT}>
                      Insert Only (skip duplicates)
                    </option>
                    <option value={ImportMode.UPSERT}>
                      Upsert (update existing, insert new)
                    </option>
                  </Select>
                </div>
                <div className="flex items-center gap-2 self-end pb-1">
                  <Checkbox
                    id="skip-errors"
                    checked={skipErrors}
                    onChange={(e) =>
                      setSkipErrors(
                        (e.target as HTMLInputElement).checked
                      )
                    }
                  />
                  <Label htmlFor="skip-errors" className="cursor-pointer">
                    Skip rows with errors
                  </Label>
                </div>
              </div>
            </div>

            {/* Execute Import */}
            <div className="flex justify-end">
              <Button
                onClick={handleExecuteImport}
                disabled={importing}
                className="min-w-[160px]"
              >
                {importing ? (
                  <>
                    <Loading size="sm" variant="default" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Execute Import
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 ${
                result.success ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {result.success
                ? "Import Completed Successfully"
                : "Import Completed with Errors"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Imported Counts */}
            {Object.keys(result.imported_counts).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-700">
                  Imported Records
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.imported_counts).map(
                    ([entity, count]) => (
                      <Badge key={entity} className="bg-green-100 text-green-800">
                        {entity}: {count.toLocaleString()}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Skipped Counts */}
            {Object.keys(result.skipped_counts).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-yellow-700">
                  Skipped Records
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.skipped_counts).map(
                    ([entity, count]) => (
                      <Badge
                        key={entity}
                        className="bg-yellow-100 text-yellow-800"
                      >
                        {entity}: {count.toLocaleString()}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-red-700">
                  Errors ({result.errors.length})
                </h4>
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Row</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((err, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs">{err.entity}</TableCell>
                          <TableCell className="text-xs">{err.row}</TableCell>
                          <TableCell className="text-xs text-red-600">
                            {err.message}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleReset}>
                Import Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
