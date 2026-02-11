import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Users, MapPin, Info, Calendar, UserCircle2, CheckCircle, XCircle, Clock } from "lucide-react";
import type { RestaurantTable } from "~/types/table";
import type { JSX } from "react";

interface ViewTableModalProps {
  open: boolean;
  onClose: () => void;
  table: RestaurantTable | null;
}

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  occupied: "bg-blue-100 text-blue-700",
  reserved: "bg-yellow-100 text-yellow-700",
  maintenance: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, JSX.Element> = {
  available: <CheckCircle className="w-4 h-4 mr-1 text-green-500" />,
  occupied: <Users className="w-4 h-4 mr-1 text-blue-500" />,
  reserved: <Clock className="w-4 h-4 mr-1 text-yellow-500" />,
  maintenance: <XCircle className="w-4 h-4 mr-1 text-red-500" />,
};

export default function ViewTableModal({ open, onClose, table }: ViewTableModalProps) {
  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Table Details
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-base px-3 py-1">
              <span className="font-semibold">Table</span> {table.number}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Users className="w-4 h-4" />
              {table.seat} {table.seat === 1 ? "seat" : "seats"}
            </Badge>
            <Badge
              className={`flex items-center gap-1 px-3 py-1 ${statusColors[table.status]}`}
            >
              {statusIcons[table.status]}
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Location:</span>
            <span>{table.location}</span>
          </div>
          {table.description && (
            <div className="flex items-center gap-2 text-gray-700">
              <Info className="w-4 h-4" />
              <span className="font-medium">Description:</span>
              <span>{table.description}</span>
            </div>
          )}
          {table.reservation_time && (
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Reservation Time:</span>
              <span>{new Date(table.reservation_time).toLocaleString()}</span>
            </div>
          )}
          {table.reservation_name && (
            <div className="flex items-center gap-2 text-gray-700">
              <UserCircle2 className="w-4 h-4" />
              <span className="font-medium">Reservation Name:</span>
              <span>{table.reservation_name}</span>
            </div>
          )}
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