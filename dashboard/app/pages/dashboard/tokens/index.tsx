import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Select } from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Coffee,
  Utensils,
  Bell,
  Filter,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import TokensSkeleton from "~/components/skeleton/TokensSkeleton";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import { useDebounce } from "~/hooks/useDebounce";
import { orderTokensService } from "~/services/httpServices/orderTokensService";
import type { OrderToken, OrderTokenStatus } from "~/types/orderToken";
import { Pagination } from "~/components/ui/pagination";
import { toast } from "sonner";

export default function OrderTokensPage() {
  const navigate = useNavigate();
  const [orderTokens, setOrderTokens] = useState<OrderToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<OrderToken[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionToken, setActionToken] = useState<{ id: string; action: string } | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "trash">("active");
  const [trashCount, setTrashCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 20;

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } =
    useTableSelection();

  useEffect(() => {
    fetchOrderTokens();
    clearSelection();
  }, [viewMode, currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, viewMode]);

  // Refresh trash count on load
  useEffect(() => {
    orderTokensService
      .getTrash({ page: 1, limit: 1 })
      .then((res: any) => setTrashCount(res.data?.total || res.total || 0))
      .catch(() => {});
  }, []);

  // 30-second auto-refresh (active view only)
  useEffect(() => {
    if (viewMode !== "active") return;
    const interval = setInterval(() => {
      fetchOrderTokens();
    }, 30000);
    return () => clearInterval(interval);
  }, [viewMode, currentPage, debouncedSearch]);

  // Client-side filter by status/area/priority on top of server data
  useEffect(() => {
    let filtered = orderTokens;

    if (statusFilter) {
      filtered = filtered.filter((t) => t.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (areaFilter) {
      filtered = filtered.filter((t) => t.token_type === areaFilter);
    }
    if (priorityFilter) {
      filtered = filtered.filter((t) => t.priority.toLowerCase() === priorityFilter.toLowerCase());
    }

    setFilteredTokens(filtered);
  }, [orderTokens, statusFilter, areaFilter, priorityFilter]);

  const fetchOrderTokens = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res: any =
        viewMode === "trash"
          ? await orderTokensService.getTrash(params)
          : await orderTokensService.getAll(params);

      const data = res?.data?.data ?? res?.data ?? [];
      const resTotal = res?.data?.total ?? res?.total ?? 0;
      const resTotalPages = res?.data?.totalPages ?? res?.totalPages ?? 0;

      setOrderTokens(Array.isArray(data) ? data : []);
      setTotal(resTotal);
      setTotalPages(resTotalPages);
    } catch (error) {
      console.error("Error fetching order tokens:", error);
      setOrderTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setActionToken({ id, action: newStatus });
  };

  const handleActionConfirm = async () => {
    if (!actionToken) return;
    try {
      await orderTokensService.update(actionToken.id, {
        status: actionToken.action as OrderTokenStatus,
      });
      setOrderTokens((prev) =>
        prev.map((t) =>
          t.id === actionToken.id
            ? { ...t, status: actionToken.action as OrderTokenStatus, updatedAt: new Date().toISOString() }
            : t
        )
      );
      setActionToken(null);
      toast.success("Token status updated.");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update status.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await orderTokensService.bulkDelete(Array.from(selectedIds));
      setOrderTokens((prev) => prev.filter((t) => !selectedIds.has(t.id)));
      setTrashCount((prev) => prev + selectedIds.size);
      clearSelection();
      toast.success(`${selectedIds.size} token(s) moved to trash.`);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Bulk delete failed.");
    }
    setBulkLoading(false);
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await orderTokensService.bulkRestore(Array.from(selectedIds));
      setOrderTokens((prev) => prev.filter((t) => !selectedIds.has(t.id)));
      setTrashCount((prev) => prev - selectedIds.size);
      clearSelection();
      toast.success(`${selectedIds.size} token(s) restored.`);
    } catch (error) {
      console.error("Bulk restore failed:", error);
      toast.error("Bulk restore failed.");
    }
    setBulkLoading(false);
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await orderTokensService.bulkPermanentDelete(Array.from(selectedIds));
      setOrderTokens((prev) => prev.filter((t) => !selectedIds.has(t.id)));
      setTrashCount((prev) => prev - selectedIds.size);
      clearSelection();
      toast.success(`${selectedIds.size} token(s) permanently deleted.`);
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
      toast.error("Bulk permanent delete failed.");
    }
    setBulkLoading(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setAreaFilter("");
    setPriorityFilter("");
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const getTimeFromNow = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Preparing":
        return "bg-blue-100 text-blue-800";
      case "Ready":
        return "bg-green-100 text-green-800";
      case "Delivered":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Normal":
        return "bg-gray-100 text-gray-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAreaIcon = (tokenType: string) => {
    return tokenType === "BAR" ? <Coffee className="w-4 h-4" /> : <Utensils className="w-4 h-4" />;
  };

  const getAreaLabel = (tokenType: string) => {
    return tokenType === "BAR" ? "Bar" : "Kitchen";
  };

  const getActionDialogDetails = () => {
    if (!actionToken) return { title: "", description: "" };
    const token = orderTokens.find((t) => t.id === actionToken.id);
    if (!token) return { title: "", description: "" };
    switch (actionToken.action) {
      case "Preparing":
        return {
          title: "Start Preparing?",
          description: `Are you sure you want to start preparing order ${token.token}?`,
        };
      case "Ready":
        return {
          title: "Mark as Ready?",
          description: `Confirm that order ${token.token} is ready for service.`,
        };
      case "Delivered":
        return {
          title: "Mark as Delivered?",
          description: `Confirm that order ${token.token} has been delivered to the customer.`,
        };
      case "Cancelled":
        return {
          title: "Cancel Order?",
          description: `Are you sure you want to cancel order ${token.token}? This action cannot be undone.`,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const hasActiveFilters = searchTerm || statusFilter || areaFilter || priorityFilter;
  const hasTokens = orderTokens.length > 0;
  const hasFilteredResults = filteredTokens.length > 0;

  const pendingTokens = orderTokens.filter((t) => t.status === "Pending").length;
  const preparingTokens = orderTokens.filter((t) => t.status === "Preparing").length;
  const readyTokens = orderTokens.filter((t) => t.status === "Ready").length;

  if (isLoading && orderTokens.length === 0) {
    return <TokensSkeleton />;
  }

  const { title: actionTitle, description: actionDescription } = getActionDialogDetails();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Order Tokens
          </h1>
          <p className="text-gray-600">Manage kitchen and bar orders</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "active" ? "default" : "outline"}
            onClick={() => setViewMode("active")}
          >
            Active
          </Button>
          <Button
            variant={viewMode === "trash" ? "default" : "outline"}
            onClick={() => setViewMode("trash")}
            className="relative"
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Trash
            {trashCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {trashCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards — active view only */}
      {viewMode === "active" && hasTokens && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className={pendingTokens > 0 ? "border-yellow-300" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className={`w-4 h-4 ${pendingTokens > 0 ? "text-yellow-500" : ""}`} />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pendingTokens > 0 ? "text-yellow-600" : "text-gray-900"}`}>
                {pendingTokens}
              </div>
            </CardContent>
          </Card>
          <Card className={preparingTokens > 0 ? "border-blue-300" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${preparingTokens > 0 ? "text-blue-500" : ""}`} />
                Preparing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${preparingTokens > 0 ? "text-blue-600" : "text-gray-900"}`}>
                {preparingTokens}
              </div>
            </CardContent>
          </Card>
          <Card className={readyTokens > 0 ? "border-green-300" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Bell className={`w-4 h-4 ${readyTokens > 0 ? "text-green-500" : ""}`} />
                Ready to Serve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${readyTokens > 0 ? "text-green-600" : "text-gray-900"}`}>
                {readyTokens}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Active Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orderTokens.filter((t) => ["Pending", "Preparing", "Ready"].includes(t.status)).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {viewMode === "trash"
                ? `Trashed Tokens (${total})`
                : hasTokens
                ? `Current Orders (${total})`
                : "Order Tokens"}
            </CardTitle>
            <div className="flex gap-4 items-center">
              <Select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Areas</option>
                <option value="BAR">Bar</option>
                <option value="KITCHEN">Kitchen</option>
              </Select>

              {viewMode === "active" && (
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              )}

              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Priorities</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
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
          <BulkActionBar
            selectedCount={selectedCount}
            onDelete={handleBulkDelete}
            onClearSelection={clearSelection}
            isTrashView={viewMode === "trash"}
            onRestore={handleBulkRestore}
            onPermanentDelete={handleBulkPermanentDelete}
            loading={bulkLoading}
          />
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : hasTokens ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected(filteredTokens.map((t) => t.id))}
                        onChange={() => toggleSelectAll(filteredTokens.map((t) => t.id))}
                      />
                    </TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-center">Area</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    {viewMode === "active" && (
                      <TableHead className="w-[150px]">Actions</TableHead>
                    )}
                    {viewMode === "trash" && (
                      <TableHead className="w-[150px]">Restore</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTokens.map((token) => (
                    <TableRow
                      key={token.id}
                      className={
                        token.priority === "Urgent"
                          ? "bg-red-50"
                          : token.priority === "High"
                          ? "bg-orange-50"
                          : ""
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected(token.id)}
                          onChange={() => toggleSelect(token.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{token.token}</div>
                        <div className="text-xs text-gray-500">Order: {token.orderId}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 justify-center max-w-[100px] mx-auto"
                        >
                          {getAreaIcon(token.token_type)}
                          {getAreaLabel(token.token_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {token.order_items.map((orderItem, idx) => (
                            <div key={orderItem.id ?? idx} className={idx !== 0 ? "mt-1" : ""}>
                              <span className="font-medium">{orderItem.quantity}x</span>{" "}
                              {orderItem.item?.name ?? "Item"}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(token.priority)}>{token.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(token.status)}>{token.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className="text-sm font-medium"
                          title={format(new Date(token.createdAt), "MMM dd, yyyy h:mm a")}
                        >
                          {formatTime(token.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTimeFromNow(token.createdAt)}
                        </div>
                      </TableCell>
                      {viewMode === "active" && (
                        <TableCell>
                          {token.status === "Pending" && (
                            <Button
                              size="sm"
                              className="w-full mb-1"
                              onClick={() => handleStatusUpdate(token.id, "Preparing")}
                            >
                              Start Preparing
                            </Button>
                          )}
                          {token.status === "Preparing" && (
                            <Button
                              size="sm"
                              className="w-full mb-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusUpdate(token.id, "Ready")}
                            >
                              Mark Ready
                            </Button>
                          )}
                          {token.status === "Ready" && (
                            <Button
                              size="sm"
                              className="w-full mb-1 bg-purple-600 hover:bg-purple-700"
                              onClick={() => handleStatusUpdate(token.id, "Delivered")}
                            >
                              Mark Delivered
                            </Button>
                          )}
                          {["Pending", "Preparing"].includes(token.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusUpdate(token.id, "Cancelled")}
                            >
                              Cancel
                            </Button>
                          )}
                          {["Delivered", "Cancelled"].includes(token.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => navigate(`/dashboard/orders/${token.orderId}`)}
                            >
                              View Order
                            </Button>
                          )}
                        </TableCell>
                      )}
                      {viewMode === "trash" && (
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await orderTokensService.restore(token.id);
                              setOrderTokens((prev) => prev.filter((t) => t.id !== token.id));
                              setTrashCount((prev) => prev - 1);
                              toast.success("Token restored.");
                            }}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* No filtered results */}
              {!hasFilteredResults && hasActiveFilters && (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No orders found matching your filters.</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Try adjusting your search terms or clearing filters to see more results.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={total}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {viewMode === "trash" ? "Trash is empty" : "No active orders"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {viewMode === "trash"
                  ? "No tokens in trash."
                  : "New orders will appear here automatically when customers place them."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        open={!!actionToken}
        title={actionTitle}
        description={actionDescription}
        confirmText={
          actionToken?.action === "Cancelled"
            ? "Cancel Order"
            : `Mark as ${actionToken?.action}`
        }
        cancelText="Back"
        onConfirm={handleActionConfirm}
        onCancel={() => setActionToken(null)}
      />
    </div>
  );
}
