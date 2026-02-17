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
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  UserCheck,
  Users,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import AttendanceSkeleton from "~/components/skeleton/AttendanceSkeleton";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import AddAttendanceFormModal from "~/components/modals/AddAttendanceFormModal";
import { attendanceService } from "~/services/httpServices/attendanceService";
import { userService } from "~/services/httpServices/userService";
import type {
  Attendance,
  AttendanceFormData,
  AttendanceStatus,
  GetAllAttendanceParams,
  AttendanceListResponse
} from "~/types/attendance";
import type { User } from "~/types/user";
import { useSelector } from "react-redux";
import type { RootState } from "~/redux/store/rootReducer";

export default function AttendancePage() {
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [roleFilter, setRoleFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage] = useState(20);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
    clearSelection();
  }, [selectedDate, statusFilter, approvalFilter, currentPage, viewMode]);

  useEffect(() => {
    attendanceService.getTrash({ page: 1, per_page: 1 }).then((res: any) => setTrashCount(res.total || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    let filtered = attendanceRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(record =>
        record.user?.role === roleFilter
      );
    }

    setFilteredRecords(filtered);
  }, [attendanceRecords, searchTerm, roleFilter]);

  const fetchEmployees = async () => {
    try {
      const response = await userService.getUsers({ limit: 100 });
      setEmployees(response.data.users || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);

      if (viewMode === 'trash') {
        const response: any = await attendanceService.getTrash({
          page: currentPage,
          per_page: perPage,
        });
        setAttendanceRecords(response.data || []);
        setTotalRecords(response.total || 0);
        setTotalPages(response.totalPages || 1);
      } else {
        const params: GetAllAttendanceParams = {
          page: currentPage,
          per_page: perPage,
          attendance_date: selectedDate,
          status: statusFilter || undefined,
          is_approved: approvalFilter ? approvalFilter === 'approved' : undefined,
          sort_by: 'attendance_date',
          sort_order: 'desc'
        };

        const response: AttendanceListResponse = await attendanceService.getAll(params);

        if (response.status === 'success') {
          setAttendanceRecords(response.data || []);
          setTotalRecords(response.total || 0);
          setTotalPages(response.totalPages || 1);
        } else {
          console.error('Failed to fetch attendance:', response.message);
          setAttendanceRecords([]);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceRecords([]);
      setFilteredRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    setApprovalId(id);
  };

  const handleApproveConfirm = async () => {
    if (!approvalId) return;

    if (!isAuthenticated || !user) {
        console.error('User not authenticated');
        return;
      }

    try {
      await attendanceService.approve(approvalId, user.id);
      await fetchAttendance();
      setApprovalId(null);
    } catch (error) {
      console.error('Error approving attendance:', error);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await attendanceService.delete(deleteId);
      setTrashCount(prev => prev + 1);
      await fetchAttendance();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting attendance:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await attendanceService.bulkDelete(Array.from(selectedIds));
      setAttendanceRecords(prev => prev.filter(item => !selectedIds.has(item.id)));
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
      await attendanceService.bulkRestore(Array.from(selectedIds));
      setAttendanceRecords(prev => prev.filter(item => !selectedIds.has(item.id)));
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
      await attendanceService.bulkPermanentDelete(Array.from(selectedIds));
      setAttendanceRecords(prev => prev.filter(item => !selectedIds.has(item.id)));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  const handleRestore = async (id: string) => {
    try {
      await attendanceService.restore(id);
      setAttendanceRecords(prev => prev.filter(item => item.id !== id));
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await attendanceService.permanentDelete(id);
      setAttendanceRecords(prev => prev.filter(item => item.id !== id));
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
  };

  const handleAddAttendance = () => {
    setIsAddModalOpen(true);
  };

  const handleAddAttendanceSubmit = async (data: AttendanceFormData) => {
    try {
      const response = await attendanceService.create(data);

      if (response.status === 'success') {
        console.log('Attendance record added successfully');
        await fetchAttendance();
        setIsAddModalOpen(false);
      } else {
        throw new Error(response.message || 'Failed to create attendance record');
      }
    } catch (error) {
      console.error('Error adding attendance record:', error);
      throw error;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setStatusFilter("");
    setRoleFilter("");
    setApprovalFilter("");
    setCurrentPage(1);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setDateFilter(date);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const exportAttendance = async () => {
    try {
      alert("Exporting attendance data...");
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A";

    try {
      const [hours, minutes] = timeString.split(':');
      const hoursNum = parseInt(hours);
      const period = hoursNum >= 12 ? 'PM' : 'AM';
      const hours12 = hoursNum % 12 || 12;

      return `${hours12}:${minutes} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return "N/A";
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half_day':
        return 'bg-orange-100 text-orange-800';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'half_day':
        return 'Half Day';
      case 'on_leave':
        return 'On Leave';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const uniqueRoles = [...new Set(employees.map(emp => emp.role).filter(Boolean))].sort();

  const hasActiveFilters = searchTerm || statusFilter || roleFilter || approvalFilter;
  const hasRecords = attendanceRecords.length > 0;
  const hasFilteredResults = filteredRecords.length > 0;

  const totalEmployees = employees.length;
  const presentCount = filteredRecords.filter(record =>
    ['present', 'late', 'half_day'].includes(record.status)
  ).length;
  const absentCount = filteredRecords.filter(record => record.status === 'absent').length;
  const pendingApprovals = filteredRecords.filter(record => !record.is_approved).length;

  if (isLoading) {
    return <AttendanceSkeleton />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6" />
            Attendance Tracking
          </h1>
          <p className="text-gray-600">Monitor and manage employee attendance</p>
        </div>
        <div className="flex gap-2">
          {viewMode === 'active' && (
            <>
              <Button onClick={handleAddAttendance} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Attendance
              </Button>
              <Button variant="outline" onClick={exportAttendance} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-auto"
              />
            </>
          )}
        </div>
      </div>

      {/* Stats Cards - Only show in active view */}
      {viewMode === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-sm text-gray-500">
                {totalEmployees ? Math.round((presentCount / totalEmployees) * 100) : 0}% attendance
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            </CardContent>
          </Card>
          <Card className={pendingApprovals > 0 ? "border-yellow-300" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className={`w-4 h-4 ${pendingApprovals > 0 ? "text-yellow-500" : ""}`} />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pendingApprovals > 0 ? "text-yellow-600" : ""}`}>
                {pendingApprovals}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
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
              {viewMode === 'active' && (
                <>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-40"
                  >
                    <option value="">All Roles</option>
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </Select>

                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | "")}
                    className="w-40"
                  >
                    <option value="">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="half_day">Half Day</option>
                    <option value="on_leave">On Leave</option>
                  </Select>

                  <Select
                    value={approvalFilter}
                    onChange={(e) => setApprovalFilter(e.target.value)}
                    className="w-40"
                  >
                    <option value="">All Records</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Approval</option>
                  </Select>
                </>
              )}

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
          <BulkActionBar
            selectedCount={selectedCount}
            onDelete={handleBulkDelete}
            onClearSelection={clearSelection}
            isTrashView={viewMode === 'trash'}
            onRestore={handleBulkRestore}
            onPermanentDelete={handleBulkPermanentDelete}
            loading={bulkLoading}
          />
          {hasRecords && hasFilteredResults ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected(filteredRecords.map(r => r.id))}
                        onChange={() => toggleSelectAll(filteredRecords.map(r => r.id))}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className={
                      viewMode === 'active'
                        ? record.status === 'absent' ? 'bg-red-50' :
                          record.status === 'late' ? 'bg-yellow-50' : ''
                        : ''
                    }>
                      <TableCell>
                        <Checkbox
                          checked={isSelected(record.id)}
                          onChange={() => toggleSelect(record.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {record.user?.picture ? (
                            <img
                              src={record.user.picture}
                              alt={`${record.user.firstName} ${record.user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
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
                        {record.check_in ? (
                          <div className="font-medium">{formatTime(record.check_in)}</div>
                        ) : (
                          <div className="text-gray-500">N/A</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.check_out ? (
                          <div className="font-medium">{formatTime(record.check_out)}</div>
                        ) : (
                          <div className="text-gray-500">N/A</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusText(record.status)}
                        </Badge>
                        {record.notes && (
                          <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={record.notes}>
                            {record.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {Number(record.work_hours) > 0 ? Number(record.work_hours).toFixed(1) + ' hrs' : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${Number(record.overtime_hours) > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                          {Number(record.overtime_hours) > 0 ? Number(record.overtime_hours).toFixed(1) + ' hrs' : 'None'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.is_approved ? (
                          <div className="flex flex-col">
                            <div className="d-block mb-1">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Approved
                                </Badge>
                            </div>
                            {record.approved_by && (
                              <span className="text-xs text-gray-500 mt-1">
                                By: {record.approver?.first_name} {record.approver?.last_name || record.approved_by}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {viewMode === 'active' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/dashboard/attendance/${record.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/dashboard/attendance/${record.id}/edit`)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Record
                              </DropdownMenuItem>
                              {!record.is_approved && (
                                <DropdownMenuItem
                                  onClick={() => handleApprove(record.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(record.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestore(record.id)}
                              title="Restore"
                              className="text-green-600 hover:bg-green-50 cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePermanentDelete(record.id)}
                              title="Delete Permanently"
                              className="text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} entries
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {currentPage > 3 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            className="w-8 h-8 p-0"
                          >
                            1
                          </Button>
                          {currentPage > 4 && (
                            <span className="text-gray-500 px-2">...</span>
                          )}
                        </>
                      )}

                      {getPaginationNumbers().map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}

                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="text-gray-500 px-2">...</span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            className="w-8 h-8 p-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* No filtered results message */}
              {!hasFilteredResults && hasActiveFilters && (
                <div className="text-center py-8">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No attendance records found matching your filters.</p>
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
            /* No records for the selected date - Empty state */
            <div className="text-center py-12">
              <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {viewMode === 'trash' ? 'Trash is empty' : 'No attendance records for this date'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {viewMode === 'trash'
                  ? 'No deleted attendance records found.'
                  : `There are no attendance records available for ${format(new Date(selectedDate), 'MMMM d, yyyy')}.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Attendance Modal */}
      <AddAttendanceFormModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddAttendanceSubmit}
      />

      {/* Confirm Approval Dialog */}
      <ConfirmDialog
        open={!!approvalId}
        title="Approve Attendance Record"
        description="Are you sure you want to approve this attendance record? This will mark the record as verified."
        confirmText="Approve"
        cancelText="Cancel"
        onConfirm={handleApproveConfirm}
        onCancel={() => setApprovalId(null)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Attendance Record"
        description="Are you sure you want to delete this attendance record? It will be moved to trash."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
