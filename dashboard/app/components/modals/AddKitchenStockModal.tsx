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
import type { CreateKitchenStockInput } from "~/types/kitchenStock";

interface StockForm {
  kitchen_item_id: string;
  quantity: number;
  unit: string;
  purchase_price: number;
  purchase_date: string;
  note: string;
}

interface AddKitchenStockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCreate: (data: CreateKitchenStockInput) => Promise<void>;
}

export default function AddKitchenStockModal({
  open,
  onClose,
  onSuccess,
  onCreate,
}: AddKitchenStockModalProps) {
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<StockForm>({
    defaultValues: {
      kitchen_item_id: "",
      quantity: 0,
      unit: "quantity",
      purchase_price: 0,
      purchase_date: new Date().toISOString().split("T")[0],
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

  const onSubmit = async (data: StockForm) => {
    try {
      await onCreate({
        ...data,
        quantity: Number(data.quantity),
        unit: data.unit,
        purchase_price: Number(data.purchase_price),
        note: data.note || undefined,
      });
      reset();
      onSuccess();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to add stock entry",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock Entry</DialogTitle>
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
                placeholder="e.g. 10"
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
              placeholder="e.g. 250.00"
            />
            {errors.purchase_price && (
              <span className="text-red-600 text-xs">{errors.purchase_price.message}</span>
            )}
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
              placeholder="e.g. Monthly purchase from supplier"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
