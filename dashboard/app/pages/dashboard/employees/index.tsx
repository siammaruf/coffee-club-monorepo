import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Users, Plus, Search, Eye, Trash2, UserX, RotateCcw, AlertTriangle } from "lucide-react";
import { getStatusColor } from "~/data/employees";
import { Pagination } from "~/components/ui/pagination";
import { userService } from "~/services/httpServices/userService";
import type { User } from "~/types/user";
import { useNavigate } from "react-router";
import EmployeesLoadingSkeleton from "~/components/skeleton/EmployeesLoadingSkeleton";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";

export default function Employees() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page');
    return p && !isNaN(Number(p)) ? Number(p) : 1;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [viewMode]);

  // Fetch trash count on initial load
  useEffect(() => {
    userService.getTrash({ page: 1, limit: 1 }).then((res: any) => {
      setTrashCount(res.total || 0);
    }).catch(() => {});
  }, []);

  // Clear selection when viewMode changes
  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let response: any;
      if (viewMode === 'trash') {
        response = await userService.getTrash();
      } else {
        response = await userService.getUsers();
      }

      if (viewMode === 'trash') {
        const data = response?.data || response;
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } else {
        if (Array.isArray(response)) {
          setUsers(response);
        } else {
          const users = (response as any)?.data?.users || (response as any)?.users || response;
          if (Array.isArray(users)) {
            setUsers(users);
          } else {
            console.error('API response structure is unexpected:', response);
            setUsers([]);
            setError('Invalid data format received from server');
          }
        }
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setUsers([]);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = (Array.isArray(users) ? users : []).filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = positionFilter === "" || user.role === positionFilter;
    const matchesStatus = statusFilter === "" || user.status === statusFilter;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const p = params.get('page');
    if (p && !isNaN(Number(p))) {
      setCurrentPage(Number(p));
    }
  }, [location.search]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    const params = new URLSearchParams(location.search);
    params.set('page', pageNumber.toString());
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const uniquePositions = [...new Set(users.map(user => user.role))];
  const uniqueStatuses = [...new Set(users.map(user => user.status))];

  const navigate = useNavigate();

  const handleViewEmployee = (userId: string) => {
    navigate(`/dashboard/employees/${userId}`, { state: { fromPage: currentPage } });
  };

  const handleInactiveEmployee = async (userId: string) => {
    try {
      await userService.updateUser(userId, { status: 'inactive' });
      await fetchUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      setError('Failed to deactivate employee');
    }
  };

  const handleDeleteEmployee = (userId: string) => {
    setDeleteId(userId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await userService.deleteUser(deleteId);
      setUsers(prev => prev.filter(u => u.id !== deleteId));
      setTrashCount(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete employee');
    }
    setDeleteId(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await userService.restore(id);
      setUsers(prev => prev.filter(u => u.id !== id));
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
      await userService.permanentDelete(permanentDeleteId);
      setUsers(prev => prev.filter(u => u.id !== permanentDeleteId));
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
      await userService.bulkDelete(Array.from(selectedIds));
      setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
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
      await Promise.all(Array.from(selectedIds).map(id => userService.restore(id)));
      setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
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
      await Promise.all(Array.from(selectedIds).map(id => userService.permanentDelete(id)));
      setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  if (loading) {
    return <EmployeesLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">
            Manage your coffee club staff members
          </p>
        </div>
        <Link to="/dashboard/employees/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Employee List</span>
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
                value={positionFilter}
                onChange={(e) => {
                  setPositionFilter(e.target.value);
                  handleFilterChange();
                }}
                className="w-40"
              >
                <option value="">All Positions</option>
                {uniquePositions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilterChange();
                }}
                className="w-40"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilterChange();
                  }}
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
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-7 font-medium text-sm">
                <div className="text-left flex items-center gap-2">
                  <Checkbox
                    checked={isAllSelected(currentItems.map(u => u.id))}
                    onChange={() => toggleSelectAll(currentItems.map(u => u.id))}
                  />
                  Name
                </div>
                <div className="text-center">Role</div>
                <div className="text-center">Email</div>
                <div className="text-center">Phone</div>
                <div className="text-center">Status</div>
                <div className="text-right col-span-2">Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {currentItems.length > 0 ? (
                currentItems.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-7 text-sm items-center">
                      <div className="flex items-center gap-3 text-left">
                        <Checkbox
                          checked={isSelected(user.id)}
                          onChange={() => toggleSelect(user.id)}
                        />
                        <img
                          src={user.picture || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTVFN0VCIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM2QjcyODAiLz4KPHBhdGggZD0iTTEwIDMyQzEwIDI2LjQ3NzIgMTQuNDc3MiAyMiAyMCAyMkMyNS41MjI4IDIyIDMwIDI2LjQ3NzIgMzAgMzJIMTBaIiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo='}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTVFN0VCIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM2QjcyODAiLz4KPHBhdGggZD0iTTEwIDMyQzEwIDI2LjQ3NzIgMTQuNDc3MiAyMiAyMCAyMkMyNS41MjI4IDIyIDMwIDI2LjQ3NzIgMzAgMzJIMTBaIiBmaWxsPSIjNkI3MjgwIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                        <span className="font-medium">{user.first_name} {user.last_name}</span>
                      </div>
                      <div className="text-center">{user.role}</div>
                      <div className="text-center">{user.email}</div>
                      <div className="text-center">{user.phone}</div>
                      <div className="text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 justify-end col-span-2">
                        {viewMode === 'trash' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(user.id)}
                              className="h-8 px-3 flex items-center gap-1"
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePermanentDelete(user.id)}
                              className="h-8 px-3 flex items-center gap-1 text-red-600"
                              title="Delete Permanently"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewEmployee(user.id)}
                              className="h-8 px-3 flex items-center gap-1"
                              title="View Employee"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEmployee(user.id)}
                              className="h-8 px-3 flex items-center gap-1 text-red-600 hover:bg-red-50"
                              title="Delete Employee"
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
                <div className="p-4 text-center text-muted-foreground">
                  {viewMode === 'trash'
                    ? 'Trash is empty. No deleted employees found.'
                    : 'No employees found matching your search.'}
                </div>
              )}
            </div>
          </div>

          {filteredEmployees.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredEmployees.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Employee?"
        description="Are you sure you want to delete this employee? It will be moved to trash."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!permanentDeleteId}
        title="Permanently Delete Employee?"
        description="Are you sure you want to permanently delete this employee? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handlePermanentDeleteConfirm}
        onCancel={() => setPermanentDeleteId(null)}
      />
    </div>
  );
}
