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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Download,
  CreditCard,
  DollarSign,
  Receipt,
  Users,
  Filter,
  CalendarRange,
  BanknoteIcon,
  Clock,
  Plus,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import SalarySkeleton from "~/components/skeleton/SalarySkeleton";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { salaryService } from "~/services/httpServices/salaryService";
import type { Salary } from "~/types/salary";
import SalaryDetailsModal from "~/components/modals/SalaryDetailsModal";

export default function SalaryPage() {
  const navigate = useNavigate();
  const [salaryRecords, setSalaryRecords] = useState<Salary[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Salary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRecord, setPaymentRecord] = useState<string | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage] = useState(20);
  const [viewRecord, setViewRecord] = useState<Salary | null>(null);

  useEffect(() => {
    fetchSalaryRecords();
  }, [currentPage, monthFilter, paymentFilter]);

  useEffect(() => {
    let filtered = salaryRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(record => 
        record.user?.role === departmentFilter
      );
    }

    setFilteredRecords(filtered);
  }, [salaryRecords, searchTerm, departmentFilter]);

  const fetchSalaryRecords = async () => {
    try {
      setIsLoading(true);

      const params: any = {
        page: currentPage,
        per_page: perPage,
        salary_month: monthFilter || undefined,
        payment_status: paymentFilter || undefined,
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      const response = await salaryService.getAll(params);

      if (response.status === 'success') {
        setSalaryRecords(response.data || []);
        setTotalRecords(response.total || 0);
      } else {
        console.error('Failed to fetch salary records:', response.message);
        setSalaryRecords([]);
      }
    } catch (error) {
      console.error('Error fetching salary records:', error);
      setSalaryRecords([]);
      setFilteredRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaySalary = (id: string) => {
    setPaymentRecord(id);
  };

  const handlePayConfirm = async () => {
    if (!paymentRecord) return;

    try {
      await salaryService.markAsPaid(paymentRecord);
      await fetchSalaryRecords();
      setPaymentRecord(null);
    } catch (error) {
      console.error('Error processing salary payment:', error);
    }
  };

  const handleDeleteSalary = (id: string) => {
    setDeleteRecord(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRecord) return;
    try {
      console.log('Deleting salary record:', deleteRecord);
      await salaryService.delete(deleteRecord);
      await fetchSalaryRecords();
    } catch (error) {
      console.error('Error deleting salary record:', error);
    }
    setDeleteRecord(null);
  };

  const handleGenerateSlips = () => {
    alert("Generating salary slips for all employees...");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMonthFilter("");
    setDepartmentFilter("");
    setPaymentFilter("");
    setCurrentPage(1);
  };

  const handleMonthChange = (month: string) => {
    setMonthFilter(month);
    setCurrentPage(1);
  };

  const handleAddSalary = () => {
    navigate('/dashboard/salary/create');
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount?.toLocaleString()}`;
  };

  const formatMonth = (dateString: string) => {
    return format(new Date(dateString), 'MMMM yyyy');
  };

  const uniqueRoles = [...new Set(salaryRecords.map(record => record.user?.role).filter(Boolean))].sort();
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = format(d, 'yyyy-MM');
      const label = format(d, 'MMMM yyyy');
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  const hasActiveFilters = searchTerm || monthFilter || departmentFilter || paymentFilter;
  const hasRecords = salaryRecords.length > 0;
  const hasFilteredResults = filteredRecords.length > 0;
  const totalSalaryAmount = filteredRecords.reduce((sum, record) => sum + (record.total_payble || 0), 0);
  const paidSalaries = filteredRecords.filter(record => record.is_paid).length;
  const pendingSalaries = filteredRecords.filter(record => !record.is_paid).length;

  if (isLoading) {
    return <SalarySkeleton />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Employee Salaries
          </h1>
          <p className="text-gray-600">Manage salary payments and records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddSalary} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Salary
          </Button>
          <Button variant="outline" onClick={handleGenerateSlips} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Generate Payslips
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BanknoteIcon className="w-4 h-4 text-green-500" />
              Total Salary Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSalaryAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-500" />
              Paid Salaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paidSalaries}</div>
          </CardContent>
        </Card>
        <Card className={pendingSalaries > 0 ? "border-yellow-300" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className={`w-4 h-4 ${pendingSalaries > 0 ? "text-yellow-500" : ""}`} />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingSalaries > 0 ? "text-yellow-600" : ""}`}>
              {pendingSalaries}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {hasRecords ? (
                <div className="flex flex-col gap-1">
                  <span>Salary Records</span>
                  <span className="text-sm font-normal text-gray-500">
                    Showing {filteredRecords.length} of {totalRecords} records
                  </span>
                </div>
              ) : (
                'Salary Records'
              )}
            </CardTitle>
            <div className="flex gap-4 items-center">
              <Select
                value={monthFilter}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-40"
              >
                <option value="">All Months</option>
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>

              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{(role ?? '').charAt(0).toUpperCase() + (role ?? '').slice(1)}</option>
                ))}
              </Select>

              <Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Records</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="unpaid">Unpaid</option>
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasRecords && hasFilteredResults ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Total Payable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={`${record.user_id ?? ''}${record.month}`} className={!record.is_paid ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {record.user?.picture ? (
                            <img
                              src={record.user.picture}
                              alt={`${record.user.first_name} ${record.user.last_name}`}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {record.user?.first_name} {record.user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.user?.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatMonth(record.month ?? "")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(record.base_salary ?? 0)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">{formatCurrency(record.bonus ?? 0)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-red-600">{formatCurrency(record.deductions ?? 0)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-blue-600">{formatCurrency(record.total_payble ?? 0)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          record.is_paid ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {record.is_paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewRecord(record)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/dashboard/salary/${record.user_id}/${record.month}/edit`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Record
                            </DropdownMenuItem>
                            {record.is_paid ? (
                              <DropdownMenuItem
                                onClick={() => navigate(`/dashboard/salary/${record.user_id}/${record.month}/receipt`)}
                              >
                                <Receipt className="w-4 h-4 mr-2" />
                                View Payslip
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => record.user_id && handlePaySalary(record.user_id)}
                                className="text-green-600"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => record.id && handleDeleteSalary(record.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* No filtered results message */}
              {!hasFilteredResults && hasActiveFilters && (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No salary records found matching your filters.</p>
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
            /* No records - Empty state */
            <div className="text-center py-12">
              <CalendarRange className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No salary records found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more results." 
                  : "Salary records will appear here once they are created."}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Payment Dialog */}
      <ConfirmDialog
        open={!!paymentRecord}
        title="Mark Salary as Paid"
        description="Are you sure you want to mark this salary as paid? This will update the payment status."
        confirmText="Mark as Paid"
        cancelText="Cancel"
        onConfirm={handlePayConfirm}
        onCancel={() => setPaymentRecord(null)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteRecord}
        title="Delete Salary Record"
        description="Are you sure you want to delete this salary record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteRecord(null)}
      />

      {/* Salary Details Modal */}
      <SalaryDetailsModal
        open={!!viewRecord}
        onClose={() => setViewRecord(null)}
        record={viewRecord}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}