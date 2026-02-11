import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Users, Plus, Search, Eye, Trash2, UserX } from "lucide-react";
import { getStatusColor } from "~/data/employees";
import { Pagination } from "~/components/ui/pagination";
import { userService } from "~/services/httpServices/userService";
import type { User } from "~/types/user";
import { useNavigate } from "react-router";
import EmployeesLoadingSkeleton from "~/components/skeleton/EmployeesLoadingSkeleton";

export default function Employees() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getUsers();
        console.log('API Response:', response);
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
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setUsers([]);
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const uniquePositions = [...new Set(users.map(user => user.role))];
  const uniqueStatuses = [...new Set(users.map(user => user.status))];

  const navigate = useNavigate();

  const handleViewEmployee = (userId: string) => {
    navigate(`/dashboard/employees/${userId}`);
  };

  const handleInactiveEmployee = async (userId: string) => {
    try {
      await userService.updateUser(userId, { status: 'inactive' });
      const response = await userService.getUsers();
      if (Array.isArray(response)) {
        setUsers(response);
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      setError('Failed to deactivate employee');
    }
  };

  const handleDeleteEmployee = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await userService.deleteUser(userId);
        const response = await userService.getUsers();
        if (Array.isArray(response)) {
          setUsers(response);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete employee');
      }
    }
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Employee List</span>
            </CardTitle>
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
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-6 font-medium text-sm">
                <div className="text-left">Name</div>
                <div className="text-center">Role</div>
                <div className="text-center">Email</div>
                <div className="text-center">Phone</div>
                <div className="text-center">Status</div>
                <div className="text-right">Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {currentItems.length > 0 ? (
                currentItems.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-6 text-sm items-center">
                      <div className="flex items-center gap-3 text-left">
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
                      <div className="flex items-center gap-2 justify-end">
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
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No employees found matching your search.
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
    </div>
  );
}