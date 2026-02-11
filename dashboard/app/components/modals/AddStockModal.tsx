import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import type { AddStockModalProps, KitchenStock } from "~/types/KitchenStock";
import { kitchenItemsService } from "~/services/httpServices/kitchenItemsService";

const AddStockModal: React.FC<AddStockModalProps> = ({ open, onClose, onAdded }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Omit<KitchenStock, "id">>({
    defaultValues: {
      kitchen_item_id: "",
      quantity: 0,
      price: 0,
      description: "",
    },
  });
  const [apiError, setApiError] = React.useState<string>("");
  const [kitchenItems, setKitchenItems] = React.useState<{ id: string; name: string; name_bn?: string }[]>([]);
  const [isLoadingItems, setIsLoadingItems] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsLoadingItems(true);
      kitchenItemsService.getAll()
        .then((res: any) => {
          const items = (res?.data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            name_bn: item.name_bn,
          }));
          setKitchenItems(items);
        })
        .catch(() => setKitchenItems([]))
        .finally(() => setIsLoadingItems(false));
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = async (data: Omit<KitchenStock, "id">) => {
    setApiError("");
    try {
      await onAdded(data);
      reset();
      onClose();
    } catch (error: any) {
      let message = "Failed to add stock.";
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (typeof error === "string") {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setApiError(message);
      console.error("Error adding stock:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Add Kitchen Stock</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            ×
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {apiError && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200 text-sm">
              {apiError}
            </div>
          )}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Kitchen Item *</label>
              <select
                className="h-11 w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                {...register("kitchen_item_id", { required: true })}
                required
                disabled={isLoadingItems}
              >
                <option value="">{isLoadingItems ? "Loading..." : "Select kitchen item"}</option>
                {kitchenItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ( {item.name_bn} )</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Quantity *</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Quantity"
                  className="h-11 w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("quantity", { required: true, valueAsNumber: true })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Unit Price *</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Price"
                  className="h-11 w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("price", { required: true, valueAsNumber: true })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                placeholder="Enter description..."
                className="min-h-[80px] resize-none w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                {...register("description")}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button type="submit" className="px-6 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
