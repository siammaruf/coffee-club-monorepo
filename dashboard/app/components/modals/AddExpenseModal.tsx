import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import type { ExpenseCreate } from "~/types/expense";
import expenseCategoryService from "~/services/httpServices/expenseCategory";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (expense: any) => void;
  onCreate: (data: ExpenseCreate) => Promise<any>;
}

interface CategoryOption {
  id: string;
  name: string;
  icon?: string;
}

export default function AddExpenseModal({
  open,
  onClose,
  onSuccess,
  onCreate,
}: AddExpenseModalProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ExpenseCreate>({
    defaultValues: {
      title: "",
      amount: 0,
      category_id: "",
      description: "",
      status: "pending",
    },
  });

  useEffect(() => {
    if (open) {
      expenseCategoryService.getAll().then((res: any) => {
        setCategories(res?.data || []);
      });
    }
  }, [open]);

  const onSubmit = async (data: ExpenseCreate) => {
    try {
      const res = await onCreate(data);
      onSuccess(res.data);
      reset();
    } catch (err: any) {
      setError("title", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to add expense",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
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
              defaultValue=""
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
              defaultValue="pending"
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
              {isSubmitting ? "Saving..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}