import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { Vendor } from "~/types/vendor";

interface ViewVendorModalProps {
  open: boolean;
  vendor: Vendor | null;
  onClose: () => void;
}

export default function ViewVendorModal({ open, vendor, onClose }: ViewVendorModalProps) {
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vendor Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500">Vendor Name</span>
            <span className="col-span-2 font-medium">{vendor.vendor_name}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500">Contact Person</span>
            <span className="col-span-2 font-medium">{vendor.contact_person}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500">Type</span>
            <span className="col-span-2 font-medium">
              {vendor.vendor_type === "FOOD_SUPPLIER" ? "Food Supplier" : "Non-Food Supplier"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500">Status</span>
            <span className="col-span-2">
              {vendor.status === "ACTIVE" ? (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Active</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">Inactive</span>
              )}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500">Mobile</span>
            <span className="col-span-2 font-medium">{vendor.mobile}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500">Email</span>
            <span className="col-span-2 font-medium">{vendor.email || "—"}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-500">Address</span>
            <span className="col-span-2 font-medium">{vendor.address}</span>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
