import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { usePermission } from '~/hooks/usePermission';
import { usePaginationUrl } from "~/hooks/usePaginationUrl";
import type { RootState } from "~/redux/store/rootReducer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Edit, Plus, Trash2, RotateCcw, AlertTriangle, ImageIcon } from "lucide-react";
import { Select } from "~/components/ui/select";
import AddVendorPaymentModal from "~/components/modals/AddVendorPaymentModal";
import EditVendorPaymentModal from "~/components/modals/EditVendorPaymentModal";
import type { VendorPayment } from "~/types/vendorPayment";
import type { Vendor } from "~/types/vendor";
import { vendorPaymentService } from "~/services/httpServices/vendorPaymentService";
import { vendorService } from "~/services/httpServices/vendorService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import { Pagination } from "~/components/ui/pagination";

export default function VendorPaymentsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdminOrManager = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'manager';
  if (!isAdminOrManager) {
    return <Navigate to="/dashboard" replace />;
  }

  const canCreate = usePermission('vendor_payments.create');
  const canEdit = usePermission('vendor_payments.edit');
  const canDelete = usePermission('vendor_payments.delete');

  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorFilter, setVendorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { currentPage, handlePageChange, resetPage } = usePaginationUrl();
  const itemsPerPage = 10;
  const [total, setTotal] = useState(0);
  const [editPayment, setEditPayment] = useState<VendorPayment | null>(null);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    clearSelection();
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (vendorFilter) params.vendor_id = vendorFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (paymentTypeFilter) params.payment_type = paymentTypeFilter;

      const res = viewMode === 'trash'
        ? await vendorPaymentService.getTrash(params)
        : await vendorPaymentService.getAll(params);
      const data = res as any;
      setPayments(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      setPayments([]);
      setTotal(0);
    }
    setIsLoading(false);
  };

  const fetchVendors = async () => {
    try {
      const res = await vendorService.getActive();
      setVendors((res as any)?.data || []);
    } catch {
      setVendors([]);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, vendorFilter, startDate, endDate, paymentTypeFilter, viewMode]);

  useEffect(() => {
    fetchVendors();
    vendorPaymentService.getTrash({ page: 1, limit: 1 }).then((res: any) => {
      setTrashCount(res.total || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  const handleAddPayment = async (paymentData: any) => {
    const newPaymentData = paymentData.data || paymentData;
    setPayments(prev => [newPaymentData, ...prev]);
    setTotal(prev => prev + 1);
    setShowAddModal(false);
  };

  const handleEdit = (payment: VendorPayment) => {
    setEditPayment(payment);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await vendorPaymentService.delete(deleteId);
      setPayments(payments => payments.filter(p => p.id !== deleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to delete payment:", error);
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const handleEditPayment = async (paymentData: any) => {
    setPayments(prev =>
      prev.map(p => p.id === paymentData.data.id ? paymentData.data : p)
    );
    setEditPayment(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await vendorPaymentService.restore(id);
      setPayments(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
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
      await vendorPaymentService.permanentDelete(permanentDeleteId);
      setPayments(prev => prev.filter(p => p.id !== permanentDeleteId));
      setTotal(prev => prev - 1);
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
      await vendorPaymentService.bulkDelete(Array.from(selectedIds));
      setPayments(prev => prev.filter(p => !selectedIds.has(p.id)));
      setTotal(prev => prev - selectedIds.size);
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
      await vendorPaymentService.bulkRestore(Array.from(selectedIds));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
      fetchPayments();
    } catch (error) {
      console.error("Bulk restore failed:", error);
      fetchPayments();
    }
    setBulkLoading(false);
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const response: any = await vendorPaymentService.bulkPermanentDelete(Array.from(selectedIds));
      const deletedCount = response?.data?.deleted?.length ?? selectedIds.size;
      setTrashCount(prev => prev - deletedCount);
      clearSelection();
      fetchPayments();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
      fetchPayments();
    }
    setBulkLoading(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(val);

  const paymentTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      CASH: 'bg-green-100 text-green-700',
      BANK: 'bg-blue-100 text-blue-700',
      BKASH: 'bg-pink-100 text-pink-700',
      NAGAD: 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
        {type}
      </span>
    );
  };

  return (
    <PermissionGuard permission="vendor_payments.view">
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vendor Payments</h2>
            <p className="text-muted-foreground">Track payments made to vendors</p>
          </div>
          {canCreate && (
            <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <span>Payment List ({total})</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setViewMode('active'); clearSelection(); resetPage(); }}
                  >
                    Active
                  </Button>
                  <Button
                    variant={viewMode === 'trash' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setViewMode('trash'); clearSelection(); resetPage(); }}
                  >
                    Trash ({trashCount})
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                  <Select
                  className="w-40"
                  value={vendorFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setVendorFilter(e.target.value); resetPage(); }}
                >
                  <option value="">All Vendors</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.vendor_name}</option>
                  ))}
                </Select>
                <Select
                  className="w-32"
                  value={paymentTypeFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setPaymentTypeFilter(e.target.value); resetPage(); }}
                >
                  <option value="">All Types</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                </Select>
                <Input
                  type="date"
                  className="w-36"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); resetPage(); }}
                  placeholder="From"
                />
                <Input
                  type="date"
                  className="w-36"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); resetPage(); }}
                  placeholder="To"
                />
              </div>
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
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-7 font-medium text-sm">
                  <div className="text-left flex items-center gap-2">
                    <Checkbox
                      checked={isAllSelected(payments.map(p => p.id))}
                      onChange={() => toggleSelectAll(payments.map(p => p.id))}
                    />
                    Vendor
                  </div>
                  <div className="text-center">Amount</div>
                  <div className="text-center">Date</div>
                  <div className="text-center">Type</div>
                  <div className="text-center">Note</div>
                  <div className="text-center">Attachment</div>
                  <div className="text-right">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-8 space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : payments.length > 0 ? (
                  payments.map(payment => (
                    <div key={payment.id} className="p-4 hover:bg-muted/50">
                      <div className="grid grid-cols-7 text-sm items-center">
                        <div className="text-left flex items-center gap-3">
                          <Checkbox
                            checked={isSelected(payment.id)}
                            onChange={() => toggleSelect(payment.id)}
                          />
                          <span className="font-medium">{payment.vendor?.vendor_name || payment.vendor_id}</span>
                        </div>
                        <div className="text-center font-semibold">{formatCurrency(payment.amount)}</div>
                        <div className="text-center">{payment.payment_date}</div>
                        <div className="text-center">{paymentTypeBadge(payment.payment_type)}</div>
                        <div className="text-center text-gray-500 truncate max-w-[120px]">{payment.note || "—"}</div>
                        <div className="text-center">
                          {payment.screenshot_url ? (
                            <a
                              href={payment.screenshot_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-xs">View</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                          {viewMode === 'trash' ? (
                            <>
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 cursor-pointer"
                                  title="Restore"
                                  onClick={() => handleRestore(payment.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="Delete Permanently"
                                  onClick={() => handlePermanentDelete(payment.id)}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 cursor-pointer"
                                  title="Edit"
                                  type="button"
                                  onClick={() => handleEdit(payment)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="Delete"
                                  onClick={() => handleDelete(payment.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    {viewMode === 'trash' ? (
                      <>
                        <p>Trash is empty.</p>
                        <p className="text-sm mt-1">No deleted payments found.</p>
                      </>
                    ) : (
                      <>
                        <p>No payments found.</p>
                        <p className="text-sm mt-1">Record your first vendor payment to get started.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          </CardContent>
        </Card>

        <AddVendorPaymentModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => setShowAddModal(false)}
          onCreate={handleAddPayment}
        />

        {editPayment && (
          <EditVendorPaymentModal
            open={!!editPayment}
            payment={editPayment}
            onClose={() => setEditPayment(null)}
            onSuccess={() => setEditPayment(null)}
            onUpdate={handleEditPayment}
          />
        )}

        <ConfirmDialog
          open={!!deleteId}
          title="Delete Payment?"
          description="Are you sure you want to delete this payment record? It will be moved to trash."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />

        <ConfirmDialog
          open={!!permanentDeleteId}
          title="Permanently Delete Payment?"
          description="Are you sure you want to permanently delete this payment? This action cannot be undone."
          confirmText="Delete Forever"
          cancelText="Cancel"
          onConfirm={handlePermanentDeleteConfirm}
          onCancel={() => setPermanentDeleteId(null)}
        />
      </div>
    </PermissionGuard>
  );
}
