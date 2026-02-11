import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  ArrowLeft,
  ShoppingCart,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Utensils,
  Coffee,
  Edit,
  Trash2,
  Printer,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { orderService } from "~/services/httpServices/orderService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import OrdersSkeleton from "~/components/skeleton/OrdersSkeleton";
import type { ApiOrder } from "~/types/order";

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (id && !fetchedRef.current) {
      fetchOrderDetails(id);
      fetchedRef.current = true;
    }
  }, [id]);

  const fetchOrderDetails = async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getById(orderId);
      setOrder(response.data as any);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (order) {
      setDeleteId(order.id);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await orderService.delete(deleteId);
      navigate('/dashboard/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    } finally {
      setDeleteId(null);
    }
  };

  const formatPrice = (price: number) => {
    return `৳${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'online':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'kitchen':
        return <Utensils className="w-4 h-4" />;
      case 'bar':
        return <Coffee className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/orders')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-500 mb-6">
              {error || "The order you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={() => navigate('/dashboard/orders')}>
              Return to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = order.sub_total || 0;
  const discount = order.discount_amount || 0;
  const total = order.total_amount || 0;
  const isPending = order.status?.toLowerCase() === 'pending';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/orders')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Order Details
            </h1>
            <p className="text-gray-600">{order.order_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.status && order.status.toLowerCase() !== 'cancelled' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/orders/edit/${order.id}`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Order
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Implement print functionality */}}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="text-red-600 font-medium">Error</div>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status & Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status || '')}
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                    </div>
                    <Badge className={getStatusColor(order.status || '')}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Created:</span>
                    <span className="text-sm">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Updated:</span>
                    <span className="text-sm">{formatDate(order.updated_at)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Payment:</span>
                    <Badge className={getPaymentMethodColor(order.payment_method || '')}>
                      {order.payment_method || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Order Type:</span>
                    <Badge variant="secondary">{order.order_type || 'DINE-IN'}</Badge>
                  </div>
                  {!isPending && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                      <span className="text-lg font-bold text-green-600">{formatPrice(total)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Order Items ({order.order_items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.order_items && order.order_items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.order_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.item.image && (
                              <img
                                src={item.item.image}
                                alt={item.item.name || "N/A"}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.item.name || "N/A"}</div>
                              {item.item?.name_bn && (
                                <div className="text-sm text-gray-500">{item.item.name_bn}</div>
                              )}
                              {item.item_variation && (
                                <div className="text-xs text-gray-400">
                                  Variation: <span className="font-semibold">{item.item_variation.name}</span>
                                  {item.item_variation?.name_bn && (
                                    <> / <span>{item.item_variation?.name_bn || ""}</span></>
                                  )}
                                </div>
                              )}
                              {/* {item.item.description && (
                                <div className="text-xs text-gray-400 mt-1 max-w-xs">
                                  {item.item.description}
                                </div>
                              )} */}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-400 mt-1">
                            {item.item.type ? (
                              <span>{item.item.type}</span>
                            ) : (
                              <span>Unknown</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* Show variation price if exists, else item price */}
                          {item.item_variation ? (
                            Number(item.item_variation.sale_price) > 0 ? (
                              <>
                                <span className="line-through text-gray-400 mr-1">{formatPrice(Number(item.item_variation.regular_price))}</span>
                                <span className="text-green-600 font-semibold">{formatPrice(Number(item.item_variation.sale_price))}</span>
                              </>
                            ) : (
                              <span className="font-semibold">{formatPrice(Number(item.item_variation.regular_price))}</span>
                            )
                          ) : (
                            Number(item.item.sale_price) > 0 ? (
                              <>
                                <span className="line-through text-gray-400 mr-1">{formatPrice(Number(item.item.regular_price))}</span>
                                <span className="text-green-600 font-semibold">{formatPrice(Number(item.item.sale_price))}</span>
                              </>
                            ) : (
                              <span className="font-semibold">{formatPrice(Number(item.item.regular_price))}</span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.quantity}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(Number(item.total_price))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No items in this order</p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Order Tokens (bar/kitchen) */}
          {order.order_tokens && (
            <div className="space-y-6 mt-6">
              {Object.entries(order.order_tokens)
                .filter(([_, tokenObj]: any) => !!tokenObj)
                .map(([tokenType, tokenObj]: any) => (
                  <Card key={tokenObj.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="secondary">{tokenObj.token_type}</Badge>
                        <span className="font-mono text-xs">{tokenObj.token}</span>
                      </CardTitle>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <div>
                          <span className="font-semibold">Created:</span> {tokenObj.createdAt ? formatDate(tokenObj.createdAt) : 'N/A'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tokenObj.order_items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {item.item.image && (
                                    <img
                                      src={item.item.image}
                                      alt={item.item?.name || "N/A"}
                                      className="w-10 h-10 rounded-lg object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{item.item?.name || ""} {item.item_variation?.name ? `(${item.item_variation?.name})` : ""}</div>
                                    {item.item.name_bn && (
                                      <div className="text-sm text-gray-500">{item.item.name_bn} {item.item_variation?.name_bn ? `(${item.item_variation?.name_bn})` : ""}</div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {Number(item.item.sale_price) > 0 ? (
                                  <>
                                    <span className="line-through text-gray-400 mr-1">{formatPrice(Number(item.item.regular_price))}</span>
                                    <span className="text-green-600 font-semibold">{formatPrice(Number(item.item.sale_price))}</span>
                                  </>
                                ) : (
                                  <span className="font-semibold">{formatPrice(Number(item.item.regular_price))}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.quantity}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatPrice(Number(item.total_price))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Tables Information */}
          {order.tables && order.tables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Table Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.tables.map((table) => (
                    <div key={table.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Table {table.number}</div>
                        <Badge variant="outline">{table.seat} seats</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Location:</strong> {table.location || 'Not specified'}
                      </div>
                      {table.description && (
                        <div className="text-sm text-gray-500">{table.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer & Summary */}
        <div className="space-y-6">
          {/* Customer Information */}
          {order.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    {order.customer.picture ? (
                      <img
                        src={order.customer.picture}
                        alt={order.customer.name}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">{order.customer.name}</h3>
                    {order.customer.note && (
                      <Badge variant="secondary" className="mt-2">
                        {order.customer.note}
                      </Badge>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    {order.customer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{order.customer.phone}</span>
                      </div>
                    )}
                    {order.customer.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{order.customer.email}</span>
                      </div>
                    )}
                    {order.customer.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{order.customer.address}</span>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(parseFloat(order.customer.balance || '0'))}
                      </div>
                      <div className="text-xs text-gray-500">Balance</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {order.customer.points || '0'}
                      </div>
                      <div className="text-xs text-gray-500">Points</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary - Always show, but content differs based on status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPending ? (
                // Only show subtotal for pending orders
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">{formatPrice(Number(subtotal))}</span>
                  </div>
                </div>
              ) : (
                // Show full summary for non-pending orders
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">{formatPrice(Number(subtotal))}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="text-sm font-medium text-red-600">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg text-green-600">{formatPrice(total)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Information */}
          {order.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Served By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {order.user.picture ? (
                    <img
                      src={order.user.picture}
                      alt={`${order.user.first_name} ${order.user.last_name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {order.user.first_name} {order.user.last_name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {order.user.role?.charAt(0).toUpperCase() + order.user.role?.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Order?"
        description="Are you sure you want to delete this order? This action cannot be undone and will permanently remove all order data."
        confirmText="Delete Order"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}