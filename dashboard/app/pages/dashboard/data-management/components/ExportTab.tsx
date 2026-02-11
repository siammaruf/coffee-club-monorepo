import { useState, useEffect, useCallback } from "react";
import { Download, FileSpreadsheet, Calendar, CheckSquare } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Loading } from "~/components/ui/loading";
import { dataManagementService } from "~/services/httpServices/dataManagementService";
import type { ExportGroupInfo } from "~/types/dataManagement";
import { ExportGroup } from "~/types/dataManagement";
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

export default function ExportTab() {
  const [groups, setGroups] = useState<ExportGroupInfo[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<ExportGroup[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataManagementService.getExportGroups();
      setGroups(response.data ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load export groups";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const toggleGroup = (group: string) => {
    const enumValue = group as ExportGroup;
    setSelectedGroups((prev) =>
      prev.includes(enumValue)
        ? prev.filter((g) => g !== enumValue)
        : [...prev, enumValue]
    );
  };

  const selectAll = () => {
    setSelectedGroups(groups.map((g) => g.group as ExportGroup));
  };

  const deselectAll = () => {
    setSelectedGroups([]);
  };

  const handleExport = async () => {
    if (selectedGroups.length === 0) {
      toast.error("Please select at least one data group to export");
      return;
    }

    setExporting(true);
    try {
      const { blob, filename } = await dataManagementService.exportToExcel({
        groups: selectedGroups,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      downloadBlob(blob, filename);
      toast.success("Export downloaded successfully");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to export data";
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={loadGroups}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Groups Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Select Data to Export
              </CardTitle>
              <CardDescription>
                Choose the data groups you want to include in the Excel export
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                <CheckSquare className="w-4 h-4" />
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No export groups available
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => {
                const isSelected = selectedGroups.includes(
                  group.group as ExportGroup
                );
                return (
                  <label
                    key={group.group}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                        : "border-border hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleGroup(group.group)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {group.label}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {group.record_count.toLocaleString()} records
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {group.description}
                      </p>
                      {group.entities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.entities.map((entity) => (
                            <Badge
                              key={entity}
                              variant="outline"
                              className="text-xs"
                            >
                              {entity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>
            Optionally filter exported data by date range (applies to
            date-sensitive data like orders, attendance, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="date-from">From</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-48"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear Dates
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Action */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedGroups.length} of {groups.length} groups selected
        </p>
        <Button
          onClick={handleExport}
          disabled={exporting || selectedGroups.length === 0}
          className="min-w-[160px]"
        >
          {exporting ? (
            <>
              <Loading size="sm" variant="default" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export to Excel
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
