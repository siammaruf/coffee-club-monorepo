import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { X, Upload, XCircle } from "lucide-react";
import { reservationService } from "~/services/httpServices/reservationService";
import { toast } from "sonner";
import type { Reservation, ReservationStatus } from "~/types/reservation";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: Reservation) => void;
  reservation: Reservation | null;
}

const STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  DINING: "Dining",
  BIRTHDAY: "Birthday",
  MEETING: "Meeting",
  PRIVATE_EVENT: "Private Event",
  OTHER: "Other",
};

function getStatusBadgeClasses(status: ReservationStatus): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
}

export default function ReservationModal({
  isOpen,
  onClose,
  onSave,
  reservation,
}: ReservationModalProps) {
  const [status, setStatus] = useState<ReservationStatus>(reservation?.status || "PENDING");
  const [specialRequests, setSpecialRequests] = useState(reservation?.special_requests || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !reservation) return null;

  const handleStatusUpdate = async () => {
    setIsSubmitting(true);
    try {
      const result = await reservationService.update(reservation.id, {
        status,
        special_requests: specialRequests || undefined,
      });
      const saved = result.data || result;
      onSave(saved as Reservation);
      toast("Reservation updated!", {
        description: (
          <span style={{ color: "#000" }}>
            The reservation status was updated successfully.
          </span>
        ),
        duration: 3000,
        icon: <Upload className="text-green-600 mr-2" />,
        style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
      });
      setTimeout(() => onClose(), 500);
    } catch (error: any) {
      let apiMessage = "Failed to update reservation.";
      if (error?.response?.data?.message) {
        apiMessage = error.response.data.message;
      } else if (error?.message) {
        apiMessage = error.message;
      }
      toast("Failed to update reservation.", {
        description: (
          <span style={{ color: "#000" }}>
            {apiMessage}
          </span>
        ),
        duration: 3000,
        icon: <XCircle className="text-red-600" style={{ marginTop: 10, marginRight: 10 }} />,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          alignItems: "flex-start",
          border: "1.5px solid #ef4444",
        },
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Reservation Details</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Guest Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Guest Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <p className="text-gray-900">{reservation.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{reservation.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <p className="text-gray-900">{reservation.phone}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Party Size:</span>
                <p className="text-gray-900">{reservation.party_size} guests</p>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Reservation Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Date:</span>
                <p className="text-gray-900">
                  {new Date(reservation.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Time:</span>
                <p className="text-gray-900">{reservation.time}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Event Type:</span>
                <p className="text-gray-900">
                  {EVENT_TYPE_LABELS[reservation.event_type] || reservation.event_type}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Current Status:</span>
                <div className="mt-1">
                  <Badge className={getStatusBadgeClasses(reservation.status)}>
                    {reservation.status}
                  </Badge>
                </div>
              </div>
            </div>
            {reservation.special_requests && (
              <div className="text-sm pt-2">
                <span className="font-medium text-gray-600">Special Requests:</span>
                <p className="text-gray-900 mt-1">{reservation.special_requests}</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-xs text-gray-500 flex gap-4">
            <span>Created: {new Date(reservation.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(reservation.updated_at).toLocaleString()}</span>
          </div>

          {/* Update Status Section */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-gray-900 text-sm">Update Reservation</h4>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                className="h-10"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_requests" className="text-sm font-medium text-gray-700">
                Admin Notes / Special Requests
              </Label>
              <Textarea
                id="special_requests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Add notes about this reservation..."
                className="min-h-[80px] resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button
              type="button"
              className="px-6 bg-blue-600 hover:bg-blue-700"
              onClick={handleStatusUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Reservation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
