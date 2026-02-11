import React from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import type { KitchenStock } from "~/types/KitchenStock";

interface AddKitchenOrderModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { kitchen_stock_id: string; quantity: number; description: string }) => Promise<void>;
  stocks: KitchenStock[];
  apiError: string;
  isLoading?: boolean;
}

export default function AddKitchenOrderModal({ open, onClose, onAdd, stocks, apiError, isLoading }: AddKitchenOrderModalProps) {
  const [form, setForm] = React.useState({ kitchen_stock_id: "", quantity: 0, description: "" });
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(form);
  };

  React.useEffect(() => {
    if (!open) {
      setForm({ kitchen_stock_id: "", quantity: 0, description: "" });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-gray-100">
        <h3 className="text-2xl font-extrabold text-primary mb-6 tracking-tight">Add Kitchen Order</h3>
        {apiError && <div className="mb-4 px-3 py-2 rounded-lg bg-red-100 text-red-700 border border-red-200 text-xs text-base">{apiError}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-semibold mb-2 text-gray-700">Stock Item <span className="text-red-500">*</span></label>
            <div className="relative">
              <button
                type="button"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-left bg-white flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                onClick={() => setShowDropdown(v => !v)}
                tabIndex={0}
              >
                <span className="flex items-center gap-3">
                  {(() => {
                    const selected = stocks.find(s => s.id === form.kitchen_stock_id);
                    if (!selected) return <span className="text-gray-400">Select Stock Item</span>;
                    const name = selected.kitchen_item?.name || "";
                    const nameBn = selected.kitchen_item?.name_bn ? ` (${selected.kitchen_item.name_bn})` : "";
                    let dateStr = "";
                    if (selected.created_at) {
                      const d = new Date(selected.created_at);
                      let hour = d.getHours();
                      const min = d.getMinutes().toString().padStart(2, '0');
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      hour = hour % 12;
                      hour = hour ? hour : 12;
                      const hourStr = hour.toString().padStart(2, '0');
                      const day = d.getDate();
                      const month = d.toLocaleString('en-US', { month: 'short' });
                      const year = d.getFullYear();
                      dateStr = `${day} ${month} ${year} : ${hourStr}:${min} ${ampm}`;
                    }
                    return (
                      <>
                        {selected.kitchen_item?.image && (
                          <img src={selected.kitchen_item.image} alt={name} className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow" />
                        )}
                        <span className="font-semibold text-gray-900">{name}</span>
                        <span className="text-xs text-gray-500">{nameBn}</span>
                        <span className="text-xs text-gray-400">{dateStr}</span>
                      </>
                    );
                  })()}
                </span>
                <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-2 max-h-80 overflow-y-auto p-2">
                  {stocks.map(stock => {
                    const name = stock.kitchen_item?.name || "";
                    const nameBn = stock.kitchen_item?.name_bn ? ` (${stock.kitchen_item.name_bn})` : "";
                    let dateStr = "";
                    if (stock.created_at) {
                      const d = new Date(stock.created_at);
                      let hour = d.getHours();
                      const min = d.getMinutes().toString().padStart(2, '0');
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      hour = hour % 12;
                      hour = hour ? hour : 12;
                      const hourStr = hour.toString().padStart(2, '0');
                      const day = d.getDate();
                      const month = d.toLocaleString('en-US', { month: 'short' });
                      const year = d.getFullYear();
                      dateStr = `${day} ${month} ${year} : ${hourStr}:${min} ${ampm}`;
                    }
                    const isSelected = form.kitchen_stock_id === stock.id;
                    return (
                      <div
                        key={stock.id}
                        className={`flex items-center gap-2 px-4 py-3 cursor-pointer rounded-xl transition-all border-b last:border-b-0 ${isSelected ? 'bg-primary/10' : 'hover:bg-gray-10 border-transparent'}`}
                        style={{ boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.04)' : undefined }}
                        onClick={() => { setForm(f => ({ ...f, kitchen_stock_id: stock.id })); setShowDropdown(false); }}
                      >
                        {stock.kitchen_item?.image && (
                          <img src={stock.kitchen_item.image} alt={name} className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow" />
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-semibold text-gray-900 -mt-[4px] truncate">{name} <small className="text-xs text-gray-500 truncate">{nameBn}</small></span>
                          <span className="text-xs text-gray-400 truncate">{dateStr}</span>
                          <span className="text-xs text-green-600 truncate">Available: {stock.quantity}</span>
                        </div>
                        {isSelected && <span className="ml-2 text-primary font-bold">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-gray-700">Quantity <span className="text-red-500">*</span></label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-2 text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            />
          </div>
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-8 py-3 text-base rounded-lg">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="px-8 py-3 text-base rounded-lg bg-primary hover:bg-primary/90">Add Order</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
