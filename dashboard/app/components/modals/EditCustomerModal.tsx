import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Upload, Save, X, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { Customer, CustomerFormValues, EditCustomerModalProps } from "~/types/customer";
import { customerService } from "~/services/httpServices/customerService";

export default function EditCustomerModal({
  isOpen,
  onClose,
  customer,
  onUpdated,
}: EditCustomerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [picture, setPicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      note: "",
      customer_type: "regular",
    }
  });

  useEffect(() => {
    if (customer && isOpen) {
      reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        address: customer.address || "",
        note: customer.note || "",
        customer_type: customer.customer_type || "regular",
      });
      setPreview(customer.picture || "");
      setPicture(null);
    }
  }, [customer, isOpen, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPicture(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData: CustomerFormValues) => {
    if (!customer) return;
    
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("address", formData.address);
      data.append("note", formData.note);
      data.append("customer_type", formData.customer_type);
      if (picture) {
        data.append("picture", picture);
      }

      const response = await customerService.update(customer.id, data);
      const updated: Customer = response;
      toast("Customer updated!", {
        description: (
          <span style={{ color: "#000" }}>
            The customer was updated successfully.
          </span>
        ),
        duration: 3000,
        icon: <CheckCircle className="text-green-600 mr-2" />,
        style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
      });
      
      onUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      let apiMessage = "Failed to update customer.";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as any).response?.data?.message
      ) {
        apiMessage = (error as any).response.data.message;
      } else if ((error as any)?.message) {
        apiMessage = (error as any).message;
      }
      
      toast('Failed to update customer.', {
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
      console.error('Error updating customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Edit Customer</h3>
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="picture" className="text-sm font-semibold text-gray-700">
                Profile Image
              </Label>
              <div className="flex items-center gap-4 mt-2">
                {preview && (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                )}
                <div className="relative">
                  <Input
                    id="picture"
                    name="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('picture')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {preview ? 'Change Image' : 'Upload Image'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="customer_type" className="text-sm font-semibold text-gray-700">
                Customer Type
              </Label>
              <Controller
                name="customer_type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="customer_type"
                    className="w-full h-11 border rounded-md px-3 text-sm bg-white"
                  >
                    <option value="regular">Regular</option>
                    <option value="member">Member</option>
                  </select>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Only member customers can earn and use loyalty points.
              </p>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Full Name *
              </Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    placeholder="Enter customer's full name"
                    className={`h-11 ${errors.name ? 'border-red-500' : ''}`}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number *
              </Label>
              <Controller
                name="phone"
                control={control}
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    className={`h-11 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    className={`h-11 ${errors.email ? 'border-red-500' : ''}`}
                  />
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                Address
              </Label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="address"
                    placeholder="123 Main St"
                    className="h-11"
                  />
                )}
              />
            </div>
            
            <div>
              <Label htmlFor="note" className="text-sm font-semibold text-gray-700">
                Notes
              </Label>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="note"
                    placeholder="Additional notes about the customer"
                    rows={3}
                    className="min-h-[80px] resize-none"
                  />
                )}
              />
            </div>
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
              disabled={isLoading}
              className="px-6 bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}