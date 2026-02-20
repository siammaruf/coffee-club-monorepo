import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { orderService } from "~/services/httpServices/orderService";
import { customerService } from "~/services/httpServices/customerService";
import { tableService } from "~/services/httpServices/tableService";
import { productService } from "~/services/httpServices/productService";
import { categoryService } from "~/services/httpServices/categoryService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { Plus, Trash2, User, List, ShoppingCart, Table as TableIcon } from "lucide-react";
import { useSelector } from "react-redux";

const selectCurrentUser = (state: any) => state.auth?.user;

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, any[]>>({});
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [orderType, setOrderType] = useState("DINEIN");
  const [tableId, setTableId] = useState("");
  const [items, setItems] = useState([{ category: "", productId: "", variationId: "", quantity: 1 }]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    title: "",
    message: "",
    isError: false,
  });

  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    customerService.getAll().then(res => setCustomers(res.data || []));
    tableService.getAll().then(res => setTables(res.data || []));
    categoryService.getAll({ limit: 1000 }).then(res => setCategories(res.data || []));
    productService.getAll({ limit: 10000 }).then(res => setAllProducts(res.data || []));
  }, []);

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

  const handleAddItem = () => {
    setItems([...items, { category: "", productId: "", variationId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) {
        setStatusDialog({
          open: true,
          title: "Error",
          message: "User not found. Please login again.",
          isError: true,
        });
        setIsLoading(false);
        return;
      }

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

      const payload: any = {
        order_type: orderType,
        tables: orderType === "DINEIN" && tableId ? [{ id: tableId }] : [],
        user_id: user.id,
        status: "PENDING",
        payment_method: "CASH",
        order_items,
        sub_total,
        order_tables: orderType === "DINEIN" && tableId ? [tableId] : [],
      };

      if (customerId) {
        payload.customer_id = customerId;
      }

      delete payload.user;
      if (payload.customer === null) delete payload.customer;
      if (!payload.discount_id) delete payload.discount_id;
      if (!payload.discount) delete payload.discount;

      payload.order_items = payload.order_items.map((oi: any) => {
        delete oi.item;
        delete oi.order;
        return oi;
      });

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

      await orderService.create(payload);

      setStatusDialog({
        open: true,
        title: "Success",
        message: "Order created successfully!",
        isError: false,
      });

      setTimeout(() => {
        navigate("/dashboard/orders");
      }, 1000);
    } catch (error: any) {
      setStatusDialog({
        open: true,
        title: "Error",
        message: error?.message || "Failed to create order.",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/orders")}
              className="px-3 py-1"
            >
              ← Back
            </Button>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-7 h-7 text-primary" /> Create New Order
            </CardTitle>
          </div>
        </CardHeader>
        <Separator className="mb-6" />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Customer (not required) */}
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
                {customers.map(c => (
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
                  <List className="w-4 h-4" /> Order Type
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
                    <TableIcon className="w-4 h-4" /> Table
                  </Label>
                  <Select
                    id="tableId"
                    value={tableId}
                    onChange={e => setTableId(e.target.value)}
                    className="w-full rounded-lg"
                    required={orderType === "DINEIN"}
                  >
                    <option value="">Select table</option>
                    {tables.map(t => (
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
                      const products = productsByCategory[item.category] || [];
                      const selectedProduct = products.find(p => p.id === item.productId);
                      const hasVariations = selectedProduct?.has_variations;
                      const variations = selectedProduct?.variations || [];
                      let unitPrice = 0;
                      if (hasVariations && item.variationId) {
                        const v = variations.find((v: any) => v.id === item.variationId);
                        unitPrice = v ? Number(v.sale_price) > 0 ? Number(v.sale_price) : Number(v.regular_price) : 0;
                      } else if (selectedProduct) {
                        unitPrice = Number(selectedProduct.sale_price) > 0 ? Number(selectedProduct.sale_price) : Number(selectedProduct.regular_price);
                      }
                      const rowTotal = unitPrice * Number(item.quantity || 1);

                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="p-2 border-b text-center">{idx + 1}</td>
                          {/* Category */}
                          <td className="p-2 border-b">
                            <Select
                              value={item.category}
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
                              value={item.productId}
                              onChange={e => handleItemChange(idx, "productId", e.target.value)}
                              className="w-full rounded"
                              required
                              disabled={!item.category}
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
                                value={item.variationId}
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
                              value={item.quantity}
                              onChange={e => handleItemChange(idx, "quantity", Number(e.target.value) || 1)}
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
                                <Trash2 className="w-4 h-4" />
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
                          className="mt-2 cursor-pointer"
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
                <Badge variant="secondary" className="text-lg">
                  ৳{items.reduce((sum, item) => {
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
                  }, 0).toFixed(2)}
                </Badge>
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/orders")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={isLoading || items.some(i => !i.productId)}>
                {isLoading ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={statusDialog.open}
        title={statusDialog.title}
        description={statusDialog.message}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setStatusDialog({ ...statusDialog, open: false })}
        onCancel={() => setStatusDialog({ ...statusDialog, open: false })}
      />
    </div>
  );
}