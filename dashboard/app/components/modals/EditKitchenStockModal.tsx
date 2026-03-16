import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import { kitchenItemsService } from "~/services/httpServices/kitchenItemsService";
import type { KitchenItem } from "~/types/kitchenItem";
import type { KitchenStockEntry, UpdateKitchenStockInput } from "~/types/kitchenStock";

interface StockForm {
  kitchen_item_id: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  note: string;
}

interface EditKitchenStockModalProps {
  open: boolean;
  entry: KitchenStockEntry | null;
  onClose: () => void;
  onSuccess: () => void;
  onUpdate: (id: string, data: UpdateKitchenStockInput) => Promise<void>;
}

export default function EditKitchenStockModal({
  open,
  entry,
  onClose,
  onSuccess,
  onUpdate,
}: EditKitchenStockModalProps) {
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<StockForm>();

  useEffect(() => {
    if (open) {
      kitchenItemsService.getAll({ limit: 200 }).then((res: any) => {
        setKitchenItems(res?.data || []);
      });
    }
  }, [open]);

  useEffect(() => {
    if (entry) {
      reset({
        kitchen_item_id: entry.kitchen_item_id,
        quantity: entry.quantity,
        purchase_price: entry.purchase_price,
        purchase_date: entry.purchase_date,
        note: entry.note || "",
      });
    }
  }, [entry, reset]);

  const onSubmit = async (data: StockForm) => {
    if (!entry) return;
    try {
      await onUpdate(entry.id, {
        ...data,
        quantity: Number(data.quantity),
        purchase_price: Number(data.purchase_price),
        note: data.note || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to update stock entry",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Stock Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errors.root.message}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item <span className="text-red-500">*</span>
            </label>
            <Select
              {...register("kitchen_item_id", { required: "Item is required" })}
              className="w-full"
            >
              <option value="" disabled>Select item</option>
              {kitchenItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.type})
                </option>
              ))}
            </Select>
            {errors.kitchen_item_id && (
              <span className="text-red-600 text-xs">{errors.kitchen_item_id.message}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("quantity", {
                  required: "Required",
                  min: { value: 0.01, message: "Must be > 0" },
                  valueAsNumber: true,
                })}
              />
              {errors.quantity && (
                <span className="text-red-600 text-xs">{errors.quantity.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("purchase_price", {
                  required: "Required",
                  min: { value: 0, message: "Must be ≥ 0" },
                  valueAsNumber: true,
                })}
              />
              {errors.purchase_price && (
                <span className="text-red-600 text-xs">{errors.purchase_price.message}</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              {...register("purchase_date", { required: "Date is required" })}
            />
            {errors.purchase_date && (
              <span className="text-red-600 text-xs">{errors.purchase_date.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              {...register("note")}
              rows={2}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
