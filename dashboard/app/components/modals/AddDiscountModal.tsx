import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Calendar, X, Percent } from "lucide-react";

interface Discount {
  id: string;
  name: string;
  discount_type: string;
  discount_value: number;
  description: string;
  expiry_date: string;
}

interface AddDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (discount: Omit<Discount, "id">) => void;
  newDiscount: Omit<Discount, "id">;
  setNewDiscount: (discount: Omit<Discount, "id">) => void;
}

export default function AddDiscountModal({
  isOpen,
  onClose,
  onAdd,
  newDiscount,
  setNewDiscount,
}: AddDiscountModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newDiscount);
    setNewDiscount({ name: "", discount_type: "", discount_value: 0, description: "", expiry_date: "" });
  };

  const handleClose = () => {
    onClose();
    setNewDiscount({ name: "", discount_type: "", discount_value: 0, description: "", expiry_date: "" });
  };

  const formatDateForInput = (date: string) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  const handleDateChange = (dateValue: string) => {
    const isoDate = new Date(dateValue).toISOString();
    setNewDiscount({ ...newDiscount, expiry_date: isoDate });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Add New Discount</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Discount Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter discount name"
                value={newDiscount.name}
                onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                className="h-11"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type" className="text-sm font-semibold text-gray-700">
                  Discount Type *
                </Label>
                <select 
                  value={newDiscount.discount_type} 
                  onChange={(e) => setNewDiscount({ ...newDiscount, discount_type: e.target.value })}
                  className="h-11 w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                  required
                >
                  <option value="" disabled>Select discount type</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value" className="text-sm font-semibold text-gray-700">
                  Discount Value *
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  step={newDiscount.discount_type === "percentage" ? "1" : "0.01"}
                  max={newDiscount.discount_type === "percentage" ? "100" : undefined}
                  placeholder={newDiscount.discount_type === "percentage" ? "Enter percentage" : "Enter amount"}
                  value={newDiscount.discount_value || ""}
                  onChange={(e) => setNewDiscount({ ...newDiscount, discount_value: parseFloat(e.target.value) || 0 })}
                  className="h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date" className="text-sm font-semibold text-gray-700">
                Expiry Date *
              </Label>
              <div className="relative w-full">
                <Input
                  id="expiry_date"
                  type="datetime-local"
                  value={formatDateForInput(newDiscount.expiry_date)}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="h-11 w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  required
                />
                <Calendar 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter discount description..."
                value={newDiscount.description}
                onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                className="min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            {newDiscount.discount_type && newDiscount.discount_value > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Preview</span>
                </div>
                <p className="text-sm text-blue-700">
                  Customers will get{" "}
                  <span className="font-semibold">
                    {newDiscount.discount_type === "percentage" 
                      ? `${newDiscount.discount_value}% off` 
                      : `$${newDiscount.discount_value} off`
                    }
                  </span>
                  {newDiscount.expiry_date && (
                    <span>
                      {" "}until {new Date(newDiscount.expiry_date).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="px-6 bg-orange-600 hover:bg-orange-700"
              disabled={!newDiscount.name.trim() || !newDiscount.discount_type || newDiscount.discount_value <= 0}
            >
              Add Discount
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}