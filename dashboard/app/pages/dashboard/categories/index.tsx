import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Edit, Eye, Plus, Search, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import AddCategoryModal from "~/components/modals/AddCategoryModal";
import type { Category } from "~/types/category";
import CategoriesLoadingSkeleton from "~/components/skeleton/CategoriesLoadingSkeleton";
import { categoryService } from "~/services/httpServices/categoryService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import ViewCategoryModal from "~/components/modals/ViewCategoryModal";
import { CategoryIcon } from "~/utils/categoryIcons";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<Omit<Category, "id">>({
    name: "",
    name_bn: "",
    slug: "",
    description: "",
    icon: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [total, setTotal] = useState(0);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (searchTerm) params.search = searchTerm;

        const res = viewMode === 'trash'
          ? await categoryService.getTrash(params)
          : await categoryService.getAll(params);
        const data = res as any;
        setCategories(data.data || []);
        setTotal(data.total || 0);
      } catch (error) {
        setCategories([]);
        setTotal(0);
      }
      setIsLoading(false);
    };
    fetchCategories();
  }, [currentPage, searchTerm, viewMode]);

  // Fetch trash count on initial load
  useEffect(() => {
    categoryService.getTrash({ page: 1, limit: 1 }).then((res: any) => {
      setTrashCount(res.total || 0);
    }).catch(() => {});
  }, []);

  // Clear selection when viewMode changes
  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  const handleAddCategory = (categoryData: any) => {
    const newCategoryData = categoryData.data || categoryData;

    setCategories(prev => [
      newCategoryData,
      ...prev,
    ]);
    setNewCategory({ name: "", name_bn: "", slug: "", description: "", icon: "" });
    setShowAddModal(false);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewCategory({ name: "", name_bn: "", slug: "", description: "", icon: "" });
  };

  const handleEdit = (id: string) => {
    const category = categories.find(cat => cat.id === id);

    console.log("Editing category:", category);

    if (category) {
      setEditCategory(category);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (isLoading) {
    return <CategoriesLoadingSkeleton />;
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await categoryService.delete(deleteId);
      setCategories(categories => categories.filter(cat => cat.id !== deleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const handleEditCategory = (categoryData: any) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryData.data.id ? categoryData.data : cat
      )
    );
    setEditCategory(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await categoryService.restore(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
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
      await categoryService.permanentDelete(permanentDeleteId);
      setCategories(prev => prev.filter(cat => cat.id !== permanentDeleteId));
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
      await categoryService.bulkDelete(Array.from(selectedIds));
      setCategories(prev => prev.filter(cat => !selectedIds.has(cat.id)));
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
      await Promise.all(Array.from(selectedIds).map(id => categoryService.restore(id)));
      setCategories(prev => prev.filter(cat => !selectedIds.has(cat.id)));
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
      await Promise.all(Array.from(selectedIds).map(id => categoryService.permanentDelete(id)));
      setCategories(prev => prev.filter(cat => !selectedIds.has(cat.id)));
      setTotal(prev => prev - selectedIds.size);
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage your product categories</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <span>Category List ({total})</span>
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
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-8"
                value={searchTerm}
                onChange={e => {
                  setCurrentPage(1);
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
              <div className="grid grid-cols-5 font-medium text-sm">
                <div className="text-left flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected(categories.map(c => c.id))}
                    onChange={() => toggleSelectAll(categories.map(c => c.id))}
                  />
                  Category
                </div>
                <div className="text-center">Name (BN)</div>
                <div className="text-center">Slug</div>
                <div className="text-right col-span-2">Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {categories.length > 0 ? (
                categories.map(cat => (
                  <div key={cat.id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-5 text-sm items-center">
                      <div className="text-left flex items-center gap-3">
                        <Checkbox
                          checked={isSelected(cat.id)}
                          onChange={() => toggleSelect(cat.id)}
                        />
                        <div className="flex items-center gap-3">
                          {cat.icon && (
                            <div className="w-10 h-10 rounded border bg-gray-50 flex items-center justify-center">
                              <CategoryIcon iconName={cat.icon} className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{cat.name}</span>
                            {cat.description && (
                              <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {cat.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">{cat.name_bn}</div>
                      <div className="text-center">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {cat.slug}
                        </code>
                      </div>
                      <div className="flex gap-2 justify-end col-span-2">
                        {viewMode === 'trash' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              title="Restore"
                              onClick={() => handleRestore(cat.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Permanently"
                              onClick={() => handlePermanentDelete(cat.id)}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              title="View"
                              onClick={() => setViewCategory(cat)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              title="Edit"
                              type="button"
                              onClick={() => handleEdit(cat.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete"
                              onClick={() => handleDelete(cat.id)}
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
                      <p className="text-sm mt-1">No deleted categories found.</p>
                    </>
                  ) : searchTerm ? (
                    <>
                      <p>No categories found matching "{searchTerm}".</p>
                      <p className="text-sm mt-1">Try adjusting your search terms.</p>
                    </>
                  ) : (
                    <>
                      <p>No categories available.</p>
                      <p className="text-sm mt-1">Create your first category to get started.</p>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Pagination Controls */}
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

      <AddCategoryModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onAdd={handleAddCategory}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
      />

      {editCategory && (
        <AddCategoryModal
          isOpen={!!editCategory}
          onClose={() => setEditCategory(null)}
          onAdd={handleEditCategory}
          newCategory={editCategory}
          setNewCategory={setEditCategory}
          mode="edit"
        />
      )}

      {viewCategory && (
        <ViewCategoryModal
          isOpen={!!viewCategory}
          onClose={() => setViewCategory(null)}
          category={viewCategory}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category?"
        description="Are you sure you want to delete this category? It will be moved to trash."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!permanentDeleteId}
        title="Permanently Delete Category?"
        description="Are you sure you want to permanently delete this category? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handlePermanentDeleteConfirm}
        onCancel={() => setPermanentDeleteId(null)}
      />
    </div>
  );
}
