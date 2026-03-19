import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Coffee, Utensils, Info, Tag, FileText, AlertTriangle, Calendar } from "lucide-react";
import type { KitchenItem } from "~/types/kitchenItem";
import type { JSX } from "react";

interface ViewKitchenItemModalProps {
  open: boolean;
  onClose: () => void;
  item: KitchenItem | null;
}

const typeConfig: Record<string, { icon: JSX.Element; className: string; label: string }> = {
  KITCHEN: {
    icon: <Utensils className="w-3.5 h-3.5" />,
    className: "bg-emerald-100 text-emerald-700",
    label: "Kitchen",
  },
  BAR: {
    icon: <Coffee className="w-3.5 h-3.5" />,
    className: "bg-amber-100 text-amber-700",
    label: "Bar",
  },
};

export default function ViewKitchenItemModal({ open, onClose, item }: ViewKitchenItemModalProps) {
  if (!item) return null;

  const type = typeConfig[item.type] || typeConfig.KITCHEN;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Kitchen Item Details
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Image + Name */}
          <div className="flex items-center gap-4">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border">
                <Coffee className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              {item.name_bn && (
                <p className="text-sm text-gray-500">{item.name_bn}</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`flex items-center gap-1.5 px-3 py-1 ${type.className}`}>
              {type.icon}
              {type.label}
            </Badge>
            {item.low_stock_threshold != null && (
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 text-orange-600 border-orange-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                Low Stock: {item.low_stock_threshold}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Tag className="w-4 h-4 shrink-0" />
              <span className="font-medium">Slug:</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{item.slug}</code>
            </div>
            <div className="flex items-start gap-2 text-gray-700">
              <FileText className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium shrink-0">Description:</span>
              <span>{item.description || <span className="text-gray-400">No description</span>}</span>
            </div>
            {item.created_at && (
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="font-medium">Created:</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
