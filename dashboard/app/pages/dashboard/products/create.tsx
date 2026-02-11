import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select } from "../../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Coffee, 
  DollarSign, 
  X, 
  Check,
  Search,
  GripVertical
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../../components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import type { ProductFormValues } from "~/types/product";
import { ItemType } from "~/enums/product.enum";
import { categoryService } from "~/services/httpServices/categoryService";
import { productService } from "~/services/httpServices/productService";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

interface Category {
  id: string;
  name: string;
}

export default function CreateProduct() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    title: "",
    message: "",
    isError: false,
  });
  const [variations, setVariations] = useState([
    { name: "", name_bn: "", regular_price: 0, sale_price: 0, status: "available", sort_order: 1 }
  ]);
  const [hasVariations, setHasVariations] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors } 
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      name_bn: "",
      description: "",
      type: "",
      regular_price: 0,
      sale_price: 0,
      category: "",
      status: "available",
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll({ limit: 1000 });
        setCategories(response.data || []);
      } catch (error) {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

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
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
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
      { name: "", name_bn: "", regular_price: 0, sale_price: 0, status: "available", sort_order: prev.length + 1 }
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

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'category') {
          formData.append(key, value?.toString() || "");
        }
      });

      formData.append("has_variations", hasVariations ? "true" : "false");

      if (hasVariations && variations.length > 0) {
        variations.forEach((variation, idx) => {
          formData.append(`variations[${idx}][name]`, variation.name);
          formData.append(`variations[${idx}][name_bn]`, variation.name_bn);
          formData.append(`variations[${idx}][regular_price]`, Number(variation.regular_price).toString());
          formData.append(`variations[${idx}][sale_price]`, Number(variation.sale_price).toString());
          formData.append(`variations[${idx}][status]`, variation.status);
          formData.append(`variations[${idx}][sort_order]`, Number(variation.sort_order).toString());
        });
      }

      if (selectedCategories.length > 0) {
        selectedCategories.forEach((catId) => {
          formData.append("categories", catId);
        });
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await productService.create(formData);

      setStatusDialog({
        open: true,
        title: "Success",
        message: "Product created successfully",
        isError: false,
      });

      setTimeout(() => {
        navigate('/dashboard/products');
      }, 1000);

    } catch (error) {
      console.error('Error creating product:', error);
      let apiMessage = "Failed to save product.";
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
      setStatusDialog({
        open: true,
        title: "Error",
        message: apiMessage,
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <Card className="max-w-5xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/products')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Create New Product</h1>
            </div>
          </div>
          <CardDescription className="mt-2">
            Fill in the details below to add a new product to your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Product Image Upload */}
            <div>
              <Label htmlFor="image" className="mb-1 block">Product Image</Label>
              <div className="flex items-center gap-4">
                <div
                  className={`w-20 h-20 rounded border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 ${
                    imagePreview ? "border-gray-300" : "border-gray-200"
                  }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <div className="relative">
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
                  <div className="text-xs text-gray-400 mt-1">JPG, PNG, or GIF. Max 2MB.</div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            {/* Basic Information Section */}
            <div>
              <h3 className="text-base font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                <Coffee className="w-4 h-4" />
                Basic Information
              </h3>
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className={`mb-2 ${errors.name ? "text-red-500" : ""}`}>
                  Product Name *
                </Label>
                <Input
                  id="name"
                  className={`mb-4 ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Enter product name"
                  {...register("name", { required: "Product name is required" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
              {/* Product Name (Bengali) */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="name_bn">Product Name (Bengali)</Label>
                <Input
                  id="name_bn"
                  placeholder="পণ্যের নাম বাংলায়"
                  {...register("name_bn")}
                />
              </div>
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  rows={3}
                  {...register("description")}
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* Classification Section */}
            <div>
              <h3 className="text-base font-semibold text-muted-foreground mb-2">Classification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className={errors.type ? "text-red-500" : ""}>
                    Product Type *
                  </Label>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Product type is required" }}
                    render={({ field }) => (
                      <Select 
                        onChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <option value="" disabled>Select type</option>
                        <option value={ItemType.BAR}>Bar Item</option>
                        <option value={ItemType.KITCHEN}>Kitchen Item</option>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
                  )}
                </div>
                {/* Categories */}
                <div className="space-y-2">
                  <Label htmlFor="categories">Categories *</Label>
                  <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isCategoryPopoverOpen}
                        className="w-full justify-between"
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
                      {selectedCategories.map((categoryId) => {
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
              </div>
            </div>

            <hr className="my-4" />

            {/* Pricing Section */}
            {!hasVariations && (
              <div>
                <h3 className="text-base font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" />
                  Pricing
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Regular Price */}
                  <div className="space-y-2">
                    <Label htmlFor="regular_price" className={errors.regular_price ? "text-red-500" : ""}>
                      Regular Price *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ৳
                      </span>
                      <Input
                        id="regular_price"
                        type="number"
                        step="0.01"
                        min="0"
                        className={`pl-7 ${errors.regular_price ? "border-red-500" : ""}`}
                        placeholder="0.00"
                        {...register("regular_price", { 
                          required: "Price is required",
                          min: { value: 0, message: "Price cannot be negative" } 
                        })}
                      />
                    </div>
                    {errors.regular_price && (
                      <p className="text-red-500 text-xs mt-1">{errors.regular_price.message}</p>
                    )}
                    <span className="text-xs text-gray-400">Set the standard price for this product.</span>
                  </div>
                  {/* Sale Price */}
                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Sale Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ৳
                      </span>
                      <Input
                        id="sale_price"
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-7"
                        placeholder="0.00"
                        {...register("sale_price", { 
                          min: { value: 0, message: "Price cannot be negative" } 
                        })}
                      />
                    </div>
                    {errors.sale_price && (
                      <p className="text-red-500 text-xs mt-1">{errors.sale_price.message}</p>
                    )}
                    <span className="text-xs text-gray-400">Optional: Set a discounted price.</span>
                  </div>
                </div>
              </div>
            )}

            <hr className="my-4" />

            {/* Status Section */}
            <div>
              <Label
                htmlFor="status"
                className={`mb-2 block ${errors.status ? "text-red-500" : ""}`}
              >
                Status *
              </Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    id="status"
                  >
                    <option value="" disabled>Select status</option>
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="on_sale">On Sale</option>
                    <option value="discontinued">Discontinued</option>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
              )}
            </div>

            <hr className="my-4" />

            {/* Variations Section */}
            <div>
              <Label>
                <input
                  type="checkbox"
                  checked={hasVariations}
                  onChange={e => setHasVariations(e.target.checked)}
                />
                This product has variations
              </Label>
              {hasVariations && (
                <div className="mt-4 space-y-4">
                  <DragDropContext onDragEnd={handleVariationDragEnd}>
                    <Droppable droppableId="variations-droppable">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {variations.map((variation, idx) => (
                            <Draggable key={idx} draggableId={`variation-${idx}`} index={idx}>
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
                                    value={variation.regular_price}
                                    className="w-1/3"
                                    step="0.01"
                                    min={0}
                                    onChange={e => handleVariationChange(idx, "regular_price", parseFloat(Number(e.target.value).toFixed(2)))}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Sale Price"
                                    value={variation.sale_price}
                                    className="w-1/3"
                                    step="0.01"
                                    min={0}
                                    onChange={e => handleVariationChange(idx, "sale_price", parseFloat(Number(e.target.value).toFixed(2)))}
                                  />
                                  <Select
                                    value={variation.status}
                                    onChange={e => handleVariationChange(idx, "status", e.target.value)}
                                    style={{ minWidth: 140 }}
                                  >
                                    <option value="available">Available</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="on_sale">On Sale</option>
                                    <option value="discontinued">Discontinued</option>
                                  </Select>
                                  <Input
                                    type="hidden"
                                    placeholder="Sort Order"
                                    value={variation.sort_order}
                                    onChange={e => handleVariationChange(idx, "sort_order", Number(e.target.value))}
                                  />
                                  <Button type="button" className="cursor-pointer" variant="destructive" onClick={() => removeVariation(idx)}>
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
                  <Button type="button" className="cursor-pointer" onClick={addVariation}>
                    Add Variation
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/products')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="product-form"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Creating...' : 'Create Product'}
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