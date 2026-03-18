import { useEffect, useState } from "react";
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";
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

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(val);

export default function UseStockPage() {
  const navigate = useNavigate();

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
  }, []);

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

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

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
      navigate("/dashboard/kitchen-stock");
    } else {
      setSubmitError(
        `Failed to record usage for: ${failures.join(", ")}. Successful items were saved.`
      );
    }
  };

  const itemTypeMap = Object.fromEntries(
    kitchenItems.map((ki) => [ki.id, ki.type])
  );

  const filteredItems = summaryItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const cartCount = cartItems.length;

  return (
    <PermissionGuard permission="kitchen_stock.create">
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/kitchen-stock">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Record Stock Usage
              {cartCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <ShoppingCart className="w-3 h-3" />
                  {cartCount} {cartCount === 1 ? "item" : "items"} in cart
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Select items and quantities to record daily usage
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/kitchen-stock">
            <Button variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
            disabled={cartItems.length === 0 || submitting || !usageDate}
            onClick={handleSubmit}
          >
            {submitting
              ? "Saving..."
              : `Record Usage${cartCount > 0 ? ` (${cartCount})` : ""}`}
          </Button>
        </div>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Item Browser */}
        <div className="w-[58%] flex flex-col border-r bg-white">
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
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
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

                    {isExpanded && (
                      <div className="bg-gray-50 px-4 pb-3 space-y-2">
                        {isBatchLoading ? (
                          <div className="py-2 space-y-1.5">
                            {[1, 2].map((i) => (
                              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
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
                              <div className="min-w-0">
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
                                  {batch.unit !== "quantity" ? batch.unit : "units"} —{" "}
                                  {formatCurrency(batch.purchase_price)}
                                  {batch.quantity > 0 && (
                                    <span className="text-gray-400">
                                      {" "}({formatCurrency(batch.purchase_price / batch.quantity)}/unit)
                                    </span>
                                  )}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-2 shrink-0 ml-3"
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
        <div className="w-[42%] flex flex-col bg-white">
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
                <ShoppingCart className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No items added yet</p>
                <p className="text-xs mt-1">Browse items on the left and click Add.</p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Column headers */}
                <div className="px-4 py-2 bg-gray-50 grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center text-xs font-medium text-gray-500">
                  <span>Item</span>
                  <span className="w-20 text-right">Unit Price</span>
                  <span className="w-24 text-center">Qty</span>
                  <span className="w-16">Unit</span>
                  <span className="w-20 text-right">Subtotal</span>
                </div>
                {cartItems.map((item) => {
                  const subtotal = item.quantity * item.unit_price;
                  return (
                    <div key={item.kitchen_item_id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-800 flex-1 leading-tight">
                          {item.kitchen_item_name}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.kitchen_item_id)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Unit price */}
                        <span className="text-xs text-gray-500 w-20 text-right shrink-0">
                          {item.unit_price > 0 ? formatCurrency(item.unit_price) : "—"}
                        </span>
                        {/* Quantity Stepper */}
                        <div className="flex items-center border rounded overflow-hidden shrink-0">
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
                            className="w-12 text-center text-sm border-x py-1 focus:outline-none"
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
                          className="text-xs py-1 h-8 w-16 shrink-0"
                        >
                          <option value="quantity">qty</option>
                          <option value="kg">kg</option>
                          <option value="gram">gram</option>
                        </Select>
                        {/* Subtotal */}
                        <span className="text-sm font-semibold text-gray-800 w-20 text-right shrink-0">
                          {item.unit_price > 0 ? formatCurrency(subtotal) : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Grand Total */}
                {grandTotal > 0 && (
                  <div className="px-4 py-3 bg-amber-50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-800">Grand Total</span>
                    <span className="text-base font-bold text-amber-900">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shared Fields */}
          <div className="border-t px-4 py-3 space-y-2 bg-white shrink-0">
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
    </div>
    </PermissionGuard>
  );
}
