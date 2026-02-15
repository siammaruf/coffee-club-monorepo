import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Plus, Eye, Pencil, Check, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
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

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    clearSelection();
  }, [viewMode]);

  useEffect(() => {
    // Fetch trash count on mount
    kitchenOrderService.getTrash({ page: 1, limit: 1 }).then((res: any) => setTrashCount(res.total || 0)).catch(() => {});
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = viewMode === 'active'
        ? await kitchenOrderService.getAll()
        : await kitchenOrderService.getTrash();
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
      setOrders(prev => prev.filter(o => o.id !== deleteOrderId));
      setTrashCount(prev => prev + 1);
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

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await kitchenOrderService.bulkDelete(Array.from(selectedIds));
      setOrders(prev => prev.filter(item => !selectedIds.has(item.id)));
      setTrashCount(prev => prev + selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
    setBulkLoading(false);
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => kitchenOrderService.restore(id)));
      setOrders(prev => prev.filter(item => !selectedIds.has(item.id)));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk restore failed:", error);
    }
    setBulkLoading(false);
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => kitchenOrderService.permanentDelete(id)));
      setOrders(prev => prev.filter(item => !selectedIds.has(item.id)));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  const handleRestore = async (id: string) => {
    try {
      await kitchenOrderService.restore(id);
      setOrders(prev => prev.filter(item => item.id !== id));
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await kitchenOrderService.permanentDelete(id);
      setOrders(prev => prev.filter(item => item.id !== id));
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Permanent delete failed:", error);
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
        {viewMode === 'active' && (
          <Button
            variant="default"
            onClick={() => navigate("/dashboard/kitchen-order/create")}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Order
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('active')}
            >
              Active
            </Button>
            <Button
              variant={viewMode === 'trash' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('trash')}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Trash {trashCount > 0 && `(${trashCount})`}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BulkActionBar
            selectedCount={selectedCount}
            onDelete={handleBulkDelete}
            onClearSelection={clearSelection}
            isTrashView={viewMode === 'trash'}
            onRestore={handleBulkRestore}
            onPermanentDelete={handleBulkPermanentDelete}
            loading={bulkLoading}
          />
          {isLoading ? (
            <div>Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {viewMode === 'trash' ? 'Trash is empty' : 'No kitchen orders found'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {viewMode === 'trash'
                  ? 'No deleted orders found.'
                  : 'Start by adding orders for your kitchen items.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelected(orders.map(o => o.id))}
                      onChange={() => toggleSelectAll(orders.map(o => o.id))}
                    />
                  </TableHead>
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
                    <TableCell>
                      <Checkbox
                        checked={isSelected(order.id)}
                        onChange={() => toggleSelect(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">#{order.order_id}</TableCell>
                    <TableCell>{order.total_amount}</TableCell>
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
                      {viewMode === 'active' ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(order.id)}
                            title="Restore"
                            className="text-green-600 hover:bg-green-50 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePermanentDelete(order.id)}
                            title="Delete Permanently"
                            className="text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
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
