import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { IconSelector } from "~/components/ui/icon-selector";
import type { ExpenseCategory } from "~/types/expenseCategory";
import * as IoIcons from "react-icons/io5";

export interface ViewExpenseCategoryModalProps {
  open: boolean;
  onClose: () => void;
  category: ExpenseCategory | null;
}

export default function ViewExpenseCategoryModal({
  open,
  onClose,
  category,
}: ViewExpenseCategoryModalProps) {
  let IconComp: React.ComponentType<{ className?: string }> | undefined;
  if (category?.icon) {
    const iconKey =
      "Io" +
      category.icon
        .split("-")
        .map((part) =>
          part.length > 0 ? part[0].toUpperCase() + part.slice(1) : ""
        )
        .join("");
    IconComp = (IoIcons as any)[iconKey];
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>View Expense Category</DialogTitle>
        </DialogHeader>
        {category ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-md flex items-center justify-center bg-gray-100 text-xs font-bold uppercase">
                {IconComp ? (
                  <IconComp className="w-6 h-6" />
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </span>
              <span className="text-lg font-semibold">{category.name}</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Slug</div>
              <div className="font-mono text-sm">{category.slug}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <div className="text-sm">
                {category.description || <span className="text-gray-400 italic">No description</span>}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Created At</div>
              <div className="text-sm">
                {category.created_at
                  ? new Date(category.created_at).toLocaleString()
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Updated At</div>
              <div className="text-sm">
                {category.updated_at
                  ? new Date(category.updated_at).toLocaleString()
                  : "-"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">No category data found.</div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}