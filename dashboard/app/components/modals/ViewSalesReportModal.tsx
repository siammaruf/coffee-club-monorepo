import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import reportService from "~/services/httpServices/reportService";
import { format } from "date-fns";
import type { SalesReport, ViewSalesReportModalProps } from "~/types/report";

export default function ViewSalesReportModal({
  open,
  onClose,
  reportId,
}: ViewSalesReportModalProps) {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && reportId) {
      fetchReport();
    }
    // eslint-disable-next-line
  }, [open, reportId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportService.getById(reportId as string) as { data: SalesReport };
      setReport(res.data);
    } catch (error) {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "৳0.00";
    return `৳${num.toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    return dateString
      ? format(new Date(dateString), "EEEE, MMM dd, yyyy, hh:mm a")
      : "-";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Sales Report Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-lg">Loading...</div>
        ) : report ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Date: full width */}
            <div className="col-span-1 sm:col-span-2 bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Date</span>
              <span className="font-semibold">{formatDate(report.report_date)}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Total Sales</span>
              <span className="font-semibold">{formatCurrency(report.total_sales)}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Bar Sales</span>
              <span className="font-semibold">{formatCurrency(report.bar_sales)}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Kitchen Sales</span>
              <span className="font-semibold">{formatCurrency(report.kitchen_sales)}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Total Orders</span>
              <span className="font-semibold">{report.total_orders}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Bar Orders</span>
              <span className="font-semibold">{report.bar_orders}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Kitchen Orders</span>
              <span className="font-semibold">{report.kitchen_orders}</span>
            </div>
            <div className="bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Total Expenses</span>
              <span className="font-semibold">{formatCurrency(report.total_expenses)}</span>
            </div>
            {/* Auto Generated placed here */}
            <div className="bg-gray-50 rounded p-3 flex flex-col">
              <span className="text-xs text-gray-500">Auto Generated</span>
              <span className="font-semibold">{report.is_auto_generated ? "Yes" : "No"}</span>
            </div>
            {/* Credit Amount: full width and highlighted */}
            <div className="col-span-1 sm:col-span-2 bg-blue-50 border border-blue-200 rounded p-4 flex flex-col mt-2">
              <span className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Credit Amount</span>
              <span className="text-2xl font-bold text-blue-900">{formatCurrency(report.credit_amount)}</span>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-lg">No report found.</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}