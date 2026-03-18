import { useEffect, useState } from "react";
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { kitchenStockService } from "~/services/httpServices/kitchenStockService";
import { kitchenItemsService } from "~/services/httpServices/kitchenItemsService";
import type {
  KitchenStockEntry,
  KitchenStockSummaryItem,
} from "~/types/kitchenStock";
import type { KitchenItem } from "~/types/kitchenItem";

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

export default function EditUsagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<KitchenStockEntry | null>(null);
  const [summaryItems, setSummaryItems] = useState<KitchenStockSummaryItem[]>([]);
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const [batchCache, setBatchCache] = useState<Record<string, KitchenStockEntry[]>>({});
  const [batchLoading, setBatchLoading] = useState<Record<string, boolean>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Editable fields
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("quantity");
  const [usageDate, setUsageDate] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      kitchenStockService.getById(id),
      kitchenStockService.getSummary(),
      kitchenItemsService.getAll({ limit: 200 }),
    ])
      .then(([entryRes, summaryRes, itemsRes]) => {
        const e = (entryRes as any)?.data as KitchenStockEntry;
        setEntry(e);
        setQuantity(e?.quantity ?? 1);
        setUnit(e?.unit ?? "quantity");
        setUsageDate(e?.purchase_date ?? "");
        setNote(e?.note ?? "");
        setSummaryItems((summaryRes as any)?.data || []);
        setKitchenItems((itemsRes as any)?.data || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await kitchenStockService.update(id, {
        quantity,
        unit,
        purchase_date: usageDate,
        note: note || undefined,
      });
      navigate("/dashboard/kitchen-stock");
    } catch {
      setSubmitError("Failed to update usage entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const itemTypeMap = Object.fromEntries(
    kitchenItems.map((ki) => [ki.id, ki.type])
  );

  const filteredItems = summaryItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[58%] p-4 space-y-3 border-r bg-white">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
          <div className="w-[42%] p-4 space-y-3 bg-white">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center text-gray-500">
        <p className="text-sm mb-3">Usage entry not found.</p>
        <Link to="/dashboard/kitchen-stock">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Stock
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <PermissionGuard permission="kitchen_stock.edit">
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
            <h1 className="text-xl font-bold">Edit Stock Usage</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Modify the usage record for <span className="font-medium">{entry.kitchen_item?.name}</span>
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
            disabled={submitting || !usageDate}
            onClick={handleSubmit}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Stock Browser (reference) */}
        <div className="w-[58%] flex flex-col border-r bg-white">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Current Stock Levels
            </span>
          </div>
          <div className="px-4 py-2 border-b">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
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
                        {item.kitchen_item_id === entry.kitchen_item_id && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">
                            Editing
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ml-2 ${
                          item.is_low_stock
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.total_quantity} in stock
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50 px-4 pb-3 space-y-2">
                        {isBatchLoading ? (
                          <div className="py-2 space-y-1.5">
                            {[1, 2].map((i) => (
                              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
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
                              <div>
                                <span className="text-xs font-medium text-gray-700">
                                  {batch.purchase_date}
                                </span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {batch.quantity}{" "}
                                  {batch.unit !== "quantity" ? batch.unit : "units"} purchased
                                </p>
                              </div>
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

        {/* Right Panel — Edit Form */}
        <div className="w-[42%] flex flex-col bg-white">
          <div className="px-4 py-3 border-b bg-amber-50">
            <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4" />
              Usage Details
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Editing item */}
            <div className="px-4 py-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-800">
                  {entry.kitchen_item?.name}
                </span>
                {typeBadge(entry.kitchen_item?.type || "")}
              </div>
              <div className="flex items-center gap-2">
                {/* Quantity Stepper */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center border rounded overflow-hidden">
                    <button
                      className="px-2 py-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                      onClick={() => setQuantity((q) => Math.max(0.01, parseFloat((q - 1).toFixed(2))))}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) setQuantity(val);
                      }}
                      className="w-16 text-center text-sm border-x py-1.5 focus:outline-none"
                    />
                    <button
                      className="px-2 py-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                      onClick={() => setQuantity((q) => parseFloat((q + 1).toFixed(2)))}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {/* Unit */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Unit
                  </label>
                  <Select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="text-xs py-1 h-9 w-20"
                  >
                    <option value="quantity">qty</option>
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Fields */}
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
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
