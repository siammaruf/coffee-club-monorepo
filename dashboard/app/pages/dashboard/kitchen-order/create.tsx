import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import kitchenStockService from "~/services/httpServices/kitchenStockService";
import type { KitchenStock } from "~/types/KitchenStock";
import { useNavigate } from "react-router";
import { kitchenOrderService } from "~/services/httpServices/kitchenOrderService";
import { Coffee, X } from "lucide-react";

export default function CreateKitchenOrderPage() {
  const [stocks, setStocks] = useState<KitchenStock[]>([]);
  type OrderItem = {
    kitchen_stock_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  };
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isApproved, setIsApproved] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [newItemStockId, setNewItemStockId] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await kitchenStockService.getAll();
      setStocks((res as any)?.data || []);
    } catch {
      setStocks([]);
    }
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    if (field === "kitchen_stock_id") {
      const alreadySelected = orderItems.some(
        (item, i) => item.kitchen_stock_id === value && i !== idx
      );
      if (alreadySelected) {
        setApiError("You cannot select the same stock item more than once.");
        return;
      } else {
        setApiError("");
      }
    }

    setOrderItems(items =>
      items.map((item, i) => {
        if (i !== idx) return item;
        let updated = { ...item, [field]: value };

        if (field === "kitchen_stock_id") {
          const selectedStock = stocks.find(s => s.id === value);
          updated.unit_price = selectedStock?.price ?? 0;
        }

        const quantity = field === "quantity" ? value : updated.quantity;
        const unitPrice = field === "unit_price" ? value : updated.unit_price;
        updated.total_price = Number(quantity) * Number(unitPrice);

        return updated;
      })
    );
  };

  const handleRemoveItem = (idx: number) => {
    setOrderItems(items => items.filter((_, i) => i !== idx));
  };

  const handleAddItem = () => {
    if (!newItemStockId) return;
    if (orderItems.some(item => item.kitchen_stock_id === newItemStockId)) {
      setApiError("You cannot select the same stock item more than once.");
      return;
    }
    const selectedStock = stocks.find(s => s.id === newItemStockId);
    const unitPrice = selectedStock?.price ?? 0;
    setOrderItems([
      ...orderItems,
      {
        kitchen_stock_id: newItemStockId,
        quantity: newItemQty,
        unit_price: unitPrice,
        total_price: unitPrice * newItemQty
      }
    ]);
    setNewItemStockId("");
    setNewItemQty(1);
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (orderItems.length === 0) {
      setApiError("Please add at least one item to the order.");
      return;
    }
    if (orderItems.some(item => !item.kitchen_stock_id || item.quantity < 1)) {
      setApiError("Please select a product and enter a valid quantity for all items.");
      return;
    }
    setLoading(true);
    try {
      await kitchenOrderService.create({
        order_items: orderItems.map(item => ({
          kitchen_stock_id: item.kitchen_stock_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price)
        })),
        is_approved: isApproved,
        description
      });
      navigate("/dashboard/kitchen-orders");
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-1 px-3 py-1"
            onClick={() => navigate(-1)}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 9H3M9 15l-6-6 6-6" />
            </svg>
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 items-center gap-2">
            Create Kitchen Order
            <p className="text-gray-500 text-sm font-normal block">Fill in the details to create a new kitchen order.</p>
          </h1>
        </div>
        {apiError && (
        <div className="p-4 rounded bg-red-100 text-red-700 border mb-6 border-red-200 text-xs w-full">
            {apiError}
        </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 w-full">
          <div className="border rounded-xl p-6 w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Order Items</h2>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                className="border border-gray-300 rounded px-2 py-2 text-sm min-w-[180px]"
                value={newItemStockId}
                onChange={e => setNewItemStockId(e.target.value)}
              >
                <option value="">Select Product</option>
                {stocks
                  .filter(stock => !orderItems.some(item => item.kitchen_stock_id === stock.id))
                  .map(stock => (
                    <option key={stock.id} value={stock.id}>
                      {stock.kitchen_item?.name} ({stock.kitchen_item?.name_bn}) - Available: {stock.quantity}
                    </option>
                  ))}
              </select>
              <Input
                type="number"
                min={1}
                value={newItemQty}
                onChange={e => setNewItemQty(Number(e.target.value))}
                className="w-16 text-center"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddItem}
                disabled={!newItemStockId}
              >
                + Add Item
              </Button>
            </div>
            <div className="space-y-4">
              {orderItems.map((item, idx) => {
                const selectedStock = stocks.find(s => s.id === item.kitchen_stock_id);
                return (
                  <div key={idx} className="flex flex-wrap items-center gap-3 border rounded-lg p-3 bg-white justify-between">
                    <div className="min-w-[180px] font-medium">
                      <div className="flex items-center gap-3">
                        <div>
                          {selectedStock?.kitchen_item.image ? (
                            <img
                              src={selectedStock.kitchen_item.image}
                              alt={selectedStock.kitchen_item.name}
                              className="w-14 h-14 rounded object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded bg-gray-200 flex items-center justify-center">
                              <Coffee className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-800 block -mt-[4px]">{selectedStock?.kitchen_item?.name} - <small className="text-gray-500 text-xs">Available: {selectedStock?.quantity}</small></span>
                          <span className="text-gray-500 block text-sm"> {selectedStock?.kitchen_item?.name_bn}</span>
                          <small className="text-green-600 block text-xs">
                            {selectedStock?.created_at ? (() => {
                              const d = new Date(selectedStock.created_at);
                              const day = d.getDate();
                              const daySuffix =
                                day === 1 || day === 21 || day === 31 ? "st" :
                                day === 2 || day === 22 ? "nd" :
                                day === 3 || day === 23 ? "rd" : "th";
                              const month = d.toLocaleString('en-US', { month: 'long' });
                              const year = d.getFullYear();
                              let hour = d.getHours();
                              const min = d.getMinutes().toString().padStart(2, '0');
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              hour = hour % 12;
                              hour = hour ? hour : 12;
                              const hourStr = hour.toString().padStart(2, '0');
                              return `${day}${daySuffix} ${month} ${year}, ${hourStr}:${min} ${ampm}`;
                            })() : "-"}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleItemChange(idx, "quantity", Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={selectedStock?.quantity ?? 1}
                        value={item.quantity}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (selectedStock && val > selectedStock.quantity) {
                            handleItemChange(idx, "quantity", selectedStock.quantity);
                          } else {
                            handleItemChange(idx, "quantity", val);
                          }
                        }}
                        className="w-24 text-center mx-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleItemChange(idx, "quantity", item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="min-w-[70px] text-right font-semibold text-gray-700">
                      ৳{selectedStock?.price ?? 0}
                    </div>
                    <div className="min-w-[70px] text-right font-semibold text-gray-700">
                      ৳{item.total_price}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(idx)}
                      aria-label="Remove"
                      className="bg-red-500 hover:bg-red-600 text-red-600 rounded-sm p-1 text-white cursor-pointer"
                    >
                      <X className="w-5 h-5 text-white" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border rounded-xl p-4 w-full flex flex-col bg-white self-start">
            <div>
              <h2 className="text-base font-semibold mb-3 text-gray-800">Note</h2>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
              <p className="text-sm text-gray-500">Note: The order will be in pending state until approved.</p>
            </div>
            <div className="flex flex-col gap-2 mt-8">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" disabled={loading}>
                {loading ? "Saving..." : "Create Order"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}