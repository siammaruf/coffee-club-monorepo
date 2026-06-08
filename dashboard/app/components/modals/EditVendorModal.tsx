import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Select } from "~/components/ui/select";
import type { Vendor, UpdateVendorInput, VendorType, VendorStatus } from "~/types/vendor";

interface VendorForm {
  vendor_name: string;
  contact_person: string;
  vendor_type: VendorType;
  address: string;
  mobile: string;
  email: string;
  status: VendorStatus;
}

interface EditVendorModalProps {
  open: boolean;
  vendor: Vendor | null;
  onClose: () => void;
  onSuccess: () => void;
  onUpdate: (id: string, data: UpdateVendorInput) => Promise<void>;
}

export default function EditVendorModal({
  open,
  vendor,
  onClose,
  onSuccess,
  onUpdate,
}: EditVendorModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<VendorForm>();

  useEffect(() => {
    if (vendor) {
      reset({
        vendor_name: vendor.vendor_name,
        contact_person: vendor.contact_person,
        vendor_type: vendor.vendor_type,
        address: vendor.address,
        mobile: vendor.mobile,
        email: vendor.email || "",
        status: vendor.status,
      });
    }
  }, [vendor, reset]);

  const onSubmit = async (data: VendorForm) => {
    if (!vendor) return;
    try {
      await onUpdate(vendor.id, {
        ...data,
        email: data.email || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to update vendor",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errors.root.message}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("vendor_name", { required: "Vendor name is required" })}
              />
              {errors.vendor_name && (
                <span className="text-red-600 text-xs">{errors.vendor_name.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("contact_person", { required: "Contact person is required" })}
              />
              {errors.contact_person && (
                <span className="text-red-600 text-xs">{errors.contact_person.message}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Type <span className="text-red-500">*</span>
              </label>
              <Select {...register("vendor_type", { required: "Required" })} className="w-full">
                <option value="FOOD_SUPPLIER">Food Supplier</option>
                <option value="NON_FOOD_SUPPLIER">Non-Food Supplier</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <Select {...register("status", { required: "Required" })} className="w-full">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("address", { required: "Address is required" })}
              rows={2}
              className="w-full border rounded px-2 py-1 text-sm"
            />
            {errors.address && (
              <span className="text-red-600 text-xs">{errors.address.message}</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile <span className="text-red-500">*</span>
              </label>
              <Input {...register("mobile", { required: "Mobile is required" })} />
              {errors.mobile && (
                <span className="text-red-600 text-xs">{errors.mobile.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <Input type="email" {...register("email")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
