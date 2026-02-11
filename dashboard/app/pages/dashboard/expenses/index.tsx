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
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  CreditCard,
  TrendingDown,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import ExpensesSkeleton from "~/components/skeleton/ExpensesSkeleton";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import expenseService from "~/services/httpServices/expenseService";
import expenseCategoryService from "~/services/httpServices/expenseCategory";
import type { Expense } from "~/types/expense";
import AddExpenseModal from "~/components/modals/AddExpenseModal";
import EditExpenseModal from "~/components/modals/EditExpenseModal";
import ViewExpenseModal from "~/components/modals/ViewExpenseModalProps"; 

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchExpenses();
    // Fetch categories only once
    expenseCategoryService.getAll().then((res: any) => {
      setCategories(res?.data || []);
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, [categoryFilter, statusFilter, dateFilter]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (categoryFilter) params.categoryId = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.dateFilter = dateFilter;

      const res = await expenseService.getAll(params);
      if (res && typeof res === "object" && "data" in res) {
        setExpenses((res as { data: Expense[] }).data || []);
        setFilteredExpenses((res as { data: Expense[] }).data || []);
      } else {
        setExpenses([]);
        setFilteredExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      setFilteredExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  // Add handler for viewing expense
  const handleViewExpense = (expense: Expense) => {
    setViewingExpense(expense);
    setShowViewModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await expenseService.delete(deleteId);
      setExpenses(expenses.filter(expense => expense.id !== deleteId));
      setFilteredExpenses(filteredExpenses.filter(expense => expense.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleApprove = async (expenseId: string) => {
    try {
      await expenseService.updateStatus(expenseId, "approved");
      setExpenses(expenses =>
        expenses.map(exp =>
          exp.id === expenseId ? { ...exp, status: "approved" } : exp
        )
      );
      setFilteredExpenses(filteredExpenses =>
        filteredExpenses.map(exp =>
          exp.id === expenseId ? { ...exp, status: "approved" } : exp
        )
      );
    } catch (error) {
      console.error("Error approving expense:", error);
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      await expenseService.updateStatus(expenseId, "rejected");
      setExpenses(expenses =>
        expenses.map(exp =>
          exp.id === expenseId ? { ...exp, status: "rejected" } : exp
        )
      );
      setFilteredExpenses(filteredExpenses =>
        filteredExpenses.map(exp =>
          exp.id === expenseId ? { ...exp, status: "rejected" } : exp
        )
      );
    } catch (error) {
      console.error("Error rejecting expense:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
    setDateFilter("");
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "৳0.00";
    return `৳${num.toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    return dateString ? format(new Date(dateString), 'MMM dd, yyyy') : "-";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasActiveFilters = searchTerm || categoryFilter || statusFilter || dateFilter;
  const hasExpenses = expenses.length > 0;
  const hasFilteredResults = filteredExpenses.length > 0;

  if (isLoading) {
    return <ExpensesSkeleton />;
  }

  // Calculate total expenses for each status
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = expenses
    .filter(expense => expense.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="w-6 h-6" />
            Expenses
          </h1>
          <p className="text-gray-600">Track and manage your business expenses</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Stats Cards - Only show if we have expenses */}
      {hasExpenses && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Approved Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(approvedExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Pending Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses Table or Empty State */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {hasExpenses ? `All Expenses (${filteredExpenses.length})` : 'Expenses'}
            </CardTitle>
            <div className="flex gap-4 items-center">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </Select>

              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasExpenses ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="font-medium">{expense.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatDate(expense.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center py-1">
                            {expense.category?.name || 'Uncategorized'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View"
                            className="cursor-pointer"
                            onClick={() => handleViewExpense(expense)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            className="cursor-pointer"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            className="text-red-600 hover:bg-red-50 cursor-pointer"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {expense.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Approve"
                                className="text-green-600 hover:bg-green-50 cursor-pointer"
                                onClick={() => handleApprove(expense.id)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Reject"
                                className="text-red-600 hover:bg-red-50 cursor-pointer"
                                onClick={() => handleReject(expense.id)}
                              >
                                <XCircle className="w-4 h-4" />
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
                  <p className="text-gray-500 mb-2">No expenses found matching your filters.</p>
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
            /* No expenses at all - Empty state */
            <div className="text-center py-12">
              <TrendingDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses recorded yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start tracking your business expenses to manage your finances more effectively.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(expense) => {
          setExpenses([expense, ...expenses]);
          setFilteredExpenses([expense, ...filteredExpenses]);
          setShowAddModal(false);
        }}
        onCreate={expenseService.create}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        expense={editingExpense}
        onSuccess={(updatedExpense) => {
          setExpenses(expenses =>
            expenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
          );
          setFilteredExpenses(filteredExpenses =>
            filteredExpenses.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp)
          );
          setShowEditModal(false);
        }}
        onUpdate={expenseService.update}
      />

      {/* View Expense Modal */}
      <ViewExpenseModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        expense={viewingExpense}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Expense?"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}