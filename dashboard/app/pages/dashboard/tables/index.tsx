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
  Edit, 
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  Clock,
  Table as TableIcon,
  Filter,
  Eye
} from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import TableSkeleton from "~/components/skeleton/TableSkeleton";
import { tableService } from "~/services/httpServices/tableService";
import type { RestaurantTable } from "~/types/table";
import AddTableModal from "~/components/modals/AddTableModal";
import ViewTableModal from "~/components/modals/ViewTableModal";
import EditTableModal from "~/components/modals/EditTableModalProps";

export default function TablesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [filteredTables, setFilteredTables] = useState<RestaurantTable[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [seatFilter, setSeatFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [tableToChangeStatus, setTableToChangeStatus] = useState<{id: string, status: string} | null>(null);
  const [viewTable, setViewTable] = useState<RestaurantTable | null>(null);
  const [editTable, setEditTable] = useState<RestaurantTable | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    let filtered = tables.filter(table =>
      table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (locationFilter) {
      filtered = filtered.filter(table => table.location === locationFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(table => table.status === statusFilter);
    }

    if (seatFilter) {
      const seats = parseInt(seatFilter);
      filtered = filtered.filter(table => table.seat === seats);
    }

    setFilteredTables(filtered);
  }, [tables, searchTerm, locationFilter, statusFilter, seatFilter]);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const data = await tableService.getAll();
      setTables(data.data);
      setFilteredTables(data.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
      setFilteredTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteTable = (id: string) => {
    setTableToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!tableToDelete) return;
    try {
      await tableService.delete(tableToDelete);
      setTables(tables.filter(table => table.id !== tableToDelete));
      setTableToDelete(null);
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const handleChangeStatus = (id: string, status: string) => {
    setTableToChangeStatus({ id, status });
  };

  const handleStatusChangeConfirm = async () => {
    if (!tableToChangeStatus) return;
    try {
      await tableService.changeStatus(tableToChangeStatus.id, tableToChangeStatus.status);
      setTables(tables =>
        tables.map(table =>
          table.id === tableToChangeStatus.id
            ? { ...table, status: tableToChangeStatus.status as any }
            : table
        )
      );
      setTableToChangeStatus(null);
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setStatusFilter("");
    setSeatFilter("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const uniqueLocations = [...new Set(tables.map(table => table.location))].sort();
  const seatOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const hasActiveFilters = searchTerm || locationFilter || statusFilter || seatFilter;
  const hasTables = tables.length > 0;
  const hasFilteredResults = filteredTables.length > 0;

  const availableTables = tables.filter(table => table.status === 'available').length;
  const occupiedTables = tables.filter(table => table.status === 'occupied').length;
  const reservedTables = tables.filter(table => table.status === 'reserved').length;
  const maintenanceTables = tables.filter(table => table.status === 'maintenance').length;

  const getActionDialogDetails = () => {
    if (!tableToChangeStatus) return { title: '', description: '' };
    
    const table = tables.find(t => t.id === tableToChangeStatus.id);
    if (!table) return { title: '', description: '' };
    
    const statusText = tableToChangeStatus.status.charAt(0).toUpperCase() + tableToChangeStatus.status.slice(1);
    
    return {
      title: `Mark Table ${table.number} as ${statusText}?`,
      description: `Are you sure you want to change the status of table ${table.number} to ${statusText}?`
    };
  };

  const handleAddTableSubmit = async (data: any) => {
    try {
      await tableService.create(data);
      setIsAddModalOpen(false);
      fetchTables();
    } catch (error) {
      console.error("Failed to add table:", error);
    }
  };

  const handleEditTableSave = async (updated: any) => {
    if (!updated?.id) return;

    try {
      const { id, created_at, updated_at, ...updatedTable } = updated;
      await tableService.update(updated.id, updatedTable);
      setEditTable(null);
      fetchTables();
    } catch (error) {
      console.error("Failed to update table:", error);
    }
  };

  const { title: actionTitle, description: actionDescription } = getActionDialogDetails();

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TableIcon className="w-6 h-6" />
            Table Management
          </h1>
          <p className="text-gray-600">Manage restaurant tables and seating</p>
        </div>
        <div>
          <Button onClick={handleAddTable} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Table
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="border-green-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Available Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableTables}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Occupied Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{occupiedTables}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Reserved Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reservedTables}</div>
          </CardContent>
        </Card>
        <Card className="border-red-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Under Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{maintenanceTables}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {hasTables ? `Tables (${filteredTables.length})` : 'Tables'}
            </CardTitle>
            <div className="flex gap-4 items-center">
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </Select>

              <Select
                value={seatFilter}
                onChange={(e) => setSeatFilter(e.target.value)}
                className="w-40"
              >
                <option value="">All Seats</option>
                {seatOptions.map(seats => (
                  <option key={seats} value={seats.toString()}>{seats} {seats === 1 ? 'seat' : 'seats'}</option>
                ))}
              </Select>

              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tables..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasTables && hasFilteredResults ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Number</TableHead>
                    <TableHead className="text-center">Seats</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables.map((table) => (
                    <TableRow
                      key={table.id}
                      className={
                        table.status === 'maintenance'
                          ? 'bg-red-50'
                          : table.status === 'reserved'
                          ? 'bg-yellow-50'
                          : ''
                      }
                    >
                      <TableCell>
                        <div className="font-medium">{table.number}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 justify-center max-w-[100px] mx-auto"
                        >
                          <Users className="w-4 h-4" />
                          {table.seat}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span className="text-sm">{table.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(table.status)}>
                          {getStatusText(table.status)}
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
                            <DropdownMenuItem onClick={() => setViewTable(table)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Table
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditTable(table)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Table
                            </DropdownMenuItem>
                            {table.status !== 'available' && (
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(table.id, 'available')}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Available
                              </DropdownMenuItem>
                            )}
                            {table.status !== 'occupied' && (
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(table.id, 'occupied')}
                                className="text-blue-600"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Mark Occupied
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteTable(table.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Table
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
                  <p className="text-gray-500 mb-2">No tables found matching your filters.</p>
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
            /* No tables at all - Empty state */
            <div className="text-center py-12">
              <TableIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tables configured</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                You haven't added any tables to your restaurant yet. Add your first table to get started.
              </p>
              <Button onClick={handleAddTable}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Table
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!tableToDelete}
        title="Delete Table"
        description="Are you sure you want to delete this table? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTableToDelete(null)}
      />

      {/* Confirm Status Change Dialog */}
      <ConfirmDialog
        open={!!tableToChangeStatus}
        title={actionTitle}
        description={actionDescription}
        confirmText={`Mark as ${(tableToChangeStatus?.status ?? '').charAt(0).toUpperCase() + (tableToChangeStatus?.status ?? '').slice(1)}`}
        cancelText="Cancel"
        onConfirm={handleStatusChangeConfirm}
        onCancel={() => setTableToChangeStatus(null)}
      />
      <AddTableModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTableSubmit}
      />
      <ViewTableModal
        open={!!viewTable}
        onClose={() => setViewTable(null)}
        table={viewTable}
      />
      <EditTableModal
        open={!!editTable}
        onClose={() => setEditTable(null)}
        table={editTable}
        onSave={handleEditTableSave}
      />
    </div>
  );
}