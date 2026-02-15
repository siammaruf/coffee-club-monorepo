import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select } from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  ShoppingCart,
  User,
  Calendar,
  DollarSign,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import OrdersSkeleton from "~/components/skeleton/OrdersSkeleton";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { orderService } from "~/services/httpServices/orderService";
import type {ApiOrder, GetAllOrdersParams} from "~/types/order";
import { Pagination } from "~/components/ui/pagination";
import { getPageFromUrl } from "~/utils/common";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";

export default function OrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, searchTerm, statusFilter, paymentFilter, dateFilter, viewMode]);

  useEffect(() => {
    const urlPage = getPageFromUrl();
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [location.search]);

  // Fetch trash count on initial load
  useEffect(() => {
    orderService.getTrash({ page: 1, limit: 1 }).then((res: any) => {
      setTrashCount(res.total || 0);
    }).catch(() => {});
  }, []);

  // Clear selection when viewMode changes
  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: GetAllOrdersParams = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
        dateFilter: dateFilter || undefined,
      };

      const response = viewMode === 'trash'
        ? await orderService.getTrash(params as any)
        : await orderService.getAll(params);
      const data: any = response;

      setOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
      setOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await orderService.delete(deleteId);
      setDeleteId(null);
      setOrders(prev => prev.filter(order => order.id !== deleteId));
      setTotalOrders(prev => prev - 1);
      setTrashCount(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await orderService.restore(id);
      setOrders(prev => prev.filter(order => order.id !== id));
      setTotalOrders(prev => prev - 1);
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    setPermanentDeleteId(id);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteId) return;
    try {
      await orderService.permanentDelete(permanentDeleteId);
      setOrders(prev => prev.filter(order => order.id !== permanentDeleteId));
      setTotalOrders(prev => prev - 1);
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
    setPermanentDeleteId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await orderService.bulkDelete(Array.from(selectedIds));
      setOrders(prev => prev.filter(order => !selectedIds.has(order.id)));
      setTotalOrders(prev => prev - selectedIds.size);
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
      await Promise.all(Array.from(selectedIds).map(id => orderService.restore(id)));
      setOrders(prev => prev.filter(order => !selectedIds.has(order.id)));
      setTotalOrders(prev => prev - selectedIds.size);
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
      await Promise.all(Array.from(selectedIds).map(id => orderService.permanentDelete(id)));
      setOrders(prev => prev.filter(order => !selectedIds.has(order.id)));
      setTotalOrders(prev => prev - selectedIds.size);
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(location.search);
    params.set("page", newPage.toString());
    navigate({ search: params.toString() });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPaymentFilter("");
    setDateFilter("");
    setCurrentPage(1);
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

  const hasActiveFilters = searchTerm || statusFilter || paymentFilter || dateFilter;
  const hasOrders = orders.length > 0;

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  // Safe calculations with null checks
  const totalSales = orders.reduce((sum, order) =>
    order.status?.toLowerCase() !== 'cancelled' ? sum + (order.total_amount || 0) : sum, 0);

  const completedOrders = orders.filter(order => order.status?.toLowerCase() === 'completed').length;
  const pendingOrders = orders.filter(order => order.status?.toLowerCase() === 'pending').length;
  const cancelledOrders = orders.filter(order => order.status?.toLowerCase() === 'cancelled').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Orders
          </h1>
          <p className="text-gray-600">Manage your customer orders</p>
        </div>
        <Link to="/dashboard/orders/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Order
          </Button>
        </Link>
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

      {/* Stats Cards - Only show if we have orders and in active view */}
      {hasOrders && viewMode === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Sales (Current Page)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalSales)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Tables Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.reduce((count, order) => count + (order.tables?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {completedOrders} Completed
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingOrders} Pending
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {cancelledOrders} Cancelled
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table or Empty State */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <CardTitle>
                {hasOrders ? `Orders (${totalOrders} total)` : 'Orders'}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setViewMode('active'); clearSelection(); setCurrentPage(1); }}
                >
                  Active
                </Button>
                <Button
                  variant={viewMode === 'trash' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setViewMode('trash'); clearSelection(); setCurrentPage(1); }}
                >
                  Trash ({trashCount})
                </Button>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>

              <Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Payment Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </Select>

              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasOrders ? (
            <>
              <BulkActionBar
                selectedCount={selectedCount}
                onDelete={handleBulkDelete}
                onClearSelection={clearSelection}
                isTrashView={viewMode === 'trash'}
                onRestore={handleBulkRestore}
                onPermanentDelete={handleBulkPermanentDelete}
                loading={bulkLoading}
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected(orders.map(o => o.id))}
                        onChange={() => toggleSelectAll(orders.map(o => o.id))}
                      />
                    </TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Tables</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="w-[40px]">
                        <Checkbox
                          checked={isSelected(order.id)}
                          onChange={() => toggleSelect(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.order_id}...</div>
                        <div className="text-xs text-gray-500">
                          Discount: {formatPrice(order.discount_amount || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.tables?.length > 0 ?
                            order.tables.map(table => `${table.number} (${table.seat} seats)`).join(', ') :
                            'No table assigned'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(order.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status || '')}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(order.payment_method || '')}>
                          {order.payment_method || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatPrice(order.total_amount || 0)}</div>
                      </TableCell>
                      <TableCell>
                        {viewMode === 'trash' ? (
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleRestore(order.id)} title="Restore">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => handlePermanentDelete(order.id)} title="Delete Permanently">
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Order
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(order.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Page size selector */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Show</span>
                <Select
                  value={pageSize.toString()}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="w-20"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </Select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Pagination controls using Pagination component */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalOrders}
                  itemsPerPage={pageSize}
                  onPageChange={handlePageChange}
                />
              )}

              {/* No filtered results message */}
              {!hasOrders && hasActiveFilters && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No orders found matching your filters.</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Try adjusting your search terms or clearing filters to see more results.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* No orders at all - Empty state */
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {viewMode === 'trash' ? 'Trash is empty' : 'No orders yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {viewMode === 'trash'
                  ? 'No deleted orders found.'
                  : 'When customers place orders, they will appear here.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog (soft delete) */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Order?"
        description="Are you sure you want to delete this order? It will be moved to trash."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      {/* Permanent Delete ConfirmDialog */}
      <ConfirmDialog
        open={!!permanentDeleteId}
        title="Permanently Delete Order?"
        description="Are you sure you want to permanently delete this order? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handlePermanentDeleteConfirm}
        onCancel={() => setPermanentDeleteId(null)}
      />
    </div>
  );
}
