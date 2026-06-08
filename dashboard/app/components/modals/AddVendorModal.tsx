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
import type { CreateVendorInput, VendorType, VendorStatus } from "~/types/vendor";

interface VendorForm {
  vendor_name: string;
  contact_person: string;
  vendor_type: VendorType;
  address: string;
  mobile: string;
  email: string;
  status: VendorStatus;
}

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCreate: (data: CreateVendorInput) => Promise<void>;
}

export default function AddVendorModal({
  open,
  onClose,
  onSuccess,
  onCreate,
}: AddVendorModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<VendorForm>({
    defaultValues: {
      vendor_name: "",
      contact_person: "",
      vendor_type: "FOOD_SUPPLIER",
      address: "",
      mobile: "",
      email: "",
      status: "ACTIVE",
    },
  });

  const onSubmit = async (data: VendorForm) => {
    try {
      await onCreate({
        ...data,
        email: data.email || undefined,
      });
      reset();
      onSuccess();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to create vendor",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Vendor</DialogTitle>
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
                placeholder="e.g. Fresh Foods Ltd."
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
                placeholder="e.g. John Doe"
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
              <Select
                {...register("vendor_type", { required: "Required" })}
                className="w-full"
              >
                <option value="FOOD_SUPPLIER">Food Supplier</option>
                <option value="NON_FOOD_SUPPLIER">Non-Food Supplier</option>
              </Select>
              {errors.vendor_type && (
                <span className="text-red-600 text-xs">{errors.vendor_type.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                {...register("status", { required: "Required" })}
                className="w-full"
              >
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
              placeholder="e.g. 123 Main St, Dhaka"
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
              <Input
                {...register("mobile", { required: "Mobile is required" })}
                placeholder="e.g. 01712345678"
              />
              {errors.mobile && (
                <span className="text-red-600 text-xs">{errors.mobile.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <Input
                type="email"
                {...register("email")}
                placeholder="e.g. vendor@example.com"
              />
              {errors.email && (
                <span className="text-red-600 text-xs">{errors.email.message}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
