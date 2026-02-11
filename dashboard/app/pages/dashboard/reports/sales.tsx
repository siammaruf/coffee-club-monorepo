import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Select } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import reportService from "~/services/httpServices/reportService";
import { useNavigate } from "react-router";
import { Eye, Trash2 } from "lucide-react";
import type { SalesReport } from "~/types/report";
import ViewSalesReportModal from "~/components/modals/ViewSalesReportModal";
import InfoDialog from "~/components/modals/InfoDialog";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";

export default function SalesReportPage() {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [regenerateDate, setRegenerateDate] = useState("");
  const [generateDate, setGenerateDate] = useState(""); // Add this state for report_date
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Dialog state
  const [dialog, setDialog] = useState<{ open: boolean; type: "success" | "error"; message: string }>({
    open: false,
    type: "success",
    message: "",
  });

  // Delete confirm dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; reportId: string | null }>({
    open: false,
    reportId: null,
  });

  useEffect(() => {
    fetchReports();
  }, [statusFilter, dateFilter, searchTerm]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await reportService.getAll(params) as { data?: SalesReport[] };
      setReports(res.data || []);
    } catch (error) {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!generateDate) {
      setDialog({ open: true, type: "error", message: "Please select a date to generate report." });
      return;
    }
    try {
      await reportService.generate({ report_date: generateDate });
      fetchReports();
      setDialog({ open: true, type: "success", message: "Report generated successfully!" });
    } catch (error) {
      setDialog({ open: true, type: "error", message: "Failed to generate report." });
    }
  };

  const handleRegenerateReport = async () => {
    if (!regenerateDate) {
      setDialog({ open: true, type: "error", message: "Please select a date to regenerate." });
      return;
    }
    try {
      await reportService.regenerate(regenerateDate);
      fetchReports();
      setDialog({ open: true, type: "success", message: "Report regenerated successfully!" });
    } catch (error) {
      setDialog({ open: true, type: "error", message: "Failed to regenerate report." });
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteDialog.reportId) return;
    try {
      await reportService.delete(deleteDialog.reportId);
      fetchReports();
    } catch (error) {
      setDialog({ open: true, type: "error", message: "Failed to delete report." });
    } finally {
      setDeleteDialog({ open: false, reportId: null });
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "৳0.00";
    return `৳${num.toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    return dateString ? format(new Date(dateString), 'MMM dd, yyyy') : "-";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
            <Input
              placeholder="Search by invoice or customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={generateDate}
                onChange={e => setGenerateDate(e.target.value)}
                className="w-40"
              />
              <Button onClick={handleGenerateReport} className="bg-blue-600 text-white">
                Generate Report
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={regenerateDate}
                onChange={e => setRegenerateDate(e.target.value)}
                className="w-40"
              />
              <Button
                onClick={handleRegenerateReport}
                className="bg-yellow-600 text-white"
                type="button"
              >
                Regenerate by Date
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Total Sales</TableHead>
                <TableHead className="text-center">Total Orders</TableHead>
                <TableHead className="text-center">Total Expenses</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : reports.length > 0 ? (
                reports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell>{formatDate(report.report_date)}</TableCell>
                    <TableCell className="text-center">{formatCurrency(report.total_sales)}</TableCell>
                    <TableCell className="text-center">{report.total_orders}</TableCell>
                    <TableCell className="text-center">{formatCurrency(report.total_expenses)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReportId(report.id);
                            setViewModalOpen(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteDialog({ open: true, reportId: report.id })}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400">
                    No sales reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ViewSalesReportModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        reportId={selectedReportId}
      />

      {/* Info Dialog */}
      <InfoDialog
        open={dialog.open}
        type={dialog.type}
        message={dialog.message}
        onClose={() => setDialog(d => ({ ...d, open: false }))}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Report"
        description="Are you sure you want to delete this report?"
        onCancel={() => setDeleteDialog({ open: false, reportId: null })}
        onConfirm={handleDeleteReport}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}