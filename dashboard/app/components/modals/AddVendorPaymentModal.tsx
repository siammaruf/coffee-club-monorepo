import { useState } from "react";
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
import { vendorService } from "~/services/httpServices/vendorService";
import type { CreateVendorPaymentInput, VendorPaymentType } from "~/types/vendorPayment";
import type { Vendor } from "~/types/vendor";

interface PaymentForm {
  vendor_id: string;
  amount: number;
  payment_date: string;
  payment_type: VendorPaymentType;
  note: string;
}

interface AddVendorPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCreate: (data: CreateVendorPaymentInput) => Promise<void>;
}

export default function AddVendorPaymentModal({
  open,
  onClose,
  onSuccess,
  onCreate,
}: AddVendorPaymentModalProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PaymentForm>({
    defaultValues: {
      vendor_id: "",
      amount: 0,
      payment_date: new Date().toISOString().split("T")[0],
      payment_type: "CASH",
      note: "",
    },
  });

  const fetchVendors = async () => {
    try {
      const res = await vendorService.getActive();
      setVendors((res as any)?.data || []);
    } catch {
      setVendors([]);
    }
  };

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) fetchVendors();
  };

  const onSubmit = async (data: PaymentForm) => {
    try {
      await onCreate({
        vendor_id: data.vendor_id,
        amount: Number(data.amount),
        payment_date: data.payment_date,
        payment_type: data.payment_type,
        note: data.note || undefined,
      });
      reset();
      onSuccess();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to record payment",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Vendor Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errors.root.message}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <Select
              {...register("vendor_id", { required: "Vendor is required" })}
              className="w-full"
              defaultValue=""
            >
              <option value="" disabled>Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendor_name}
                </option>
              ))}
            </Select>
            {errors.vendor_id && (
              <span className="text-red-600 text-xs">{errors.vendor_id.message}</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 0.01, message: "Must be greater than 0" },
                  valueAsNumber: true,
                })}
                placeholder="e.g. 5000"
              />
              {errors.amount && (
                <span className="text-red-600 text-xs">{errors.amount.message}</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <Select {...register("payment_type", { required: "Required" })} className="w-full">
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              {...register("payment_date", { required: "Date is required" })}
            />
            {errors.payment_date && (
              <span className="text-red-600 text-xs">{errors.payment_date.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              {...register("note")}
              rows={2}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="e.g. Monthly settlement"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
