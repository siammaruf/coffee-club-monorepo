import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Plus, Eye, Pencil, Check } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { useNavigate } from "react-router";
import { kitchenOrderService } from "~/services/httpServices/kitchenOrderService";
import type { KitchenOrderResponse } from "~/types/kitchenOrder";

export default function KitchenOrderPage() {
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<KitchenOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await kitchenOrderService.getAll();
      setOrders((res as any).data || []);
    } catch (error) {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;
    setApiError("");
    setModalLoading(true);
    try {
      await kitchenOrderService.delete(deleteOrderId);
      fetchOrders();
      setDeleteOrderId(null);
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Failed to delete order");
    } finally {
      setModalLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setApiError("");
    setModalLoading(true);
    try {
      await kitchenOrderService.approve(orderId);
      fetchOrders();
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Failed to approve order");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Kitchen Orders
          </h1>
          <p className="text-gray-600">Manage your kitchen order records</p>
        </div>
        <Button
          variant="default"
          onClick={() => navigate("/dashboard/kitchen-order/create")}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Order
        </Button>
      </div>
      <Card>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No kitchen orders found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start by adding orders for your kitchen items.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-2 text-left">Order ID</TableHead>
                  <TableHead className="px-4 py-2 text-left">Total Amount</TableHead>
                  <TableHead className="px-4 py-2 text-left">Created At</TableHead>
                  <TableHead className="px-4 py-2 text-center">Approved</TableHead>
                  <TableHead className="px-4 py-2 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-semibold text-gray-900">#{order.order_id}</TableCell>
                    <TableCell>৳{order.total_amount}</TableCell>
                    <TableCell>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {order.is_approved ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-semibold">Approved</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs font-semibold">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        size="sm"
                        onClick={() => navigate(`/dashboard/kitchen-order/${order.id}`)}
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!order.is_approved && (
                      <>
                        <Button
                          variant="outline"
                          className="cursor-pointer"
                          size="sm"
                          onClick={() => navigate(`/dashboard/kitchen-order/edit/${order.id}`)}
                          title="Edit"
                        >
                        <Pencil className="w-4 h-4" />
                        </Button>
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            size="sm"
                            onClick={() => handleApproveOrder(order.id)}
                            title="Approve"
                          >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                      </>
                      )}
                      <Button
                        variant="destructive"
                        className="cursor-pointer"
                        size="sm"
                        onClick={() => setDeleteOrderId(order.id)}
                        title="Delete"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={!!deleteOrderId}
        title="Delete Kitchen Order?"
        description="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteOrderId(null)}
        loading={modalLoading}
      />
    </div>
  );
}
