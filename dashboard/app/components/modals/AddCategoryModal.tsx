import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { IconSelector } from "~/components/ui/icon-selector";
import { Upload, X, XCircle } from "lucide-react";
import type { AddCategoryModalProps, FormCategoryValues } from "~/types/category";
import { categoryService } from "~/services/httpServices/categoryService";
import { toast } from "sonner"

export default function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
  newCategory,
  setNewCategory,
  mode = "add",
}: AddCategoryModalProps) {

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormCategoryValues>({
    defaultValues: {
      name: "",
      name_bn: "",
      slug: "",
      description: "",
      icon: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && newCategory) {
      setValue("name", newCategory.name || "");
      setValue("name_bn", newCategory.name_bn || "");
      setValue("slug", newCategory.slug || "");
      setValue("description", newCategory.description || "");
      setValue("icon", newCategory.icon || "");
    } else if (mode === "add") {
      reset();
    }
  }, [newCategory, mode, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue("name", name);
    setValue("slug", generateSlug(name));
  };

  const onSubmit = async (data: FormCategoryValues) => {
    try {
      const payload = {
        name: data.name,
        name_bn: data.name_bn,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
      };

      let savedCategory;
      if (mode === "edit" && (newCategory as any)?.id) {
        savedCategory = await categoryService.update((newCategory as any).id, payload);
        toast("Category updated!", {
          description: (
          <span style={{ color: "#000" }}>
            The category was updated successfully.
          </span>
        ),
          duration: 3000,
          icon: <Upload className="text-green-600 mr-2" />,
          style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
        });
      } else {
        savedCategory = await categoryService.create(payload);
        toast("Category created!", {
          description: (
            <span style={{ color: "#000" }}>
              The category was added successfully. You can now view it in the category list.
            </span>
          ),
          duration: 3000,
          icon: <Upload className="text-green-600 mr-2" />,
          style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
        });
      }

      onAdd(savedCategory);
      setTimeout(() => {
        onClose();
        reset();
      }, 1200);

    } catch (error: any) {
      let apiMessage = "Failed to save category.";
      if (error && typeof error === "object" && error.response?.data?.message) {
        apiMessage = error.response.data.message;
      } else if (error?.message) {
        apiMessage = error.message;
      }
      toast('Failed to save category.', {
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
          <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
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
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Category Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter category name"
                {...register("name", { required: true })}
                onChange={handleNameChange}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_bn" className="text-sm font-semibold text-gray-700">
                Bengali Name
              </Label>
              <Input
                id="name_bn"
                placeholder="বাংলা নাম"
                {...register("name_bn")}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                Slug (Auto-generated)
              </Label>
              <div className="relative">
                <Input
                  id="slug"
                  {...register("slug")}
                  className="h-11 bg-gray-50 font-mono text-sm"
                  placeholder="auto-generated-slug"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-xs text-gray-500">Editable</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Category Icon
              </Label>
              <div className="space-y-3">
                <IconSelector
                  value={watch("icon")}
                  onChange={(value) => setValue("icon", value)}
                  placeholder="Select a category icon"
                />
                <div className="text-center text-sm text-gray-500">or</div>
                <div>
                  <Label className="text-xs text-gray-600 mb-2">Custom Icon Name</Label>
                  <Input
                    placeholder="e.g., cafe-outline, restaurant-outline"
                    value={watch("icon")}
                    onChange={(e) => setValue("icon", e.target.value)}
                    className="h-10 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter any Ionicons name from{" "}
                    <a 
                      href="https://ionic.io/ionicons" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      ionicons.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter category description..."
                {...register("description")}
                className="min-h-[100px] resize-none"
                rows={4}
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
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {mode === "edit" ? "Update Category" : "Add Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}