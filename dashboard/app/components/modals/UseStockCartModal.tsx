import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { kitchenStockService } from "~/services/httpServices/kitchenStockService";
import { kitchenItemsService } from "~/services/httpServices/kitchenItemsService";
import type {
  KitchenStockSummaryItem,
  KitchenStockEntry,
  UsageCartItem,
} from "~/types/kitchenStock";
import type { KitchenItem } from "~/types/kitchenItem";

interface UseStockCartModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const today = new Date().toISOString().split("T")[0];

function isNewBatch(purchaseDate: string): boolean {
  return (Date.now() - new Date(purchaseDate).getTime()) / 86400000 <= 7;
}

function typeBadge(type: string) {
  return type === "KITCHEN" ? (
    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
      Kitchen
    </span>
  ) : (
    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
      Bar
    </span>
  );
}

export default function UseStockCartModal({
  open,
  onClose,
  onSuccess,
}: UseStockCartModalProps) {
  const [summaryItems, setSummaryItems] = useState<KitchenStockSummaryItem[]>([]);
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const [batchCache, setBatchCache] = useState<Record<string, KitchenStockEntry[]>>({});
  const [batchLoading, setBatchLoading] = useState<Record<string, boolean>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState<UsageCartItem[]>([]);
  const [usageDate, setUsageDate] = useState(today);
  const [sessionNote, setSessionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCartItems([]);
    setExpandedItemId(null);
    setBatchCache({});
    setBatchLoading({});
    setSearch("");
    setUsageDate(today);
    setSessionNote("");
    setSubmitError(null);

    setDataLoading(true);
    Promise.all([
      kitchenStockService.getSummary(),
      kitchenItemsService.getAll({ limit: 200 }),
    ])
      .then(([summaryRes, itemsRes]) => {
        setSummaryItems((summaryRes as any)?.data || []);
        setKitchenItems((itemsRes as any)?.data || []);
      })
      .finally(() => setDataLoading(false));
  }, [open]);

  const handleExpand = async (item: KitchenStockSummaryItem) => {
    if (expandedItemId === item.kitchen_item_id) {
      setExpandedItemId(null);
      return;
    }
    setExpandedItemId(item.kitchen_item_id);
    if (batchCache[item.kitchen_item_id]) return;

    setBatchLoading((prev) => ({ ...prev, [item.kitchen_item_id]: true }));
    try {
      const res = await kitchenStockService.getAll({
        kitchen_item_id: item.kitchen_item_id,
        entry_type: "PURCHASE",
        limit: 50,
      });
      const batches: KitchenStockEntry[] = (res as any)?.data || [];
      // Sort newest first
      batches.sort(
        (a, b) =>
          new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()
      );
      setBatchCache((prev) => ({ ...prev, [item.kitchen_item_id]: batches }));
    } finally {
      setBatchLoading((prev) => ({ ...prev, [item.kitchen_item_id]: false }));
    }
  };

  const addToCart = (item: KitchenStockSummaryItem, batch: KitchenStockEntry) => {
    const unit_price = batch.quantity > 0 ? batch.purchase_price / batch.quantity : 0;
    setCartItems((prev) => {
      const existing = prev.find((c) => c.kitchen_item_id === item.kitchen_item_id);
      if (existing) {
        return prev.map((c) =>
          c.kitchen_item_id === item.kitchen_item_id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          kitchen_item_id: item.kitchen_item_id,
          kitchen_item_name: item.name,
          quantity: 1,
          unit: batch.unit,
          unit_price,
        },
      ];
    });
  };

  const updateCartQty = (kitchen_item_id: string, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((c) => c.kitchen_item_id !== kitchen_item_id));
    } else {
      setCartItems((prev) =>
        prev.map((c) =>
          c.kitchen_item_id === kitchen_item_id ? { ...c, quantity: qty } : c
        )
      );
    }
  };

  const updateCartUnit = (kitchen_item_id: string, unit: string) => {
    setCartItems((prev) =>
      prev.map((c) =>
        c.kitchen_item_id === kitchen_item_id ? { ...c, unit } : c
      )
    );
  };

  const removeFromCart = (kitchen_item_id: string) => {
    setCartItems((prev) => prev.filter((c) => c.kitchen_item_id !== kitchen_item_id));
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    const failures: string[] = [];
    const results = await Promise.allSettled(
      cartItems.map((item) =>
        kitchenStockService.recordUsage({
          kitchen_item_id: item.kitchen_item_id,
          quantity: item.quantity,
          unit: item.unit,
          purchase_date: usageDate,
          note: sessionNote || undefined,
          entry_type: "USAGE",
        })
      )
    );

    results.forEach((result, idx) => {
      if (result.status === "rejected") {
        failures.push(cartItems[idx].kitchen_item_name);
      }
    });

    setSubmitting(false);

    if (failures.length === 0) {
      onSuccess();
    } else {
      setSubmitError(
        `Failed to record usage for: ${failures.join(", ")}. Successful items were saved.`
      );
    }
  };

  // Build display list from summary, enriched with kitchen item type
  const itemTypeMap = Object.fromEntries(
    kitchenItems.map((ki) => [ki.id, ki.type])
  );

  const filteredItems = summaryItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const cartCount = cartItems.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Record Stock Usage
              {cartCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <ShoppingCart className="w-3 h-3" />
                  {cartCount} {cartCount === 1 ? "item" : "items"} in cart
                </span>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row h-auto sm:h-[560px]">
          {/* Left Panel — Item Browser */}
          <div className="w-full sm:w-[58%] flex flex-col border-r">
            <div className="px-4 py-3 border-b">
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {dataLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No items found
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedItemId === item.kitchen_item_id;
                  const batches = batchCache[item.kitchen_item_id] || [];
                  const isBatchLoading = batchLoading[item.kitchen_item_id];
                  const itemType = itemTypeMap[item.kitchen_item_id] || item.type;

                  return (
                    <div key={item.kitchen_item_id} className="border-b last:border-b-0">
                      {/* Item Row */}
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => handleExpand(item)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                          <span className="font-medium text-sm truncate">{item.name}</span>
                          {typeBadge(itemType)}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              item.is_low_stock
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.total_quantity} in stock
                          </span>
                        </div>
                      </button>

                      {/* Batch Cards */}
                      {isExpanded && (
                        <div className="bg-gray-50 px-4 pb-3 space-y-2">
                          {isBatchLoading ? (
                            <div className="py-2 space-y-1.5">
                              {[1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="h-12 bg-gray-200 rounded animate-pulse"
                                />
                              ))}
                            </div>
                          ) : batches.length === 0 ? (
                            <p className="text-xs text-gray-400 py-2 text-center">
                              No purchase batches found
                            </p>
                          ) : (
                            batches.map((batch) => (
                              <div
                                key={batch.id}
                                className="flex items-center justify-between bg-white rounded border px-3 py-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-medium text-gray-700">
                                        {batch.purchase_date}
                                      </span>
                                      {isNewBatch(batch.purchase_date) && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                                          New
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {batch.quantity}{" "}
                                      {batch.unit !== "quantity" ? batch.unit : "units"}{" "}
                                      purchased
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-2 shrink-0"
                                  onClick={() => addToCart(item, batch)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel — Cart */}
          <div className="w-full sm:w-[42%] flex flex-col">
            <div className="px-4 py-3 border-b bg-amber-50">
              <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4" />
                Usage Cart
              </h3>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center">
                  <ShoppingCart className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No items added yet.</p>
                  <p className="text-xs mt-1">
                    Browse items on the left and click Add.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.kitchen_item_id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-800 leading-tight">
                          {item.kitchen_item_name}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.kitchen_item_id)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border rounded overflow-hidden">
                          <button
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                            onClick={() =>
                              updateCartQty(item.kitchen_item_id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) updateCartQty(item.kitchen_item_id, val);
                            }}
                            className="w-14 text-center text-sm border-x py-1 focus:outline-none"
                          />
                          <button
                            className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                            onClick={() =>
                              updateCartQty(item.kitchen_item_id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Unit */}
                        <Select
                          value={item.unit}
                          onChange={(e) =>
                            updateCartUnit(item.kitchen_item_id, e.target.value)
                          }
                          className="text-xs py-1 h-8"
                        >
                          <option value="quantity">qty</option>
                          <option value="kg">kg</option>
                          <option value="gram">gram</option>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shared Fields */}
            <div className="border-t px-4 py-3 space-y-2 bg-white">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Date Used <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={usageDate}
                  onChange={(e) => setUsageDate(e.target.value)}
                  className="text-sm h-8"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Note <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Dinner service"
                  className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
                />
              </div>
              {submitError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1.5">
                  {submitError}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
            disabled={cartItems.length === 0 || submitting || !usageDate}
            onClick={handleSubmit}
          >
            {submitting
              ? "Saving..."
              : `Record Usage${cartCount > 0 ? ` (${cartCount})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
