import { Users } from "lucide-react";
import { format } from "date-fns";
import type { Salary } from "~/types/salary";
import { DialogHeader, Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface SalaryDetailsModalProps {
  open: boolean;
  onClose: () => void;
  record: Salary | null;
  formatCurrency: (amount: number) => string;
}

export default function SalaryDetailsModal({
  open,
  onClose,
  record,
  formatCurrency,
}: SalaryDetailsModalProps) {
  if (!record) return null;

  const formatMonth = (dateString: string) => {
    return format(new Date(dateString), 'MMMM yyyy');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden rounded-xl shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="text-xl font-bold">Salary Details</DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-8 pt-2 space-y-6">
          <div className="flex items-center gap-5">
            {record.user?.picture ? (
              <img
                src={record.user.picture}
                alt={`${record.user.first_name} ${record.user.last_name}`}
                className="w-20 h-20 rounded-full object-cover border shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-500" />
              </div>
            )}
            <div>
              <div className="font-semibold text-lg">
                {record.user?.first_name} {record.user?.last_name}
              </div>
              <div className="text-gray-500">{record.user?.role}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <span className="block text-xs text-gray-500">Month</span>
              <span className="font-medium">{formatMonth(record.month ?? "")}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Status</span>
              <span className={record.is_paid ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                {record.is_paid ? "Paid" : "Unpaid"}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Base Salary</span>
              <span className="font-medium">{formatCurrency(record.base_salary ?? 0)}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Bonus</span>
              <span className="font-medium">{formatCurrency(record.bonus ?? 0)}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Deduction</span>
              <span className="font-medium">{formatCurrency(record.deductions ?? 0)}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Total Payable</span>
              <span className="font-medium">{formatCurrency(record.total_payble ?? 0)}</span>
            </div>
          </div>
          {record.notes && (
            <div>
              <span className="block text-xs text-gray-500 mb-1">Notes</span>
              <div className="text-gray-700 bg-gray-100 rounded p-2">{record.notes}</div>
            </div>
          )}
          {record.receipt_image && (
            <div>
              <span className="block text-xs text-gray-500 mb-1">Receipt</span>
              <div className="mt-2">
                <img
                  src={`${record.receipt_image}`}
                  alt="Receipt"
                  className="max-h-56 rounded border shadow"
                  style={{ objectFit: "contain", background: "#f9fafb" }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}