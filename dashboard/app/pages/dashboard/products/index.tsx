import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Package, RotateCcw, AlertTriangle } from "lucide-react";
import type { Product, ProductCategory } from "~/types/product";
import ProductsSkeleton from "~/components/skeleton/ProductsSkeleton";
import { productService } from "~/services/httpServices/productService";
import { categoryService } from "~/services/httpServices/categoryService";
import { formatPrice } from "~/lib/utils";
import { Pagination } from "../../../components/ui/pagination";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page");
    return pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : 1;
  });
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll({ limit: 1000 });
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch trash count on initial load
  useEffect(() => {
    productService.getTrash({ page: 1, limit: 1 }).then((res: any) => {
      setTrashCount(res.total || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = params.get("page");
    if (pageParam && !isNaN(Number(pageParam))) {
      setCurrentPage(Number(pageParam));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (searchTerm) params.search = searchTerm;
        if (categoryFilter) params.categorySlug = categoryFilter;
        if (typeFilter) params.type = typeFilter;
        if (statusFilter) params.status = statusFilter;

        const response = viewMode === 'trash'
          ? await productService.getTrash(params)
          : await productService.getAll(params);
        const data = response as any;
        setProducts(Array.isArray(data.data) ? data.data : []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch {
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, typeFilter, statusFilter, viewMode]);

  // Clear selection when viewMode changes
  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set("page", page.toString());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setCurrentPage(1);
    navigate(`${location.pathname}?page=1`, { replace: true });
  };

  const handleDelete = async (id: string) => {
    setDeleteProductId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductId) return;
    try {
      await productService.delete(deleteProductId);
      setProducts(products.filter(product => product.id !== deleteProductId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev + 1);
      setDeleteProductId(null);
    } catch {
      setDeleteProductId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteProductId(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await productService.restore(id);
      setProducts(prev => prev.filter(item => item.id !== id));
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
      await productService.permanentDelete(permanentDeleteId);
      setProducts(prev => prev.filter(item => item.id !== permanentDeleteId));
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
      await productService.bulkDelete(Array.from(selectedIds));
      setProducts(prev => prev.filter(item => !selectedIds.has(item.id!)));
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
      await Promise.all(Array.from(selectedIds).map(id => productService.restore(id)));
      setProducts(prev => prev.filter(item => !selectedIds.has(item.id!)));
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
      await Promise.all(Array.from(selectedIds).map(id => productService.permanentDelete(id)));
      setProducts(prev => prev.filter(item => !selectedIds.has(item.id!)));
      setTotal(prev => prev - selectedIds.size);
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bar':
        return 'bg-purple-100 text-purple-800';
      case 'kitchen':
        return 'bg-green-100 text-green-800';
      case 'beverage':
        return 'bg-blue-100 text-blue-800';
      case 'snack':
        return 'bg-orange-100 text-orange-800';
      case 'dessert':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueTypes = [...new Set(products.map(product => product.type))].sort();

  const hasProducts = products.length > 0;

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Products
          </h1>
          <p className="text-gray-600">Manage your products and inventory</p>
        </div>
        <Link to="/dashboard/products/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Cards - Only show if we have products and in active view */}
      {hasProducts && viewMode === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">On Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(product =>
                  (product.sale_price ?? 0) > 0 && (product.sale_price ?? 0) < (product.regular_price ?? 0)
                ).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(products.reduce((sum, p) => sum + p.regular_price, 0) / (products.length || 1))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Table or Empty State */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <CardTitle>
                {hasProducts ? `All Products (${total})` : 'Products'}
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Types</option>
                <option value="bar">Bar</option>
                <option value="kitchen">Kitchen</option>
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="discontinued">Discontinued</option>
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasProducts ? (
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
                        checked={isAllSelected(products.map(p => p.id!))}
                        onChange={() => toggleSelectAll(products.map(p => p.id!))}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Regular Price</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Variation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    let minPrice = null, maxPrice = null;
                    if (product.has_variations && (product.variations?.length ?? 0) > 0) {
                      const prices = (product.variations ?? []).map(v => Number(v.regular_price));
                      minPrice = Math.min(...prices);
                      maxPrice = Math.max(...prices);
                    }
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="w-[40px]">
                          <Checkbox
                            checked={isSelected(product.id!)}
                            onChange={() => toggleSelect(product.id!)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.name_bn && (
                                <p className="text-sm text-gray-500">{product.name_bn}</p>
                              )}
                              {product.description && (
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(product.categories || []).map((category, idx) => (
                              <Badge
                                key={typeof category === 'string' ? category + idx : category.id}
                                variant="outline"
                              >
                                {typeof category === 'string' ? category : category.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getTypeColor(product.type)} hover:bg-opacity-10 transition-colors duration-200`}>
                            {product.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.has_variations && (product.variations?.length ?? 0) > 0 ? (
                            <Badge variant="outline" className="text-xs">
                              {formatPrice(
                                Math.min(...(product.variations ?? []).map(v => Number(v.regular_price)))
                              )} - {formatPrice(
                                Math.max(...(product.variations ?? []).map(v => Number(v.regular_price)))
                              )}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">{formatPrice(product.regular_price)}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.has_variations && (product.variations?.length ?? 0) > 0 ? (
                            <Badge variant="outline" className="text-xs text-red-600">
                              {formatPrice(
                                Math.min(...(product.variations ?? []).map(v => Number(v.sale_price ?? 0)))
                              )} - {formatPrice(
                                Math.max(...(product.variations ?? []).map(v => Number(v.sale_price ?? 0)))
                              )}
                            </Badge>
                          ) : (
                            (product.sale_price ?? 0) > 0 ? (
                              <div className="flex flex-col">
                                <span className="font-medium text-red-600">
                                  {formatPrice(product.sale_price ?? 0)}
                                </span>
                                {(product.sale_price ?? 0) < product.regular_price && (
                                  <Badge className="text-xs text-gray-500 line-through">
                                    {formatPrice(product.regular_price)}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No sale price</span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {product.has_variations && (product.variations?.length ?? 0) > 0 ? (
                            <Badge variant="outline" className="text-xs">
                              {(product.variations?.length ?? 0)} Variations
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              No Variation
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className={
                              (product.sale_price ?? 0) > 0 && (product.sale_price ?? 0) < (product.regular_price ?? 0)
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {(product.sale_price ?? 0) > 0 && (product.sale_price ?? 0) < product.regular_price ? 'On Sale' : 'Available'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {viewMode === 'trash' ? (
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleRestore(product.id!)} title="Restore">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600" onClick={() => handlePermanentDelete(product.id!)} title="Delete Permanently">
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
                                  onClick={() => navigate(`/dashboard/products/${product.id}`)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(product.id!)}
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
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination controls using Pagination component */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            /* No products at all - Empty state */
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {viewMode === 'trash' ? 'Trash is empty' : 'No products yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {viewMode === 'trash'
                  ? 'No deleted products found.'
                  : 'Get started by adding your first product to the inventory.'}
              </p>
              {viewMode === 'active' && (
                <Link className="flex justify-center" to="/dashboard/products/create">
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete ConfirmDialog (soft delete) */}
      <ConfirmDialog
        open={!!deleteProductId}
        title="Delete Product"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        message="Are you sure you want to delete this product? It will be moved to trash."
      />

      {/* Permanent Delete ConfirmDialog */}
      <ConfirmDialog
        open={!!permanentDeleteId}
        title="Permanently Delete Product"
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handlePermanentDeleteConfirm}
        onCancel={() => setPermanentDeleteId(null)}
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
      />
    </div>
  );
}
