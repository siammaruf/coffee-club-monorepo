import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import type { KitchenItem } from "~/types/kitchenItem";

interface EditKitchenItemModalProps {
  open: boolean;
  onClose: () => void;
  item: KitchenItem;
  onEdited: (data: FormData) => Promise<void>;
}

const EditKitchenItemModal: React.FC<EditKitchenItemModalProps> = ({ open, onClose, item, onEdited }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<Partial<KitchenItem>>({
    defaultValues: {
      name: item.name,
      name_bn: item.name_bn,
      image: item.image || "",
      description: item.description,
      type: item.type,
    },
  });

  const [imagePreview, setImagePreview] = React.useState<string>(item.image || "");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [apiError, setApiError] = React.useState<string>("");

  React.useEffect(() => {
    reset({
      name: item.name,
      name_bn: item.name_bn,
      image: item.image || "",
      description: item.description,
      type: item.type,
    });
    setImagePreview(item.image || "");
    setImageFile(null);
    setApiError("");
  }, [item, reset]);

  if (!open) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setValue("image", file.name); // Optionally set image name in form
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (data: Partial<KitchenItem>) => {
    setApiError("");
    try {
      const formData = new FormData();
      formData.append("name", data.name || "");
      formData.append("name_bn", data.name_bn || "");
      formData.append("slug", generateSlug(data.name || ""));
      formData.append("description", data.description || "");
      formData.append("type", data.type || "KITCHEN");
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (typeof data.image === "string") {
        formData.append("image", data.image);
      }
      await onEdited(formData);
      reset();
      setImagePreview("");
      setImageFile(null);
      onClose();
    } catch (error: any) {
      let message = "Failed to update kitchen item.";
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (typeof error === "string") {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setApiError(message);
      console.error("Error editing kitchen item:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Edit Kitchen Item</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            ×
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {apiError && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200 text-sm">
              {apiError}
            </div>
          )}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Name *</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  className="h-11 w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("name", { required: true })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Name (Bangla)</label>
                <input
                  type="text"
                  placeholder="বাংলা নাম"
                  className="h-11 w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("name_bn")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Type *</label>
                <select
                  className="h-11 w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                  {...register("type", { required: true })}
                  required
                >
                  <option value="KITCHEN">KITCHEN</option>
                  <option value="BAR">BAR</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Slug</label>
                <input
                  type="text"
                  value={generateSlug(watch("name") || "")}
                  readOnly
                  className="h-11 w-full px-3 py-2 text-xs border border-gray-200 bg-gray-100 rounded-md text-gray-500 cursor-not-allowed"
                  tabIndex={-1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                placeholder="Enter item description..."
                className="min-h-[80px] resize-none w-full px-3 py-2 text-sm border border-input bg-background rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                {...register("description")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Image</label>
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer transition ${imageFile ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50 hover:border-primary/60'}`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                    setValue("image", file.name);
                  }
                }}
                onClick={() => {
                  document.getElementById('edit-kitchen-image-input')?.click();
                }}
              >
                {!imagePreview ? (
                  <span className="text-gray-400 text-sm">Drag & drop or click to upload image</span>
                ) : (
                  <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border shadow" />
                )}
                <input
                  id="edit-kitchen-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button type="submit" className="px-6 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditKitchenItemModal;
