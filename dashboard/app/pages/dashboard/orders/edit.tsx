import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useBackToList } from "~/hooks/useBackToList";
import { useSelector } from "react-redux";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import {
  ArrowLeft,
  Save,
  ShoppingCart,
  Plus,
  Minus,
  X,
  User,
  Calendar,
  DollarSign,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { orderService } from "~/services/httpServices/orderService";
import { tableService } from "~/services/httpServices/tableService";
import { customerService } from "~/services/httpServices/customerService";
import { productService } from "~/services/httpServices/productService";
import OrdersSkeleton from "~/components/skeleton/OrdersSkeleton";
import { categoryService } from "~/services/httpServices/categoryService";

const selectCurrentUser = (state: any) => state.auth?.user;

export default function EditOrderPage() {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { goBack, navigateWithPage } = useBackToList('/dashboard/orders');
  const user = useSelector(selectCurrentUser);
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [items, setItems] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [orderType, setOrderType] = useState("DINEIN");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [allTables, setAllTables] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, any[]>>({});
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tempSelectedTableIds, setTempSelectedTableIds] = useState<string[]>([]);

  useEffect(() => {
    customerService.getAll().then(res => setAllCustomers(res.data || []));
    tableService.getAll().then(res => setAllTables(res.data || []));
    productService.getAll({ limit: 10000 }).then(res => setAllProducts(res.data || []));
    categoryService.getAll({ limit: 1000 }).then(res => setCategories(res.data || []));
    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
    uniqueCategories.forEach(categorySlug => {
      if (!productsByCategory[categorySlug]) {
        productService.getAll({ categorySlug, limit: 1000 }).then(res => {
          setProductsByCategory(prev => ({
            ...prev,
            [categorySlug]: res.data || [],
          }));
        });
      }
    });
  }, [items.map(i => i.category).join(",")]);

  const fetchOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getById(orderId!);
      const orderData = response.data;
      setOrder(orderData);
      setStatus(orderData.status || "");
      setNotes(orderData.notes || "");
      setItems(
        (orderData.order_items || []).map((oi: any) => ({
          category: oi.item?.categories?.[0]?.slug || "",
          productId: oi.item?.id || "",
          variationId: oi.item_variation?.id || "",
          quantity: oi.quantity,
        }))
      );
      setTables(orderData.tables || []);
      setOrderType(orderData.order_type || "DINEIN");
      setCustomerId(orderData.customer?.id || "");

      const orderItems = orderData.order_items || [];
      // setItems(orderItems);
      const categoriesToLoad = Array.from(
        new Set(
          orderItems
            .map((oi: any) => oi.item?.categories?.[0]?.slug)
            .filter(Boolean)
        )
      );

      categoriesToLoad.forEach(categorySlug => {
        if (!productsByCategory[categorySlug]) {
          productService.getAll({ categorySlug, limit: 1000 }).then(res => {
            setProductsByCategory(prev => ({
              ...prev,
              [categorySlug]: res.data || [],
            }));
          });
        }
      });
    } catch (error) {
      setError("Failed to fetch order details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems(items.map((item, i) =>
      i === idx
        ? field === "category"
          ? { category: value, productId: "", variationId: "", quantity: 1 }
          : { ...item, [field]: value }
        : item
    ));
  };

  const handleAddItem = () => {
    setItems([...items, { category: "", productId: "", variationId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!orderId || !user?.id) return;

    setIsSaving(true);
    try {
      const order_items = items.map(item => {
        const products = productsByCategory[item.category] || [];
        const selectedProduct = products.find(p => p.id === item.productId);
        let unitPrice = 0;
        let item_variation_id = null;
        let item_id = selectedProduct ? selectedProduct.id : null;

        if (selectedProduct?.has_variations && item.variationId) {
          const v = selectedProduct.variations.find((v: any) => v.id === item.variationId);
          if (v) {
            unitPrice = Number(v.sale_price) > 0 ? Number(v.sale_price) : Number(v.regular_price);
            item_variation_id = v.id;
          } else {
            item_variation_id = null;
          }
        } else if (selectedProduct) {
          unitPrice = Number(selectedProduct.sale_price) > 0 ? Number(selectedProduct.sale_price) : Number(selectedProduct.regular_price);
        }

        const total_price = unitPrice * Number(item.quantity || 1);

        return {
          item_id,
          quantity: Number(item.quantity),
          unit_price: unitPrice,
          total_price,
          item_variation_id,
        };
      });

      let sub_total = items.reduce((sum, item) => {
        const products = productsByCategory[item.category] || [];
        const selectedProduct = products.find(p => p.id === item.productId);
        let unitPrice = 0;
        if (selectedProduct?.has_variations && item.variationId) {
          const v = selectedProduct.variations.find((v: any) => v.id === item.variationId);
          unitPrice = v ? Number(v.sale_price) > 0 ? Number(v.sale_price) : Number(v.regular_price) : 0;
        } else if (selectedProduct) {
          unitPrice = Number(selectedProduct.sale_price) > 0 ? Number(selectedProduct.sale_price) : Number(selectedProduct.regular_price);
        }
        return sum + unitPrice * Number(item.quantity || 1);
      }, 0);

      const tablesPayload = tables.map(t => t.id);
      const payload: any = {
        status,
        notes,
        order_items,
        tables: orderType === "DINEIN" ? tables.map(t => ({ id: t.id })) : [],
        order_type: orderType,
        customer_id: customerId || undefined,
        sub_total,
        total_amount: sub_total,
      };

      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (
          (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) ||
          value === null ||
          value === ""
        ) {
          delete payload[key];
        }
      });

      payload.order_items = payload.order_items.map((oi: any) => {
        delete oi.item;
        delete oi.order;
        return oi;
      });

      await orderService.update(orderId, payload);
      toast.success("Order updated successfully!");
      navigateWithPage(`/dashboard/orders/${orderId}`);
    } catch (error) {
      toast.error("Failed to update order. Please try again.");
      setError("Failed to update order. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return `৳${Number(price).toFixed(2)}`;
  };

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (error && !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-600 font-medium">Error</div>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Link to="/dashboard/orders" className="inline-block mt-3">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order not found</h3>
          <p className="text-gray-500 mb-6">
            The order you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/dashboard/orders">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              className="px-3 py-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-7 h-7 text-primary" /> Edit Order
            </CardTitle>
          </div>
        </CardHeader>
        <Separator className="mb-6" />
        <CardContent>
          {/* Order Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-10"
          >
            {/* Customer */}
            <div>
              <Label htmlFor="customer" className="mb-2 block font-semibold flex items-center gap-2">
                <User className="w-4 h-4" /> Customer (Optional)
              </Label>
              <Select
                id="customer"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full rounded-lg"
                required={false}
              >
                <option value="">Select customer</option>
                {allCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name || `${c.first_name} ${c.last_name}` || c.phone}
                  </option>
                ))}
              </Select>
            </div>
            {/* Order Type & Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="orderType" className="mb-2 block font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Order Type
                </Label>
                <Select
                  id="orderType"
                  value={orderType}
                  onChange={e => setOrderType(e.target.value)}
                  className="w-full rounded-lg"
                >
                  <option value="DINEIN">Dine In</option>
                  <option value="TAKEAWAY">Take Away</option>
                </Select>
              </div>
              {orderType === "DINEIN" && (
                <div>
                  <Label htmlFor="tableId" className="mb-2 block font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Table
                  </Label>
                  <Select
                    id="tableId"
                    value={tables[0]?.id || ""}
                    onChange={e => setTables([{ id: e.target.value }])}
                    className="w-full rounded-lg"
                  >
                    <option value="">Select table</option>
                    {allTables.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.number} {t.location ? `(${t.location})` : ""}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
            {/* Items */}
            <div>
              <Label className="mb-2 block font-semibold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Order Items
              </Label>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg bg-white">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-600 uppercase">
                      <th className="p-2 border-b">#</th>
                      <th className="p-2 border-b">Category</th>
                      <th className="p-2 border-b">Product</th>
                      <th className="p-2 border-b">Variation</th>
                      <th className="p-2 border-b">Qty</th>
                      <th className="p-2 border-b">Unit Price</th>
                      <th className="p-2 border-b">Total</th>
                      <th className="p-2 border-b"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const category =
                        item.category ||
                        item.item?.categories?.[0]?.slug ||
                        "";
                      const productId =
                        item.productId ||
                        item.item?.id ||
                        "";
                      const variationId =
                        item.variationId ||
                        item.item_variation?.id ||
                        "";
                      const quantity = item.quantity;
                      const products = productsByCategory[category] || [];
                      const selectedProduct = products.find(p => p.id === productId);
                      const hasVariations = selectedProduct?.has_variations;
                      const variations = selectedProduct?.variations || [];
                      let unitPrice = 0;
                      if (hasVariations && variationId) {
                        const v = variations.find((v: any) => v.id === variationId);
                        unitPrice = v ? Number(v.sale_price) > 0 ? Number(v.sale_price) : Number(v.regular_price) : 0;
                      } else if (selectedProduct) {
                        unitPrice = Number(selectedProduct.sale_price) > 0 ? Number(selectedProduct.sale_price) : Number(selectedProduct.regular_price);
                      }
                      const rowTotal = unitPrice * Number(quantity || 1);

                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="p-2 border-b text-center">{idx + 1}</td>
                          {/* Category */}
                          <td className="p-2 border-b">
                            <Select
                              value={category}
                              onChange={e => handleItemChange(idx, "category", e.target.value)}
                              className="w-full rounded"
                              required
                            >
                              <option value="">Select</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.slug}>
                                  {cat.name}
                                </option>
                              ))}
                            </Select>
                          </td>
                          {/* Product */}
                          <td className="p-2 border-b min-w-[180px]">
                            <Select
                              value={productId}
                              onChange={e => handleItemChange(idx, "productId", e.target.value)}
                              className="w-full rounded"
                              required
                              disabled={!category}
                            >
                              <option value="">Select</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name}{p.name_bn ? ` (${p.name_bn})` : ""}
                                </option>
                              ))}
                            </Select>
                          </td>
                          {/* Variation */}
                          <td className="p-2 border-b">
                            {hasVariations ? (
                              <Select
                                value={variationId}
                                onChange={e => handleItemChange(idx, "variationId", e.target.value)}
                                className="w-full rounded"
                                required
                              >
                                <option value="">Select</option>
                                {variations.map((v: any) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name}{v.name_bn ? ` (${v.name_bn})` : ""}
                                  </option>
                                ))}
                              </Select>
                            ) : (
                              <span className="text-xs text-gray-400 italic">N/A</span>
                            )}
                          </td>
                          {/* Quantity */}
                          <td className="p-2 border-b">
                            <Input
                              type="number"
                              min={1}
                              placeholder="Qty"
                              value={quantity}
                              onChange={e => handleItemChange(idx, "quantity", e.target.value)}
                              className="w-20"
                              required
                            />
                          </td>
                          {/* Unit Price */}
                          <td className="p-2 border-b text-right">
                            <span className="font-mono">
                              ৳{unitPrice.toFixed(2)}
                            </span>
                          </td>
                          {/* Row Total */}
                          <td className="p-2 border-b text-right">
                            <span className="font-mono font-semibold">
                              ৳{rowTotal.toFixed(2)}
                            </span>
                          </td>
                          {/* Remove */}
                          <td className="p-2 border-b text-center">
                            {items.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveItem(idx)}
                                title="Remove item"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={8} className="p-2 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddItem}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Item
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Summary */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-4">
              <span className="font-semibold text-lg">
                Total Items: <Badge>{items.length}</Badge>
              </span>
              <span className="font-semibold text-lg">
                Order Total:{" "}
                <Badge variant="secondary">
                  ৳{items.reduce((sum, item) => {
                    const products = productsByCategory[item.category] || [];
                    const selectedProduct = products.find(p => p.id === item.productId);
                    let unitPrice = 0;
                    if (selectedProduct?.has_variations && item.variationId) {
                      const v = selectedProduct.variations.find((v: any) => v.id === item.variationId);
                      unitPrice = v ? Number(v.sale_price) > 0 ? Number(v.sale_price) : Number(v.regular_price) : 0;
                    } else if (selectedProduct) {
                      unitPrice = Number(selectedProduct.sale_price) > 0 ? Number(selectedProduct.sale_price) : Number(selectedProduct.regular_price);
                    } else if (item.unit_price) {
                      unitPrice = Number(item.unit_price);
                    }
                    return sum + unitPrice * Number(item.quantity || 1);
                  }, 0).toFixed(2)}
                </Badge>
              </span>
            </div>
            {/* Actions */}
            <div className="flex justify-end gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isSaving || items.some(i => !i.productId)}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}