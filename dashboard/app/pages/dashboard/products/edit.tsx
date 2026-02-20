import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useBackToList } from "~/hooks/useBackToList";
import { useForm, Controller } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select } from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Save, Upload, Search, Check, X, GripVertical } from "lucide-react";
import { productService } from "~/services/httpServices/productService";
import { categoryService } from "~/services/httpServices/categoryService"; 
import { ConfirmDialog } from "~/components/ui/confirm-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "~/components/ui/command";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { ItemType } from "~/enums/product.enum";
import type { Product } from "~/types/product";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goBack, navigateWithPage } = useBackToList('/dashboard/products');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    title: "",
    message: "",
    isError: false,
  });
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]); 
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<Product>({
    defaultValues: {
      name: "",
      name_bn: "",
      description: "",
      type: undefined,
      regular_price: 0,
      sale_price: 0,
      image: "",
      categories: [],
      status: "available"
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll({ limit: 1000 });
        if (res && Array.isArray(res.data)) {
          setCategories(res.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name
          })));
        }
      } catch (error) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await productService.getById(productId);
      if (response && response.data) {
        const product = response.data;
        const categoryIds = Array.isArray(product.categories)
          ? product.categories.map((cat: any) => cat.id)
          : [];
        setHasVariations(!!product.has_variations);
        setVariations(
          Array.isArray(product.variations)
            ? product.variations.map((v: any, idx: number) => ({
                ...v,
                regular_price: parseFloat(v.regular_price) || 0,
                sale_price: parseFloat(v.sale_price) || 0,
                sort_order: v.sort_order || idx + 1,
              }))
            : []
        );
        reset({
          ...product,
          categories: categoryIds,
          regular_price: parseFloat(product.regular_price?.toString() ?? '0'),
          sale_price: parseFloat(product.sale_price?.toString() ?? '0'),
        });
        setSelectedCategories(categoryIds);
        setImagePreview(product.image || "");
      } else {
        setStatusDialog({
          open: true,
          title: "Error",
          message: "Product not found.",
          isError: true,
        });
        goBack();
      }
    } catch (error) {
      setStatusDialog({
        open: true,
        title: "Error",
        message: "Error fetching product.",
        isError: true,
      });
      goBack();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        const updated = prev.filter((id) => id !== categoryId);
        setValue("categories", updated as any); 
        return updated;
      } else {
        const updated = [...prev, categoryId];
        setValue("categories", updated as any);
        return updated;
      }
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVariationChange = (idx: number, field: string, value: any) => {
    setVariations(prev =>
      prev.map((v, i) => i === idx ? { ...v, [field]: value } : v)
    );
  };

  const addVariation = () => {
    setVariations(prev => [
      ...prev,
      { name: "", name_bn: "", regular_price: "" as any, sale_price: "" as any, status: "available", sort_order: prev.length + 1 }
    ]);
  };

  const removeVariation = (idx: number) => {
    setVariations(prev => prev.filter((_, i) => i !== idx).map((v, i) => ({ ...v, sort_order: i + 1 })));
  };

  const handleVariationDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(variations);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setVariations(
      reordered.map((v, i) => ({
        ...v,
        sort_order: i + 1
      }))
    );
  };

  const onSubmit = async (data: Product) => {
    setIsLoading(true);
    try {
      const form = new FormData();

      // Basic fields
      form.append('name', data.name);
      form.append('name_bn', data.name_bn || "");
      form.append('slug', data.slug || "");
      form.append('description', data.description || "");
      form.append('type', data.type);
      form.append('status', data.status);
      form.append('regular_price', Number(data.regular_price).toString());
      form.append('sale_price', Number(data.sale_price).toString());
      form.append('has_variations', hasVariations ? "true" : "false");

      // Categories as JSON string
      form.append('categories', JSON.stringify(selectedCategories));

      // Variations as JSON string
      if (hasVariations && variations.length > 0) {
        form.append('variations', JSON.stringify(
          variations.map((v, idx) => ({
            ...(v.id ? { id: v.id } : {}),
            name: v.name,
            name_bn: v.name_bn || '',
            regular_price: Number(v.regular_price || 0),
            sale_price: Number(v.sale_price || 0),
            status: v.status,
            sort_order: idx + 1,
          }))
        ));
      }

      // Optional image file
      if (imageFile) {
        form.append('image', imageFile);
      }

      await productService.update(id!, form);

      setStatusDialog({
        open: true,
        title: "Success",
        message: "Product updated successfully",
        isError: false,
      });

      // Optionally navigate after success
      setTimeout(() => {
        goBack();
      }, 1000);

    } catch (error: any) {
      let apiMessage = "Failed to update product.";
      if (error?.response?.data?.message) {
        apiMessage = error.response.data.message;
      } else if (error?.message) {
        apiMessage = error.message;
      }
      setStatusDialog({
        open: true,
        title: "Error",
        message: apiMessage,
        isError: true,
      });
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-6xl mx-auto shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWithPage(`/dashboard/products/${id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Details
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          </div>
          <CardTitle className="text-xl font-semibold">Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Product Image Upload */}
            <div>
              <Label htmlFor="image" className="block mb-2 font-medium">Product Image</Label>
              <div className="flex items-center gap-6">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WEBP. Max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <Label htmlFor="name" className={errors.name ? "text-red-500 mb-2" : "mb-2"}>Product Name *</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Product name is required" })}
                  placeholder="Enter product name"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Product Name (Bengali) */}
              <div>
                <Label className="mb-2" htmlFor="name_bn">Product Name (Bengali)</Label>
                <Input
                  id="name_bn"
                  {...register("name_bn")}
                  placeholder="পণ্যের নাম বাংলায়"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter product description"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type */}
              <div>
                <Label htmlFor="type" className={errors.type ? "text-red-500 mb-2" : "mb-2"}>Product Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Product type is required" }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      id="type"
                      className="mt-1"
                    >
                      <option value="" disabled>Select product type</option>
                      <option value={ItemType.BAR}>Bar</option>
                      <option value={ItemType.KITCHEN}>Kitchen</option>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" className={errors.status ? "text-red-500 mb-2" : "mb-2"}>Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      id="status"
                      className="mt-1"
                    >
                      <option value="" disabled>Select status</option>
                      <option value="available">Available</option>
                      <option value="discontinued">Discontinued</option>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className={errors.categories ? "text-red-500 mb-2" : "mb-2"}>Categories *</Label>
              <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCategoryPopoverOpen}
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedCategories.length > 0
                      ? `${selectedCategories.length} categories selected`
                      : "Select categories"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search categories..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>No categories found.</CommandEmpty>
                      <CommandGroup>
                        {filteredCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            onSelect={() => toggleCategory(category.id)}
                            className="flex items-center"
                          >
                            <div className="mr-2 flex items-center justify-center">
                              <Checkbox
                                checked={selectedCategories.includes(category.id)}
                                onChange={() => toggleCategory(category.id)}
                              />
                            </div>
                            <span>{category.name}</span>
                            {selectedCategories.includes(category.id) && (
                              <Check className="ml-auto h-4 w-4 text-green-600" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCategories.length === 0 && (
                <p className="text-red-500 text-xs mt-1">At least one category is required</p>
              )}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategories.map((categoryId: string) => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                        {category.name}
                        <button
                          type="button"
                          onClick={() => toggleCategory(categoryId)}
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Variations Toggle */}
            <div className="mb-6">
              <Label className="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasVariations}
                  onChange={e => setHasVariations(e.target.checked)}
                  id="has_variations"
                  className="accent-primary"
                />
                This product has variations
              </Label>
            </div>

            {/* Pricing */}
            {!hasVariations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="regular_price" className={errors.regular_price ? "text-red-500 mb-2" : "mb-2"}>Regular Price *</Label>
                  <Input
                    id="regular_price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("regular_price", { valueAsNumber: true, required: "Price is required", min: { value: 0, message: "Price cannot be negative" } })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                  {errors.regular_price && (
                    <p className="text-red-500 text-xs mt-1">{errors.regular_price.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sale_price" className={errors.sale_price ? "text-red-500 mb-2" : "mb-2"}>Sale Price</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("sale_price", { valueAsNumber: true, min: { value: 0, message: "Price cannot be negative" } })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                  {errors.sale_price && (
                    <p className="text-red-500 text-xs mt-1">{errors.sale_price.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Variations Section */}
            {hasVariations && (
              <div className="mt-4 space-y-4">
                <DragDropContext onDragEnd={handleVariationDragEnd}>
                  <Droppable droppableId="variations-droppable">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {variations.map((variation, idx) => (
                          <Draggable key={variation.id || idx} draggableId={variation.id || `variation-${idx}`} index={idx}>
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                className="border p-4 rounded mb-2 flex items-center gap-2"
                              >
                                <span {...dragProvided.dragHandleProps} className="cursor-move">
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                </span>
                                <Input
                                  placeholder="Variation Name"
                                  value={variation.name}
                                  onChange={e => handleVariationChange(idx, "name", e.target.value)}
                                />
                                <Input
                                  placeholder="Variation Name (Bengali)"
                                  value={variation.name_bn}
                                  onChange={e => handleVariationChange(idx, "name_bn", e.target.value)}
                                />
                                <Input
                                  type="number"
                                  placeholder="Regular Price"
                                  value={variation.regular_price === 0 ? "" : variation.regular_price}
                                  step="0.01"
                                  min={0}
                                  onChange={e => handleVariationChange(idx, "regular_price", e.target.value === "" ? "" : parseFloat(Number(e.target.value).toFixed(2)))}
                                />
                                <Input
                                  type="number"
                                  placeholder="Sale Price"
                                  value={variation.sale_price === 0 ? "" : variation.sale_price}
                                  step="0.01"
                                  min={0}
                                  onChange={e => handleVariationChange(idx, "sale_price", e.target.value === "" ? "" : parseFloat(Number(e.target.value).toFixed(2)))}
                                />
                                <Select
                                  value={variation.status}
                                  onChange={e => handleVariationChange(idx, "status", e.target.value)}
                                  style={{ minWidth: 140 }}
                                >
                                  <option value="available">Available</option>
                                  <option value="discontinued">Discontinued</option>
                                </Select>
                                <Button type="button" variant="destructive" onClick={() => removeVariation(idx)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <Button type="button" onClick={addVariation}>
                  Add Variation
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-2 pt-6 justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigateWithPage(`/dashboard/products/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Status Popup */}
      <ConfirmDialog
        open={statusDialog.open}
        title={statusDialog.title}
        message={statusDialog.message}
        destructive={statusDialog.isError}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setStatusDialog({ ...statusDialog, open: false })}
        onCancel={() => setStatusDialog({ ...statusDialog, open: false })}
      />
    </div>
  );
}