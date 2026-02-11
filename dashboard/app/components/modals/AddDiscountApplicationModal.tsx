import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { X } from "lucide-react";
import type { AddDiscountApplicationModalProps } from "~/types/discount";
import { discountService } from "~/services/httpServices/discountService";
import { customerService } from "~/services/httpServices/customerService";
import { productService } from "~/services/httpServices/productService";
import { categoryService } from "~/services/httpServices/categoryService";

export enum DiscountApplicationType {
  CUSTOMER = 'customer',
  PRODUCT = 'product',
  CATEGORY = 'category',
  ALL_ORDERS = 'all_orders',
}

type FormValues = {
  discount_type: DiscountApplicationType;
  discount: string;
  customers: string[];
  products: string[];
  categories: string[];
};

export default function AddDiscountApplicationModal({
  isOpen,
  onClose,
  onAdd,
}: AddDiscountApplicationModalProps & { onAdd: (data: any) => void }) {
  const [success, setSuccess] = useState<string | null>(null);
  const [discountOptions, setDiscountOptions] = useState<{ id: string; name: string }[]>([]);
  const [customerOptions, setCustomerOptions] = useState<{ id: string; name: string }[]>([]);
  const [productOptions, setProductOptions] = useState<{ id: string; name: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      discount_type: DiscountApplicationType.CUSTOMER,
      discount: "",
      customers: [],
      products: [],
      categories: [],
    }
  });

  const discountType = watch("discount_type");

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSuccess(null);
    } else {
      discountService.getNotExpired().then(res => {
        setDiscountOptions(
          (res.data || []).map((d: any) => ({ id: d.id, name: d.name }))
        );
      });
      customerService.getAll().then(res => {
        setCustomerOptions(
          (res.data || []).map((c: any) => ({ id: c.id, name: c.name || c.email || c.id }))
        );
      });
      productService.getAll().then(res => {
        setProductOptions(
          (res.data || []).map((p: any) => ({ id: p.id, name: p.name }))
        );
      });
      categoryService.getAll().then(res => {
        setCategoryOptions(
          (res.data || []).map((cat: any) => ({ id: cat.id, name: cat.name }))
        );
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      discount_type: values.discount_type,
      discount: values.discount,
      customers: values.customers || [],
      products: values.products || [],
      categories: values.categories || [],
    };
    onAdd(payload);
    setSuccess("Discount application added!");
    setTimeout(() => {
      setSuccess(null);
      onClose();
      reset();
    }, 1200);
  };

  const handleClose = () => {
    onClose();
    reset();
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Add Discount Application</h3>
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
          {success && (
            <div className="p-3 rounded bg-green-100 text-green-800 text-center text-sm mb-2">
              {success}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="discount-type" className="text-sm font-semibold text-gray-700">
                Discount Type *
              </Label>
              <select
                id="discount-type"
                {...register("discount_type", { required: true })}
                className="h-11 w-full border rounded px-3 mt-1"
                required
              >
                <option value={DiscountApplicationType.CUSTOMER}>Customer</option>
                <option value={DiscountApplicationType.PRODUCT}>Product</option>
                <option value={DiscountApplicationType.CATEGORY}>Category</option>
                <option value={DiscountApplicationType.ALL_ORDERS}>All Orders</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount" className="text-sm font-semibold text-gray-700 mb-2">
                Discount *
              </Label>
              <select
                id="discount"
                {...register("discount", { required: true })}
                className="h-11 w-full border rounded px-3 mt-1"
                required
              >
                <option value="">Select discount</option>
                {discountOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {errors.discount && <span className="text-xs text-red-600">Discount is required</span>}
            </div>
            {discountType === DiscountApplicationType.CUSTOMER && (
              <div>
                <Label htmlFor="customers" className="text-sm font-semibold text-gray-700">
                  Customers *
                </Label>
                <select
                  id="customers"
                  multiple
                  {...register("customers", { required: true })}
                  className="h-32 w-full border rounded px-3 mt-1"
                  required
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setValue("customers", selected);
                  }}
                >
                  {customerOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {errors.customers && <span className="text-xs text-red-600">At least one customer is required</span>}
              </div>
            )}
            {discountType === DiscountApplicationType.PRODUCT && (
              <div>
                <Label htmlFor="products" className="text-sm font-semibold text-gray-700">
                  Products *
                </Label>
                <select
                  id="products"
                  multiple
                  {...register("products", { required: true })}
                  className="h-32 w-full border rounded px-3 mt-1"
                  required
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setValue("products", selected);
                  }}
                >
                  {productOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {errors.products && <span className="text-xs text-red-600">At least one product is required</span>}
              </div>
            )}
            {discountType === DiscountApplicationType.CATEGORY && (
              <div>
                <Label htmlFor="categories" className="text-sm font-semibold text-gray-700">
                  Categories *
                </Label>
                <select
                  id="categories"
                  multiple
                  {...register("categories", { required: true })}
                  className="h-32 w-full border rounded px-3 mt-1"
                  required
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setValue("categories", selected);
                  }}
                >
                  {categoryOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {errors.categories && <span className="text-xs text-red-600">At least one category is required</span>}
              </div>
            )}
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
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              Add Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}