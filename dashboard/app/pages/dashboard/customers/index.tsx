import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Plus, Search, Eye, Edit, Trash2, UserCheck, XCircle, UserX, Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import CreateCustomerModal from "~/components/modals/CreateCustomerModal";
import ViewCustomerModal from "~/components/modals/ViewCustomerModal";
import EditCustomerModal from "~/components/modals/EditCustomerModal";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { customerService } from "~/services/httpServices/customerService";
import type { Customer } from "~/types/customer";
import CustomerSkeleton from "~/components/skeleton/CustomerSkeleton";
import { toast } from "sonner";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [isActiveFilter, setIsActiveFilter] = useState<"" | "true" | "false">("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<"" | "regular" | "member">("");
  const selectedCustomer = selectedCustomerId
    ? customers.find(c => c.id === selectedCustomerId) || null
    : null;

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, isActiveFilter, customerTypeFilter, viewMode]);

  // Fetch trash count on initial load
  useEffect(() => {
    customerService.getTrash({ page: 1, limit: 1 }).then((res: any) => {
      setTrashCount(res.total || 0);
    }).catch(() => {});
  }, []);

  // Clear selection when viewMode changes
  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage
      };
      if (searchTerm) params.search = searchTerm;
      if (isActiveFilter) params.is_active = isActiveFilter;
      if (customerTypeFilter) params.customer_type = customerTypeFilter;

      const response = viewMode === 'trash'
        ? await customerService.getTrash(params)
        : await customerService.getAll(params);
      const data = response as any;
      setCustomers(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      setCustomers([]);
      setTotal(0);
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
      await customerService.delete(deleteId);
      setCustomers(customers.filter(customer => customer.id !== deleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev + 1);
      toast("Customer deleted!", {
        description: (
          <span style={{ color: "#000" }}>
            The customer was moved to trash.
          </span>
        ),
        duration: 3000,
        icon: <Trash2 className="text-red-600 mr-2" />,
        style: { background: "#fee2e2", color: "#991b1b", border: "1.5px solid #ef4444" },
      });
    } catch (error) {
      let errorMessage = "Failed to delete customer.";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as any).response?.data?.message
      ) {
        errorMessage = (error as any).response.data.message;
      } else if ((error as any)?.message) {
        errorMessage = (error as any).message;
      }

      toast('Failed to delete customer.', {
        description: (
          <span style={{ color: "#000" }}>
            {errorMessage}
          </span>
        ),
        duration: 3000,
        icon: <XCircle className="text-red-600" style={{ marginTop: 10, marginRight: 10 }} />,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          alignItems: "flex-start",
          border: "1.5px solid #ef4444",
        },
      });
      console.error('Error deleting customer:', error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await customerService.restore(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
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
      await customerService.permanentDelete(permanentDeleteId);
      setCustomers(prev => prev.filter(c => c.id !== permanentDeleteId));
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
      await customerService.bulkDelete(Array.from(selectedIds));
      setCustomers(prev => prev.filter(c => !selectedIds.has(c.id)));
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
      await Promise.all(Array.from(selectedIds).map(id => customerService.restore(id)));
      setCustomers(prev => prev.filter(c => !selectedIds.has(c.id)));
      setTotal(prev => prev - selectedIds.size);
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
      await Promise.all(Array.from(selectedIds).map(id => customerService.permanentDelete(id)));
      setCustomers(prev => prev.filter(c => !selectedIds.has(c.id)));
      setTotal(prev => prev - selectedIds.size);
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setShowViewModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setShowEditModal(true);
  };

  const handleCustomerUpdated = (updatedCustomer: any) => {
    const customerData = updatedCustomer.data || updatedCustomer;
    const customerId = updatedCustomer.data?.id || customerData.id;

    setCustomers(prev =>
      prev.map(c => c.id === customerId ? customerData : c)
    );
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const handleCreated = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
    setTotal(prev => prev + 1);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedCustomerId(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedCustomerId(null);
  };

  // Activate/Deactivate handler
  const handleStatusChange = async (customer: Customer, action: "activate" | "deactivate") => {
    setStatusLoadingId(customer.id);
    try {
      let updated: any;
      if (action === "activate") {
        updated = await customerService.activate(customer.id);
      } else {
        updated = await customerService.deactivate(customer.id);
      }

      setCustomers(prev =>
        prev.map(c => c.id === customer.id ? updated.data : c)
      );

      toast(
        `Customer ${action === "activate" ? "activated" : "deactivated"}!`,
        {
          description: (
            <span style={{ color: "#000" }}>
              Status changed successfully.
            </span>
          ),
          duration: 2000,
          icon: action === "activate"
            ? <UserCheck className="text-green-600 mr-2" />
            : <UserX className="text-red-600 mr-2" />,
          style: {
            background: action === "activate" ? "#dcfce7" : "#fee2e2",
            color: action === "activate" ? "#166534" : "#991b1b",
            border: `1.5px solid ${action === "activate" ? "#22c55e" : "#ef4444"}`
          },
        }
      );
    } catch (error) {
      toast('Failed to change status.', {
        description: (
          <span style={{ color: "#000" }}>
            {(typeof error === "object" && error !== null && "message" in error)
              ? (error as { message?: string }).message
              : "Something went wrong."}
          </span>
        ),
        duration: 2000,
        icon: <UserX className="text-red-600 mr-2" />,
        style: { background: "#fee2e2", color: "#991b1b", border: "1.5px solid #ef4444" },
      });
    } finally {
      setStatusLoadingId(null);
    }
  };

  if (isLoading && currentPage === 1) {
    return <CustomerSkeleton />;
  }

  return (
    <>
      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />
      <ViewCustomerModal
        isOpen={showViewModal}
        onClose={closeViewModal}
        customer={selectedCustomer}
      />
      <EditCustomerModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        customer={selectedCustomer}
        onUpdated={handleCustomerUpdated}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Customer?"
        description="Are you sure you want to delete this customer? It will be moved to trash."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
      <ConfirmDialog
        open={!!permanentDeleteId}
        title="Permanently Delete Customer?"
        description="Are you sure you want to permanently delete this customer? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handlePermanentDeleteConfirm}
        onCancel={() => setPermanentDeleteId(null)}
      />
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6" />
              Customers
            </h2>
            <p className="text-muted-foreground">Manage your customers</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <span>Customer List ({total})</span>
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
              <div className="flex gap-2 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={e => {
                      setCurrentPage(1);
                      setSearchTerm(e.target.value);
                    }}
                  />
                </div>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={isActiveFilter}
                  onChange={e => {
                    setCurrentPage(1);
                    setIsActiveFilter(e.target.value as "" | "true" | "false");
                  }}
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={customerTypeFilter}
                  onChange={e => {
                    setCurrentPage(1);
                    setCustomerTypeFilter(e.target.value as "" | "regular" | "member");
                  }}
                >
                  <option value="">All Types</option>
                  <option value="regular">Regular</option>
                  <option value="member">Member</option>
                </select>
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
                      checked={isAllSelected(customers.map(c => c.id))}
                      onChange={() => toggleSelectAll(customers.map(c => c.id))}
                    />
                    Customer
                  </div>
                  <div className="text-center">Contact</div>
                  <div className="text-center">Type</div>
                  <div className="text-center">Address</div>
                  <div className="text-right col-span-2">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <div key={customer.id} className="p-4 hover:bg-muted/50">
                      <div className="grid grid-cols-6 text-sm items-center">
                        <div className="text-left flex items-center gap-3">
                          <Checkbox
                            checked={isSelected(customer.id)}
                            onChange={() => toggleSelect(customer.id)}
                          />
                          {customer.picture ? (
                            <img
                              src={customer.picture}
                              alt={customer.name}
                              className="w-10 h-10 rounded-full object-cover border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <span className="font-medium">{customer.name}</span>
                        </div>
                        <div className="text-center">
                          <div className="space-y-1">
                            <p className="text-sm">{customer.email}</p>
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.customer_type === 'member'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {customer.customer_type === 'member' ? 'Member' : 'Regular'}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">{customer.address || 'Not provided'}</p>
                        </div>
                        <div className="flex justify-end gap-2 col-span-2">
                          {viewMode === 'trash' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer"
                                title="Restore"
                                onClick={() => handleRestore(customer.id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Delete Permanently"
                                onClick={() => handlePermanentDelete(customer.id)}
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* Activate/Deactivate Button */}
                              {customer.is_active ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-yellow-700 hover:bg-yellow-50 cursor-pointer"
                                  title="Deactivate"
                                  disabled={statusLoadingId === customer.id}
                                  onClick={() => handleStatusChange(customer, "deactivate")}
                                >
                                  {statusLoadingId === customer.id
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <UserX className="h-4 w-4" />}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-700 hover:bg-green-50 cursor-pointer"
                                  title="Activate"
                                  disabled={statusLoadingId === customer.id}
                                  onClick={() => handleStatusChange(customer, "activate")}
                                >
                                  {statusLoadingId === customer.id
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <UserCheck className="h-4 w-4" />}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer"
                                title="View"
                                onClick={() => handleView(customer)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer"
                                title="Edit"
                                onClick={() => handleEdit(customer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Delete"
                                onClick={() => handleDelete(customer.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                        <p className="text-sm mt-1">No deleted customers found.</p>
                      </>
                    ) : searchTerm ? (
                      <>
                        <p>No customers found matching "{searchTerm}".</p>
                        <p className="text-sm mt-1">Try adjusting your search terms.</p>
                      </>
                    ) : (
                      <>
                        <p>No customers available.</p>
                        <p className="text-sm mt-1">Create your first customer to get started.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-end items-center gap-2 p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Prev
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
