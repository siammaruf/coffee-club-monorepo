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
import type { CreateUsageStockInput } from "~/types/kitchenStock";

interface UsageForm {
  kitchen_item_id: string;
  quantity: number;
  unit: string;
  usage_date: string;
  note: string;
}

interface UseStockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUse: (data: CreateUsageStockInput) => Promise<void>;
}

export default function UseStockModal({
  open,
  onClose,
  onSuccess,
  onUse,
}: UseStockModalProps) {
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<UsageForm>({
    defaultValues: {
      kitchen_item_id: "",
      quantity: 0,
      unit: "quantity",
      usage_date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      kitchenItemsService.getAll({ limit: 200 }).then((res: any) => {
        setKitchenItems(res?.data || []);
      });
    }
  }, [open]);

  const onSubmit = async (data: UsageForm) => {
    try {
      await onUse({
        kitchen_item_id: data.kitchen_item_id,
        quantity: Number(data.quantity),
        unit: data.unit,
        purchase_date: data.usage_date,
        note: data.note || undefined,
        entry_type: "USAGE",
      });
      reset();
      onSuccess();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to record stock usage",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Stock Usage</DialogTitle>
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
              defaultValue=""
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
                Quantity Used <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("quantity", {
                  required: "Required",
                  min: { value: 0.01, message: "Must be > 0" },
                  valueAsNumber: true,
                })}
                placeholder="e.g. 5"
              />
              {errors.quantity && (
                <span className="text-red-600 text-xs">{errors.quantity.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <Select
                {...register("unit", { required: "Required" })}
                className="w-full"
              >
                <option value="quantity">Quantity</option>
                <option value="kg">kg</option>
                <option value="gram">gram</option>
              </Select>
              {errors.unit && (
                <span className="text-red-600 text-xs">{errors.unit.message}</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Used <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              {...register("usage_date", { required: "Date is required" })}
            />
            {errors.usage_date && (
              <span className="text-red-600 text-xs">{errors.usage_date.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason / Note <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              {...register("note")}
              rows={2}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="e.g. Used for dinner service"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Record Usage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
