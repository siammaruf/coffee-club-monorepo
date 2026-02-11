import { useState } from "react";
import { Button } from "../ui/button";
import { X, UserCheck, UserX, Loader2, Mail, MapPin, Phone } from "lucide-react";
import type { Customer } from "~/types/customer";
import { customerService } from "~/services/httpServices/customerService";

interface ViewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onStatusChange?: (updated: Customer) => void;
}

export default function ViewCustomerModal({
  isOpen,
  onClose,
  customer,
  onStatusChange,
}: ViewCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive" | undefined>(customer?.status);

  if (!isOpen || !customer) return null;

  const handleStatusChange = async (action: "activate" | "deactivate") => {
    setLoading(true);
    try {
      let updated: Customer;
      if (action === "activate") {
        updated = await customerService.activate(customer.id);
        setStatus("active");
      } else {
        updated = await customerService.deactivate(customer.id);
        setStatus("inactive");
      }
      if (onStatusChange) onStatusChange(updated);
    } catch {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-5 py-6">
          <div className="flex flex-col items-center mb-4">
            {customer.picture ? (
              <img
                src={customer.picture}
                alt={customer.name}
                className="w-16 h-16 rounded-full object-cover border mb-2"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-2 border">
                <UserCheck className="w-8 h-8 text-yellow-400" />
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            <div className="mt-2 flex gap-2">
              {status === "active" ? (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleStatusChange("deactivate")}
                  className="flex items-center gap-1"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <UserX className="w-4 h-4" />}
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleStatusChange("activate")}
                  className="flex items-center gap-1"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  Activate
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{customer.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{customer.address || 'Not provided'}</span>
            </div>
            {customer.note && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold text-gray-500">Notes:</span>
                <span>{customer.note}</span>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}