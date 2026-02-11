import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import type { KitchenStock } from "~/types/KitchenStock";

interface EditStockModalProps {
  open: boolean;
  onClose: () => void;
  stock: KitchenStock;
  onEdited: (data: Partial<KitchenStock>) => Promise<void>;
}

const EditStockModal: React.FC<EditStockModalProps> = ({ open, onClose, stock, onEdited }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Partial<KitchenStock>>({
    defaultValues: {
      kitchen_item_id: stock.kitchen_item.id,
      quantity: stock.quantity,
      price: Number(stock.price),
      description: stock.description,
    },
  });
  const [apiError, setApiError] = React.useState<string>("");

  React.useEffect(() => {
    reset({
      kitchen_item_id: stock.kitchen_item.id,
      quantity: stock.quantity,
      price: Number(stock.price),
      description: stock.description,
    });
    setApiError("");
  }, [stock, reset]);

  if (!open) return null;

  const onSubmit = async (data: Partial<KitchenStock>) => {
    setApiError("");
    try {
      const payload = { ...data, price: Number(data.price) };
      await onEdited(payload);
      reset();
      onClose();
    } catch (error: any) {
      let message = "Failed to update stock.";
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (typeof error === "string") {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setApiError(message);
      console.error("Error editing stock:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Edit Kitchen Stock</h3>
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
                <div className="flex items-center gap-3">
                    {stock.kitchen_item?.image ? (
                        <img
                        src={stock.kitchen_item.image}
                        alt={stock.kitchen_item.name}
                        className="w-12 h-12 rounded object-cover border"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                        No Image
                        </div>
                    )}
                    <div>
                        <span className="font-medium block">{stock.kitchen_item?.name || '-'}</span>
                        <span className="text-sm text-gray-500 block">{stock.kitchen_item?.name_bn || '-'}</span>
                        <span className="text-xs text-gray-400 block">
                          {stock.created_at ?
                            (() => {
                              const d = new Date(stock.created_at);
                              const day = d.getDate();
                              const month = d.toLocaleString('en-US', { month: 'short' });
                              const year = d.getFullYear();
                              let hour = d.getHours();
                              const min = d.getMinutes().toString().padStart(2, '0');
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              hour = hour % 12;
                              hour = hour ? hour : 12; 
                              const hourStr = hour.toString().padStart(2, '0');
                              return `Added: ${day} ${month} ${year} : ${hourStr}:${min} ${ampm}`;
                            })()
                            : ''}
                        </span>
                    </div>
                </div>
              <input
                type="hidden"
                value={stock.kitchen_item.id}
                readOnly
                className="h-11 w-full px-3 py-2 text-sm border border-gray-200 bg-gray-100 rounded-md text-gray-500 cursor-not-allowed"
                tabIndex={-1}
              />
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
                <label className="block text-sm font-semibold text-gray-700">Price *</label>
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStockModal;
