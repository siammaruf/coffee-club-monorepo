import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { X, Calendar, DollarSign, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Expense } from "~/types/expense";

interface ViewExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export default function ViewExpenseModal({
  open,
  onClose,
  expense,
  onEdit,
  onDelete,
}: ViewExpenseModalProps) {
  if (!open || !expense) return null;

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "৳0.00";
    return `৳${num.toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    return dateString ? format(new Date(dateString), 'MMM dd, yyyy') : "-";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <CardTitle className="text-lg font-semibold">Expense Details</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <CardContent className="py-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-xl font-bold">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(expense.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Badge variant="outline">{expense.category?.name || "Uncategorized"}</Badge>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold text-gray-500">Status:</span>
              <Badge className={getStatusColor(expense.status)}>
                {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
              </Badge>
            </div>
            <div>
              <span className="font-semibold text-gray-500">Title:</span>
              <span className="ml-2">{expense.title}</span>
            </div>
            {expense.description && (
              <div>
                <span className="font-semibold text-gray-500">Description:</span>
                <span className="ml-2">{expense.description}</span>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => onEdit(expense)}
                className="flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(expense.id)}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
}