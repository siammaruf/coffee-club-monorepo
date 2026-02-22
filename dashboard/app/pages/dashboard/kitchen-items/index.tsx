import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import KitchenItemsSkeleton from "~/components/skeleton/KitchenItemsSkeleton";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { kitchenItemsService } from "~/services/httpServices/kitchenItemsService";
import type { KitchenItem } from "~/types/kitchenItem";
import AddKitchenItemAddModal from "~/components/modals/AddKitchenItemAddModal";
import EditKitchenItemModal from "~/components/modals/EditKitchenItemModal";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  Coffee,
  Utensils,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";


export default function KitchenItemsPage() {
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<KitchenItem | null>(null);
  const handleAddKitchenItem = async (data: FormData) => {
    try {
      await kitchenItemsService.create(data);
      await fetchKitchenItems();
    } catch (error) {
      console.error('Error adding kitchen item:', error);
    }
  };

  const handleEditKitchenItem = async (data: FormData) => {
    if (!editItem) return;
    try {
      await kitchenItemsService.update(editItem.id, data);
      await fetchKitchenItems();
      setShowEditModal(false);
      setEditItem(null);
    } catch (error) {
      console.error('Error editing kitchen item:', error);
    }
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    name_bn: "",
    slug: "",
    image: "",
    description: "",
    type: "KITCHEN"
  });
  const [isAdding, setIsAdding] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [kitchenItems, setKitchenItems] = useState<KitchenItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<KitchenItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchKitchenItems();
    clearSelection();
  }, [viewMode]);

  useEffect(() => {
    // Fetch trash count on mount
    kitchenItemsService.getTrash({ page: 1, limit: 1 }).then((res: any) => setTrashCount(res.total || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    let filtered = kitchenItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name_bn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [kitchenItems, searchTerm]);

  const fetchKitchenItems = async () => {
    setIsLoading(true);
    try {
      const res = viewMode === 'active'
        ? await kitchenItemsService.getAll()
        : await kitchenItemsService.getTrash();
      const items = (res as { data: KitchenItem[] }).data || [];
      setKitchenItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Error fetching kitchen items:', error);
      setKitchenItems([]);
      setFilteredItems([]);
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
      await kitchenItemsService.delete(deleteId);
      setKitchenItems(prev => prev.filter(item => item.id !== deleteId));
      setTrashCount(prev => prev + 1);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting kitchen item:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await kitchenItemsService.bulkDelete(Array.from(selectedIds));
      setKitchenItems(prev => prev.filter(item => !selectedIds.has(item.id)));
      setFilteredItems(prev => prev.filter(item => !selectedIds.has(item.id)));
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
      await kitchenItemsService.bulkRestore(Array.from(selectedIds));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
      fetchKitchenItems();
    } catch (error) {
      console.error("Bulk restore failed:", error);
      fetchKitchenItems();
    }
    setBulkLoading(false);
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const response: any = await kitchenItemsService.bulkPermanentDelete(Array.from(selectedIds));
      const deletedCount = response?.data?.deleted?.length ?? selectedIds.size;
      setTrashCount(prev => prev - deletedCount);
      clearSelection();
      fetchKitchenItems();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
      fetchKitchenItems();
    }
    setBulkLoading(false);
  };

  const handleRestore = async (id: string) => {
    try {
      await kitchenItemsService.restore(id);
      setKitchenItems(prev => prev.filter(item => item.id !== id));
      setFilteredItems(prev => prev.filter(item => item.id !== id));
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handlePermanentDelete = (id: string) => {
    setPermanentDeleteId(id);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteId) return;
    try {
      await kitchenItemsService.permanentDelete(permanentDeleteId);
      setKitchenItems(prev => prev.filter(item => item.id !== permanentDeleteId));
      setFilteredItems(prev => prev.filter(item => item.id !== permanentDeleteId));
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
    setPermanentDeleteId(null);
  };

  const hasActiveFilters = !!searchTerm;
  const hasItems = kitchenItems.length > 0;
  const hasFilteredResults = filteredItems.length > 0;

  if (isLoading) {
    return <KitchenItemsSkeleton />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
        <Utensils className="w-6 h-6" />
        Kitchen Items
          </h1>
          <p className="text-gray-600">Manage your kitchen supplies and ingredients</p>
        </div>
        {viewMode === 'active' && (
          <Button
            className="flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        )}
        {/* Add Item Modal */}
        <AddKitchenItemAddModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdded={handleAddKitchenItem}
        />
        {showEditModal && editItem && (
          <EditKitchenItemModal
            open={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditItem(null);
            }}
            item={editItem}
            onEdited={handleEditKitchenItem}
          />
        )}
      </div>

      {/* Kitchen Items Table or Empty State */}
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
                  placeholder="Search items..."
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
          {hasItems ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected(filteredItems.map(i => i.id))}
                        onChange={() => toggleSelectAll(filteredItems.map(i => i.id))}
                      />
                    </TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Name (Bangla)</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                              <Coffee className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{item.name_bn || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{item.slug}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{item.type}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{item.description || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          {viewMode === 'active' ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditItem(item);
                                  setShowEditModal(true);
                                }}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
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
                                onClick={() => handleRestore(item.id)}
                                title="Restore"
                                className="text-green-600 hover:bg-green-50"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePermanentDelete(item.id)}
                                title="Delete Permanently"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* No filtered results message */}
              {!hasFilteredResults && hasActiveFilters && (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No items found matching your filters.</p>
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
            /* No items at all - Empty state */
            <div className="text-center py-12">
              <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {viewMode === 'trash' ? 'Trash is empty' : 'No kitchen items yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {viewMode === 'trash'
                  ? 'No deleted items found.'
                  : 'Start by adding ingredients and supplies to your kitchen items.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Kitchen Item?"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      {/* Confirm Permanent Delete Dialog */}
      <ConfirmDialog
        open={!!permanentDeleteId}
        title="Permanently Delete?"
        description="Are you sure you want to permanently delete this item? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handlePermanentDeleteConfirm}
        onCancel={() => setPermanentDeleteId(null)}
      />
    </div>
  );
}
