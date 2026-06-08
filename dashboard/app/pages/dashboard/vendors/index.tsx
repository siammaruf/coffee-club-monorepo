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
import { Edit, Eye, Plus, Search, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import AddVendorModal from "~/components/modals/AddVendorModal";
import EditVendorModal from "~/components/modals/EditVendorModal";
import ViewVendorModal from "~/components/modals/ViewVendorModal";
import type { Vendor } from "~/types/vendor";
import { vendorService } from "~/services/httpServices/vendorService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import { useDebounce } from "~/hooks/useDebounce";
import { Pagination } from "~/components/ui/pagination";

export default function VendorsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdminOrManager = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'manager';
  if (!isAdminOrManager) {
    return <Navigate to="/dashboard" replace />;
  }

  const canCreate = usePermission('vendors.create');
  const canEdit = usePermission('vendors.edit');
  const canDelete = usePermission('vendors.delete');

  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { currentPage, handlePageChange, resetPage } = usePaginationUrl();
  const itemsPerPage = 10;
  const [total, setTotal] = useState(0);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = viewMode === 'trash'
        ? await vendorService.getTrash(params)
        : await vendorService.getAll(params);
      const data = res as any;
      setVendors(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      setVendors([]);
      setTotal(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, [currentPage, debouncedSearch, viewMode]);

  useEffect(() => {
    vendorService.getTrash({ page: 1, limit: 1 }).then((res: any) => {
      setTrashCount(res.total || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  const handleAddVendor = async (vendorData: any) => {
    const newVendorData = vendorData.data || vendorData;
    setVendors(prev => [newVendorData, ...prev]);
    setTotal(prev => prev + 1);
    setShowAddModal(false);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditVendor(vendor);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await vendorService.delete(deleteId);
      setVendors(vendors => vendors.filter(v => v.id !== deleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to delete vendor:", error);
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const handleEditVendor = async (vendorData: any) => {
    setVendors(prev =>
      prev.map(v => v.id === vendorData.data.id ? vendorData.data : v)
    );
    setEditVendor(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await vendorService.restore(id);
      setVendors(prev => prev.filter(v => v.id !== id));
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
      await vendorService.permanentDelete(permanentDeleteId);
      setVendors(prev => prev.filter(v => v.id !== permanentDeleteId));
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
      await vendorService.bulkDelete(Array.from(selectedIds));
      setVendors(prev => prev.filter(v => !selectedIds.has(v.id)));
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
      await vendorService.bulkRestore(Array.from(selectedIds));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
      fetchVendors();
    } catch (error) {
      console.error("Bulk restore failed:", error);
      fetchVendors();
    }
    setBulkLoading(false);
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const response: any = await vendorService.bulkPermanentDelete(Array.from(selectedIds));
      const deletedCount = response?.data?.deleted?.length ?? selectedIds.size;
      setTrashCount(prev => prev - deletedCount);
      clearSelection();
      fetchVendors();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
      fetchVendors();
    }
    setBulkLoading(false);
  };

  const statusBadge = (status: string) =>
    status === "ACTIVE" ? (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Active</span>
    ) : (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">Inactive</span>
    );

  const typeBadge = (type: string) =>
    type === "FOOD_SUPPLIER" ? (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">Food</span>
    ) : (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Non-Food</span>
    );

  return (
    <PermissionGuard permission="vendors.view">
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
            <p className="text-muted-foreground">Manage your suppliers and vendors</p>
          </div>
          {canCreate && (
            <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <span>Vendor List ({total})</span>
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
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => {
                    resetPage();
                    setSearchTerm(e.target.value);
                  }}
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
                <div className="grid grid-cols-6 font-medium text-sm">
                  <div className="text-left flex items-center gap-2">
                    <Checkbox
                      checked={isAllSelected(vendors.map(v => v.id))}
                      onChange={() => toggleSelectAll(vendors.map(v => v.id))}
                    />
                    Vendor
                  </div>
                  <div className="text-center">Type</div>
                  <div className="text-center">Contact</div>
                  <div className="text-center">Mobile</div>
                  <div className="text-center">Status</div>
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
                ) : vendors.length > 0 ? (
                  vendors.map(vendor => (
                    <div key={vendor.id} className="p-4 hover:bg-muted/50">
                      <div className="grid grid-cols-6 text-sm items-center">
                        <div className="text-left flex items-center gap-3">
                          <Checkbox
                            checked={isSelected(vendor.id)}
                            onChange={() => toggleSelect(vendor.id)}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{vendor.vendor_name}</span>
                            {vendor.email && (
                              <span className="text-xs text-gray-500">{vendor.email}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-center">{typeBadge(vendor.vendor_type)}</div>
                        <div className="text-center">{vendor.contact_person}</div>
                        <div className="text-center">{vendor.mobile}</div>
                        <div className="text-center">{statusBadge(vendor.status)}</div>
                        <div className="flex gap-2 justify-end">
                          {viewMode === 'trash' ? (
                            <>
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 cursor-pointer"
                                  title="Restore"
                                  onClick={() => handleRestore(vendor.id)}
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
                                  onClick={() => handlePermanentDelete(vendor.id)}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer"
                                title="View"
                                onClick={() => setViewVendor(vendor)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 cursor-pointer"
                                  title="Edit"
                                  type="button"
                                  onClick={() => handleEdit(vendor)}
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
                                  onClick={() => handleDelete(vendor.id)}
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
                        <p className="text-sm mt-1">No deleted vendors found.</p>
                      </>
                    ) : searchTerm ? (
                      <>
                        <p>No vendors found matching "{searchTerm}".</p>
                        <p className="text-sm mt-1">Try adjusting your search terms.</p>
                      </>
                    ) : (
                      <>
                        <p>No vendors available.</p>
                        <p className="text-sm mt-1">Create your first vendor to get started.</p>
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

        <AddVendorModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => setShowAddModal(false)}
          onCreate={handleAddVendor}
        />

        {editVendor && (
          <EditVendorModal
            open={!!editVendor}
            vendor={editVendor}
            onClose={() => setEditVendor(null)}
            onSuccess={() => setEditVendor(null)}
            onUpdate={handleEditVendor}
          />
        )}

        {viewVendor && (
          <ViewVendorModal
            open={!!viewVendor}
            vendor={viewVendor}
            onClose={() => setViewVendor(null)}
          />
        )}

        <ConfirmDialog
          open={!!deleteId}
          title="Delete Vendor?"
          description="Are you sure you want to delete this vendor? It will be moved to trash."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />

        <ConfirmDialog
          open={!!permanentDeleteId}
          title="Permanently Delete Vendor?"
          description="Are you sure you want to permanently delete this vendor? This action cannot be undone."
          confirmText="Delete Forever"
          cancelText="Cancel"
          onConfirm={handlePermanentDeleteConfirm}
          onCancel={() => setPermanentDeleteId(null)}
        />
      </div>
    </PermissionGuard>
  );
}
