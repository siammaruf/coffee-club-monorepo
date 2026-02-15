import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import kitchenStockService from "~/services/httpServices/kitchenStockService";
import KitchenItemsSkeleton from "~/components/skeleton/KitchenItemsSkeleton";
import { Plus, Edit, Trash2, RotateCcw, AlertTriangle, Search } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import AddStockModal from "~/components/modals/AddStockModal";
import EditStockModal from "~/components/modals/EditStockModal";
import type { KitchenStock } from "~/types/KitchenStock";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";

export default function KitchenStockPage() {
  const [kitchenStock, setKitchenStock] = useState<KitchenStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStock, setFilteredStock] = useState<KitchenStock[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStock, setEditStock] = useState<KitchenStock | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Edit handler
  const handleEditStock = async (data: Partial<KitchenStock>) => {
    if (!editStock) return;
    try {
      await kitchenStockService.update(editStock.id, data);
      await fetchKitchenStock();
      setShowEditModal(false);
      setEditStock(null);
    } catch (error) {
      console.error('Error editing kitchen stock:', error);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await kitchenStockService.delete(deleteId);
      setKitchenStock(prev => prev.filter(item => item.id !== deleteId));
      setFilteredStock(prev => prev.filter(item => item.id !== deleteId));
      setTrashCount(prev => prev + 1);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting kitchen stock:', error);
    }
  };

  useEffect(() => {
    fetchKitchenStock();
    clearSelection();
  }, [viewMode]);

  useEffect(() => {
    // Fetch trash count on mount
    kitchenStockService.getTrash({ page: 1, limit: 1 }).then((res: any) => setTrashCount(res.total || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    let filtered = kitchenStock.filter(item => {
      const name = item.kitchen_item?.name ? item.kitchen_item.name.toLowerCase() : "";
      const nameBn = item.kitchen_item?.name_bn ? item.kitchen_item.name_bn.toLowerCase() : "";
      const desc = item.description ? item.description.toLowerCase() : "";
      return name.includes(searchTerm.toLowerCase()) || nameBn.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    });
    setFilteredStock(filtered);
  }, [kitchenStock, searchTerm]);

  const fetchKitchenStock = async () => {
    setIsLoading(true);
    try {
      const res = viewMode === 'active'
        ? await kitchenStockService.getAll()
        : await kitchenStockService.getTrash();
      // API response is paginated, extract data array
      const items = (res as { data: KitchenStock[] }).data || [];
      setKitchenStock(items);
      setFilteredStock(items);
    } catch (error) {
      console.error('Error fetching kitchen stock:', error);
      setKitchenStock([]);
      setFilteredStock([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for add modal logic
  const handleAddStock = async (data: Omit<KitchenStock, "id">) => {
    try {
      await kitchenStockService.create(data);
      await fetchKitchenStock();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding kitchen stock:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await kitchenStockService.bulkDelete(Array.from(selectedIds));
      setKitchenStock(prev => prev.filter(item => !selectedIds.has(item.id)));
      setFilteredStock(prev => prev.filter(item => !selectedIds.has(item.id)));
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
      await Promise.all(Array.from(selectedIds).map(id => kitchenStockService.restore(id)));
      setKitchenStock(prev => prev.filter(item => !selectedIds.has(item.id)));
      setFilteredStock(prev => prev.filter(item => !selectedIds.has(item.id)));
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
      await Promise.all(Array.from(selectedIds).map(id => kitchenStockService.permanentDelete(id)));
      setKitchenStock(prev => prev.filter(item => !selectedIds.has(item.id)));
      setFilteredStock(prev => prev.filter(item => !selectedIds.has(item.id)));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  const handleRestore = async (id: string) => {
    try {
      await kitchenStockService.restore(id);
      setKitchenStock(prev => prev.filter(item => item.id !== id));
      setFilteredStock(prev => prev.filter(item => item.id !== id));
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await kitchenStockService.permanentDelete(id);
      setKitchenStock(prev => prev.filter(item => item.id !== id));
      setFilteredStock(prev => prev.filter(item => item.id !== id));
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
  };

  if (isLoading) {
    return <KitchenItemsSkeleton />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Kitchen Stock
          </h1>
          <p className="text-gray-600">Manage your kitchen stock records</p>
        </div>
        {viewMode === 'active' && (
          <Button
            className="flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </Button>
        )}
        <AddStockModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdded={handleAddStock}
        />
        {showEditModal && editStock && (
          <EditStockModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditStock(null);
            }}
            stock={editStock}
            onEdited={handleEditStock}
          />
        )}
        {deleteId && (
          <ConfirmDialog
            open={!!deleteId}
            title="Delete Stock Record?"
            description="Are you sure you want to delete this stock record? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
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
            <div className="flex gap-4 items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by item name or description..."
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
            isTrashView={viewMode === 'trash'}
            onRestore={handleBulkRestore}
            onPermanentDelete={handleBulkPermanentDelete}
            loading={bulkLoading}
          />
          {filteredStock.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-[40px]">
                    <Checkbox
                      checked={isAllSelected(filteredStock.map(i => i.id))}
                      onChange={() => toggleSelectAll(filteredStock.map(i => i.id))}
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={isSelected(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        {item.kitchen_item?.image ? (
                          <img
                            src={item.kitchen_item.image}
                            alt={item.kitchen_item.name}
                            className="w-16 h-16 rounded object-cover border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                        <div>
                          <span className="font-medium block">{item.kitchen_item?.name || '-'}</span>
                          <span className="text-sm text-gray-500 block">{item.kitchen_item?.name_bn || '-'}</span>
                          <span className="text-xs text-gray-400 block">
                            {item.created_at ?
                              (() => {
                                const d = new Date(item.created_at);
                                const day = d.getDate();
                                const month = d.toLocaleString('en-US', { month: 'short' });
                                const year = d.getFullYear();
                                let hour = d.getHours();
                                const min = d.getMinutes().toString().padStart(2, '0');
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                hour = hour % 12;
                                hour = hour ? hour : 12;
                                const hourStr = hour.toString().padStart(2, '0');
                                return `Added: ${day} ${month} ${year} : ${hourStr}:${min} ${ampm}`;
                              })()
                              : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">{item.kitchen_item?.type || '-'}</td>
                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                    <td className="px-4 py-2 text-center">{item.price}</td>
                    <td className="px-4 py-2 text-center">{item.total_price || '-'}</td>
                    <td className="px-4 py-2 text-left">{item.description}</td>
                    <td className="px-4 py-2 flex text-right">
                      <div className="flex">
                        {viewMode === 'active' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit"
                              onClick={() => {
                                setEditStock(item);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete"
                              onClick={() => setDeleteId(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Restore"
                              onClick={() => handleRestore(item.id)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete Permanently"
                              onClick={() => handlePermanentDelete(item.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {viewMode === 'trash' ? 'Trash is empty' : 'No kitchen stock records yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {viewMode === 'trash'
                  ? 'No deleted stock records found.'
                  : 'Start by adding stock records for your kitchen items.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
