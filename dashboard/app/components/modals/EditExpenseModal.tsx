import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import expenseCategoryService from "~/services/httpServices/expenseCategory";
import type { Expense, ExpenseUpdate } from "~/types/expense";

interface EditExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSuccess: (expense: Expense) => void;
  onUpdate: (id: string, data: ExpenseUpdate) => Promise<any>;
}

export default function EditExpenseModal({
  open,
  onClose,
  expense,
  onSuccess,
  onUpdate,
}: EditExpenseModalProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ExpenseUpdate>({
    defaultValues: {
      title: expense?.title || "",
      amount: expense?.amount ? Number(expense.amount) : 0,
      category_id: expense?.category?.id || "",
      description: expense?.description || "",
      status: expense?.status || "pending",
    },
  });

  // Update form values when expense changes
  useEffect(() => {
    reset({
      title: expense?.title || "",
      amount: expense?.amount ? Number(expense.amount) : 0,
      category_id: expense?.category?.id || "",
      description: expense?.description || "",
      status: expense?.status || "pending",
    });
  }, [expense, reset]);

  useEffect(() => {
    if (open) {
      expenseCategoryService.getAll().then((res: any) => {
        setCategories(res.data?.data || []);
      });
    }
  }, [open]);

  const onSubmit = async (data: ExpenseUpdate) => {
    if (!expense) return;
    try {
      const res = await onUpdate(expense.id, data);
      onSuccess(res.data);
      reset();
    } catch (err: any) {
      setError("title", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to update expense",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              {...register("title", { required: "Title is required" })}
              name="title"
              id="title"
              placeholder="Monthly Rent"
            />
            {errors.title && <span className="text-red-600 text-xs">{errors.title.message}</span>}
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0, message: "Amount must be greater than or equal to 0" },
                valueAsNumber: true,
                validate: value => typeof value === "number" && !isNaN(value) || "Amount must be a number"
              })}
              name="amount"
              id="amount"
              placeholder="1000.50"
            />
            {errors.amount && <span className="text-red-600 text-xs">{errors.amount.message}</span>}
          </div>
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select
              {...register("category_id", { required: "Category is required" })}
              name="category_id"
              id="category_id"
              className="w-full"
              defaultValue={expense?.category?.id || ""}
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
            {errors.category_id && (
              <span className="text-red-600 text-xs">{errors.category_id.message}</span>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              name="description"
              id="description"
              rows={3}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Description"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              {...register("status", { required: "Status is required" })}
              name="status"
              id="status"
              className="w-full"
              defaultValue={expense?.status || "pending"}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
            {errors.status && (
              <span className="text-red-600 text-xs">{errors.status.message}</span>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}