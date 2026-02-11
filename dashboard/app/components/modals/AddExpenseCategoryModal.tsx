import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { IconSelector } from "~/components/ui/icon-selector";
import type { AddExpenseCategoryModalProps, FormValues } from "~/types/expenseCategory";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AddExpenseCategoryModal({
  open,
  onClose,
  onSuccess,
  onCreate,
}: AddExpenseCategoryModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
    },
  });

  const titleValue = watch("name");
  React.useEffect(() => {
    setValue("slug", generateSlug(titleValue));
  }, [titleValue, setValue]);

  const iconValue = watch("icon");

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await onCreate(data);
      onSuccess(res.data);
      reset();
    } catch (err: any) {
      setError("root", {
        type: "manual",
        message: err?.response?.data?.message || "Failed to add category",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              {...register("name", { required: "Title is required" })}
              name="name"
              id="name"
              placeholder="Office Supplies"
            />
            {errors.name && <span className="text-red-600 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <Input
              {...register("slug", {
                required: "Slug is required",
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: "Slug must be lowercase, numbers, or hyphens",
                },
              })}
              name="slug"
              id="slug"
              placeholder="office-supplies"
              readOnly
            />
            {errors.slug && <span className="text-red-600 text-xs">{errors.slug.message}</span>}
          </div>
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <div className="flex gap-2 items-center">
              <IconSelector
                value={iconValue}
                onChange={icon => setValue("icon", icon, { shouldValidate: true })}
                className="w-[200px]"
              />
              <Input
                {...register("icon", { required: "Icon is required" })}
                name="icon"
                id="icon"
                placeholder="office_box"
                className="flex-1"
              />
            </div>
            {errors.icon && <span className="text-red-600 text-xs">{errors.icon.message}</span>}
            <span className="text-xs text-gray-400 block mt-1">
              Select from list or enter a custom icon name.
            </span>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              name="description"
              id="description"
              rows={3}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="All expenses related to office materials and supplies"
            />
            {errors.description && (
              <span className="text-red-600 text-xs">{errors.description.message}</span>
            )}
          </div>
          {errors.root && (
            <div className="text-red-600 text-sm">{errors.root.message}</div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}