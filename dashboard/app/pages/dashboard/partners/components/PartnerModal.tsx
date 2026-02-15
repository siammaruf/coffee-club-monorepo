import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Upload, X, XCircle } from "lucide-react";
import { partnerService } from "~/services/httpServices/partnerService";
import { toast } from "sonner";
import type { Partner } from "~/types/partner";

interface PartnerFormValues {
  name: string;
  logo: string;
  website: string;
  sort_order: number;
  is_active: boolean;
}

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: Partner) => void;
  partner?: Partner | null;
  mode?: "add" | "edit";
}

export default function PartnerModal({
  isOpen,
  onClose,
  onSave,
  partner,
  mode = "add",
}: PartnerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PartnerFormValues>({
    defaultValues: {
      name: "",
      logo: "",
      website: "",
      sort_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (mode === "edit" && partner) {
      setValue("name", partner.name || "");
      setValue("logo", partner.logo || "");
      setValue("website", partner.website || "");
      setValue("sort_order", partner.sort_order ?? 0);
      setValue("is_active", partner.is_active ?? true);
    } else if (mode === "add") {
      reset();
    }
  }, [partner, mode, isOpen, setValue, reset]);

  const onSubmit = async (data: PartnerFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        logo: data.logo,
        website: data.website || undefined,
        sort_order: data.sort_order,
        is_active: data.is_active,
      };

      let result: any;
      if (mode === "edit" && partner?.id) {
        result = await partnerService.update(partner.id, payload);
        toast("Partner updated!", {
          description: (
            <span style={{ color: "#000" }}>
              The partner was updated successfully.
            </span>
          ),
          duration: 3000,
          icon: <Upload className="text-green-600 mr-2" />,
          style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
        });
      } else {
        result = await partnerService.create(payload);
        toast("Partner created!", {
          description: (
            <span style={{ color: "#000" }}>
              The partner was created successfully.
            </span>
          ),
          duration: 3000,
          icon: <Upload className="text-green-600 mr-2" />,
          style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
        });
      }

      const savedPartner = result.data || result;
      onSave(savedPartner);
      setTimeout(() => {
        onClose();
        reset();
      }, 500);
    } catch (error: any) {
      let apiMessage = "Failed to save partner.";
      if (error?.response?.data?.message) {
        apiMessage = error.response.data.message;
      } else if (error?.message) {
        apiMessage = error.message;
      }
      toast("Failed to save partner.", {
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

  const handleClose = () => {
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === "edit" ? "Edit Partner" : "Add New Partner"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter partner name"
                {...register("name", { required: "Name is required" })}
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo" className="text-sm font-semibold text-gray-700">
                Logo URL *
              </Label>
              <Input
                id="logo"
                placeholder="https://example.com/logo.png"
                {...register("logo", { required: "Logo URL is required" })}
                className="h-11"
              />
              {errors.logo && (
                <p className="text-sm text-red-500">{errors.logo.message}</p>
              )}
              {watch("logo") && (
                <div className="mt-2">
                  <img
                    src={watch("logo")}
                    alt="Logo Preview"
                    className="h-16 w-auto rounded border object-contain bg-gray-50 p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                Website URL
              </Label>
              <Input
                id="website"
                placeholder="https://example.com"
                {...register("website")}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order" className="text-sm font-semibold text-gray-700">
                Sort Order
              </Label>
              <Input
                id="sort_order"
                type="number"
                placeholder="0"
                {...register("sort_order", { valueAsNumber: true })}
                className="h-11"
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="is_active"
                checked={watch("is_active")}
                onChange={(e) => setValue("is_active", (e.target as HTMLInputElement).checked)}
              />
              <Label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Active
              </Label>
              <span className="text-xs text-gray-500">
                {watch("is_active") ? "This partner will be visible on the website" : "This partner is hidden"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Partner"
                  : "Create Partner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
