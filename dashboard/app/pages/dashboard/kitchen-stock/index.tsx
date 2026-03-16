import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Select } from "../../../components/ui/select";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import AddKitchenStockModal from "~/components/modals/AddKitchenStockModal";
import EditKitchenStockModal from "~/components/modals/EditKitchenStockModal";
import { kitchenStockService } from "~/services/httpServices/kitchenStockService";
import type { KitchenStockEntry, KitchenStockSummaryItem } from "~/types/kitchenStock";
import type { RootState } from "~/redux/store/rootReducer";

const WRITE_ROLES = ["admin", "manager", "chef"];

type Tab = "entries" | "alerts";

export default function KitchenStockPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const canWrite = user ? WRITE_ROLES.includes(user.role) : false;

  // Entries state
  const [entries, setEntries] = useState<KitchenStockEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Alerts state
  const [alerts, setAlerts] = useState<KitchenStockSummaryItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  // Tab
  const [activeTab, setActiveTab] = useState<Tab>("entries");

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editEntry, setEditEntry] = useState<KitchenStockEntry | null>(null);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit };
      if (typeFilter) params.type = typeFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await kitchenStockService.getAll(params);
      const result = (res as any)?.data;
      setEntries(result?.data || []);
      setTotal(result?.total || 0);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const res = await kitchenStockService.getLowStockAlerts();
      setAlerts((res as any)?.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page, typeFilter, startDate, endDate]);

  useEffect(() => {
    if (activeTab === "alerts") fetchAlerts();
  }, [activeTab]);

  const filteredEntries = search
    ? entries.filter(
        (e) =>
          e.kitchen_item?.name?.toLowerCase().includes(search.toLowerCase()) ||
          (e.note || "").toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  const handleCreate = async (data: Record<string, any>) => {
    await kitchenStockService.create(data);
    fetchEntries();
    if (activeTab === "alerts") fetchAlerts();
  };

  const handleUpdate = async (id: string, data: Record<string, any>) => {
    await kitchenStockService.update(id, data);
    fetchEntries();
    if (activeTab === "alerts") fetchAlerts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await kitchenStockService.delete(deleteId);
      setDeleteId(null);
      fetchEntries();
      if (activeTab === "alerts") fetchAlerts();
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(val);

  const typeBadge = (type: string) =>
    type === "KITCHEN" ? (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
        Kitchen
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
        Bar
      </span>
    );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track kitchen and bar inventory purchases</p>
        </div>
        {canWrite && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stock Entry
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "entries"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("entries")}
        >
          <Package className="w-4 h-4 inline mr-1" />
          Stock Entries
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1 ${
            activeTab === "alerts"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("alerts")}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock Alerts
          {alerts.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Stock Entries Tab */}
      {activeTab === "entries" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by item or note..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                className="w-36"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Types</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="BAR">Bar</option>
              </Select>
              <Input
                type="date"
                className="w-36"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                placeholder="From date"
              />
              <Input
                type="date"
                className="w-36"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                placeholder="To date"
              />
              <Button variant="outline" size="sm" onClick={fetchEntries} title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No stock entries found</p>
                {canWrite && (
                  <Button
                    size="sm"
                    className="mt-3 bg-blue-600 text-white"
                    onClick={() => setShowAdd(true)}
                  >
                    Add first entry
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Note</TableHead>
                      {canWrite && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.kitchen_item?.name || "—"}
                        </TableCell>
                        <TableCell>{typeBadge(entry.kitchen_item?.type || "")}</TableCell>
                        <TableCell>{entry.quantity}</TableCell>
                        <TableCell>{formatCurrency(entry.purchase_price)}</TableCell>
                        <TableCell>{entry.purchase_date}</TableCell>
                        <TableCell className="text-gray-500 text-sm max-w-[200px] truncate">
                          {entry.note || "—"}
                        </TableCell>
                        {canWrite && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditEntry(entry);
                                  setShowEdit(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => setDeleteId(entry.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <span>
                      Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts Tab */}
      {activeTab === "alerts" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Items Below Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No low stock alerts — all items are well stocked</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((item) => (
                    <TableRow key={item.kitchen_item_id} className="bg-red-50">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{typeBadge(item.type)}</TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {item.total_quantity}
                      </TableCell>
                      <TableCell>{item.low_stock_threshold ?? "—"}</TableCell>
                      <TableCell>{formatCurrency(item.total_value)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddKitchenStockModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => setShowAdd(false)}
        onCreate={handleCreate}
      />
      <EditKitchenStockModal
        open={showEdit}
        entry={editEntry}
        onClose={() => { setShowEdit(false); setEditEntry(null); }}
        onSuccess={() => { setShowEdit(false); setEditEntry(null); }}
        onUpdate={handleUpdate}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Stock Entry"
        description="This stock entry will be deleted. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
