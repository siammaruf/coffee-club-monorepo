import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useBackToList } from "~/hooks/useBackToList";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import { productService } from "~/services/httpServices/productService";
import type { Product } from "~/types/product";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goBack, navigateWithPage } = useBackToList('/dashboard/products');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await productService.getById(productId);
      if (response && response.data) {
        setProduct(response.data);
      } else {
        setErrorDialog({
          open: true,
          message: "The product you're looking for doesn't exist.",
        });
      }
    } catch (error) {
      setErrorDialog({
        open: true,
        message: "Error fetching product.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await productService.delete(id!);
      goBack();
    } catch (error) {
      setErrorDialog({
        open: true,
        message: "Error deleting product.",
      });
    } finally {
      setDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
  };

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return "৳0.00";
    }
    return `৳${Number(price).toFixed(2)}`;
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bar':
        return 'bg-purple-100 text-purple-800';
      case 'food':
      case 'kitchen':
        return 'bg-green-100 text-green-800';
      case 'beverage':
        return 'bg-blue-100 text-blue-800';
      case 'snack':
        return 'bg-orange-100 text-orange-800';
      case 'dessert':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <ConfirmDialog
          open={errorDialog.open}
          title="Product Not Found"
          message={errorDialog.message}
          confirmText="Back to Products"
          cancelText=""
          onConfirm={() => {
            setErrorDialog({ open: false, message: "" });
            goBack();
          }}
          onCancel={() => setErrorDialog({ open: false, message: "" })}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Product Details</h1>
            <p className="text-gray-600">View and manage product information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => navigateWithPage(`/dashboard/products/edit/${product.id}`)}>
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Product Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full max-w-[200px] h-48 rounded-lg object-cover mb-4"
                />
              ) : (
                <div className="w-full max-w-[200px] h-48 rounded-lg bg-gray-200 flex items-center justify-center mb-4">
                  <Package className="w-12 h-12 text-gray-500" />
                </div>
              )}
              <h2 className="text-xl font-bold">{product.name}</h2>
              {product.name_bn && (
                <p className="text-lg text-gray-600 mt-1">{product.name_bn}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getTypeColor(product.type)}>
                  {product.type}
                </Badge>
                {product.categories && product.categories.length > 0 && product.categories.map((cat) => (
                  <Badge key={cat.id} variant="outline">{cat.name}</Badge>
                ))}
                {product.status && (
                  <Badge variant="secondary">{product.status.replace(/_/g, " ")}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="font-semibold mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Product Name</p>
                    <p className="font-medium">{product.name}</p>
                  </div>
                </div>
                {product.name_bn && (
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Product Name (Bengali)</p>
                      <p className="font-medium">{product.name_bn}</p>
                    </div>
                  </div>
                )}
                {product.categories && product.categories.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {product.categories.map((cat) => (
                          <Badge key={cat.id} variant="outline">{cat.name}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <Badge className={getTypeColor(product.type)}>
                      {product.type}
                    </Badge>
                  </div>
                </div>
                {product.status && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge variant="secondary">{product.status.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Pricing Information */}
            {!product.has_variations ? (
              <div>
                <h3 className="font-semibold mb-3">Pricing Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Regular Price</p>
                      <p className="font-medium text-lg">{formatPrice(product.regular_price)}</p>
                    </div>
                  </div>
                  {Number(product.sale_price) > 0 && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-600">Sale Price</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-lg text-red-600">
                            {formatPrice(product.sale_price)}
                          </p>
                          {Number(product.sale_price) < Number(product.regular_price) && (
                            <Badge variant="destructive" className="text-xs">
                              {Math.round((1 - Number(product.sale_price) / Number(product.regular_price)) * 100)}% OFF
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-3">Variations</h3>
                <div className="space-y-3">
                  {product.variations && product.variations.length > 0 ? (
                    product.variations.map((variation) => (
                      <div key={variation.id} className="flex items-center gap-4 border rounded p-3 bg-gray-50">
                        <div className="flex-1">
                          <p className="font-medium">{variation.name}</p>
                          {variation.name_bn && (
                            <p className="text-sm text-gray-500">{variation.name_bn}</p>
                          )}
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Regular Price:</span>
                          <span className="ml-1 font-semibold">{formatPrice(variation.regular_price)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Sale Price:</span>
                          <span className="ml-1 font-semibold text-red-600">{formatPrice(variation.sale_price)}</span>
                        </div>
                        <Badge variant="secondary">{variation.status.replace(/_/g, " ")}</Badge>
                        <span className="text-xs text-gray-400">Order: {variation.sort_order}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No variations found.</div>
                  )}
                </div>
              </div>
            )}

            {product.description && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">{product.description}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete ConfirmDialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        destructive
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}