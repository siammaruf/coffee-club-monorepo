import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
import { 
  Search, 
  Edit, 
  Trash2,
  Plus,
  FileSpreadsheet,
  Filter,
  Eye
} from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import ExpenseCategorySkeleton from "~/components/skeleton/ExpenseCategorySkeleton";
import expenseCategoryService from "~/services/httpServices/expenseCategory";
import type { AddExpenseCategoryModalProps, ExpenseCategory } from "~/types/expenseCategory";
import AddExpenseCategoryModal from "~/components/modals/AddExpenseCategoryModal";
import EditExpenseCategoryModal from "~/components/modals/EditExpenseCategoryModal";
import type { EditExpenseCategoryModalProps } from "~/components/modals/EditExpenseCategoryModal";
import ViewExpenseCategoryModal from "~/components/modals/ViewExpenseCategoryModalProps";
import * as IoIcons from "react-icons/io5";

export default function ExpenseCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ExpenseCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<ExpenseCategory | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [categoryToView, setCategoryToView] = useState<ExpenseCategory | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    let filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await expenseCategoryService.getAll() as { data: ExpenseCategory[] };
      setCategories(res.data || []);
      setFilteredCategories(res.data || []);
    } catch (error) {
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add handler for modal create
  const handleAddCategory = () => {
    setShowAddModal(true);
  };

  const handleAddCategorySuccess = (newCategory: ExpenseCategory) => {
    setCategories(prev => [newCategory, ...prev]);
    setFilteredCategories(prev => [newCategory, ...prev]);
    setShowAddModal(false);
  };

  const handleCreateCategory: AddExpenseCategoryModalProps["onCreate"] = async (data) => {
    return await expenseCategoryService.create(data);
  };

  const handleEditCategory = (id: string) => {
    const category = categories.find((cat) => cat.id === id) || null;
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  const handleUpdateCategory: EditExpenseCategoryModalProps["onUpdate"] = async (id, data) => {
    return await expenseCategoryService.update(id, data);
  };

  const handleEditCategorySuccess = (updatedCategory: ExpenseCategory) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    setFilteredCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    setShowEditModal(false);
    setCategoryToEdit(null);
  };

  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await expenseCategoryService.delete(categoryToDelete);
      setCategories(categories.filter(category => category.id !== categoryToDelete));
      setFilteredCategories(filteredCategories.filter(category => category.id !== categoryToDelete));
      setCategoryToDelete(null);
    } catch (error) {
      // Optionally handle error
    }
  }; 
  
  const handleViewCategory = (id: string) => {
    const category = categories.find((cat) => cat.id === id) || null;
    setCategoryToView(category);
    setShowViewModal(true);
  };

  const hasCategories = categories.length > 0;
  const hasFilteredResults = filteredCategories.length > 0;

  if (isLoading) {
    return <ExpenseCategorySkeleton />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6" />
            Expense Categories
          </h1>
          <p className="text-gray-600">Manage budget categories for expense tracking</p>
        </div>
        <div>
          <Button onClick={handleAddCategory} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Category
          </Button>
        </div>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {hasCategories ? `Categories (${filteredCategories.length})` : 'Categories'}
            </CardTitle>
            <div className="flex gap-4 items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasCategories && hasFilteredResults ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Created At</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => {
                    let IconComp: React.ComponentType<{ className?: string }> | undefined;
                    if (category.icon) {
                      const iconKey =
                        "Io" +
                        category.icon
                          .split("-")
                          .map((part) =>
                            part.length > 0 ? part[0].toUpperCase() + part.slice(1) : ""
                          )
                          .join("");
                      IconComp = (IoIcons as any)[iconKey];
                    }

                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-md flex items-center justify-center bg-gray-100 text-xs font-bold uppercase">
                              {IconComp ? (
                                <IconComp className="w-5 h-5" />
                              ) : (
                                <FileSpreadsheet className="w-4 h-4" />
                              )}
                            </span>
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-500">{category.slug}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-gray-500">
                            {category.created_at
                              ? new Date(category.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit"
                                })
                              : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-md truncate" title={category.description}>
                            {category.description || <span className="text-gray-400 italic">No description</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewCategory(category.id)}
                              title="View"
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category.id)}
                              title="Edit"
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                              title="Delete"
                              className="text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* No filtered results message */}
              {!hasFilteredResults && searchTerm && (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No categories found matching your search.</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Try adjusting your search terms to find what you're looking for.
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* No categories at all - Empty state */
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No expense categories</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                You haven't created any expense categories yet. Add your first category to start tracking expenses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <AddExpenseCategoryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddCategorySuccess}
        onCreate={handleCreateCategory}
      />

      {/* Edit Category Modal */}
      <EditExpenseCategoryModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        category={categoryToEdit}
        onUpdate={handleUpdateCategory}
        onSuccess={handleEditCategorySuccess}
      />

      {/* View Category Modal */}
      <ViewExpenseCategoryModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        category={categoryToView}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!categoryToDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This may affect expense records using this category."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}