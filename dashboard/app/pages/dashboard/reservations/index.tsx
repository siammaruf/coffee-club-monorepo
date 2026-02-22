import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Eye, Search, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import { reservationService } from "~/services/httpServices/reservationService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import ReservationModal from "./components/ReservationModal";
import type { Reservation, ReservationStatus } from "~/types/reservation";

const EVENT_TYPE_LABELS: Record<string, string> = {
  DINING: "Dining",
  BIRTHDAY: "Birthday",
  MEETING: "Meeting",
  PRIVATE_EVENT: "Private Event",
  OTHER: "Other",
};

function getStatusBadgeClasses(status: ReservationStatus): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
}

export default function ReservationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewReservation, setViewReservation] = useState<Reservation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [total, setTotal] = useState(0);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  useEffect(() => {
    // Fetch trash count on mount
    reservationService.getTrash({ page: 1, limit: 1 }).then((res: any) => setTrashCount(res.total || 0)).catch(() => {});
  }, []);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      const res = viewMode === 'active'
        ? await reservationService.getAll(params)
        : await reservationService.getTrash(params) as any;
      setReservations(res.data || []);
      setTotal(res.total || 0);
    } catch {
      setReservations([]);
      setTotal(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, [currentPage, searchTerm, statusFilter, viewMode]);

  const handleReservationUpdate = (updated: Reservation) => {
    setReservations(prev =>
      prev.map(r => (r.id === updated.id ? updated : r))
    );
    setViewReservation(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await reservationService.delete(deleteId);
      setReservations(prev => prev.filter(r => r.id !== deleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to delete reservation:", error);
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await reservationService.bulkDelete(Array.from(selectedIds));
      setReservations(prev => prev.filter(item => !selectedIds.has(item.id)));
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
      await reservationService.bulkRestore(Array.from(selectedIds));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
      fetchReservations();
    } catch (error) {
      console.error("Bulk restore failed:", error);
      fetchReservations();
    }
    setBulkLoading(false);
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const response: any = await reservationService.bulkPermanentDelete(Array.from(selectedIds));
      const deletedCount = response?.data?.deleted?.length ?? selectedIds.size;
      setTrashCount(prev => prev - deletedCount);
      clearSelection();
      fetchReservations();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
      fetchReservations();
    }
    setBulkLoading(false);
  };

  const handleRestore = async (id: string) => {
    try {
      await reservationService.restore(id);
      setReservations(prev => prev.filter(item => item.id !== id));
      setTotal(prev => prev - 1);
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
      await reservationService.permanentDelete(permanentDeleteId);
      setReservations(prev => prev.filter(item => item.id !== permanentDeleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
    setPermanentDeleteId(null);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (isLoading) {
    return <ReservationsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
          <p className="text-muted-foreground">Manage table reservations and events</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setViewMode('active'); setCurrentPage(1); }}
              >
                Active
              </Button>
              <Button
                variant={viewMode === 'trash' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setViewMode('trash'); setCurrentPage(1); }}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Trash {trashCount > 0 && `(${trashCount})`}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={statusFilter}
                onChange={e => {
                  setCurrentPage(1);
                  setStatusFilter(e.target.value);
                }}
                className="w-40 h-10"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => {
                    setCurrentPage(1);
                    setSearchTerm(e.target.value);
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
              <div className="grid grid-cols-9 font-medium text-sm">
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={isAllSelected(reservations.map(r => r.id))}
                    onChange={() => toggleSelectAll(reservations.map(r => r.id))}
                  />
                </div>
                <div className="col-span-2 text-left">Guest</div>
                <div className="text-center">Date</div>
                <div className="text-center">Time</div>
                <div className="text-center">Party</div>
                <div className="text-center">Event</div>
                <div className="text-center">Status</div>
                <div className="text-right">Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {reservations.length > 0 ? (
                reservations.map(reservation => (
                  <div key={reservation.id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-9 text-sm items-center">
                      <div className="col-span-1 flex items-center">
                        <Checkbox
                          checked={isSelected(reservation.id)}
                          onChange={() => toggleSelect(reservation.id)}
                        />
                      </div>
                      <div className="col-span-2 text-left">
                        <div className="flex flex-col">
                          <span className="font-medium">{reservation.name}</span>
                          <span className="text-xs text-gray-500">{reservation.phone}</span>
                        </div>
                      </div>
                      <div className="text-center text-gray-600">
                        {new Date(reservation.date).toLocaleDateString()}
                      </div>
                      <div className="text-center text-gray-600">
                        {reservation.time}
                      </div>
                      <div className="text-center text-gray-600">
                        {reservation.party_size}
                      </div>
                      <div className="text-center text-gray-600 text-xs">
                        {EVENT_TYPE_LABELS[reservation.event_type] || reservation.event_type}
                      </div>
                      <div className="text-center">
                        <Badge className={getStatusBadgeClasses(reservation.status)}>
                          {reservation.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 justify-end">
                        {viewMode === 'active' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              title="View / Edit"
                              onClick={() => setViewReservation(reservation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete"
                              onClick={() => setDeleteId(reservation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 cursor-pointer"
                              title="Restore"
                              onClick={() => handleRestore(reservation.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Permanently"
                              onClick={() => handlePermanentDelete(reservation.id)}
                            >
                              <AlertTriangle className="h-4 w-4" />
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
                      <p className="text-sm mt-1">No deleted reservations found.</p>
                    </>
                  ) : searchTerm || statusFilter ? (
                    <>
                      <p>No reservations found matching your filters.</p>
                      <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
                    </>
                  ) : (
                    <>
                      <p>No reservations available.</p>
                      <p className="text-sm mt-1">Reservations from the website will appear here.</p>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center gap-2 p-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {viewReservation && (
        <ReservationModal
          isOpen={!!viewReservation}
          onClose={() => setViewReservation(null)}
          onSave={handleReservationUpdate}
          reservation={viewReservation}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Reservation?"
        description="Are you sure you want to delete this reservation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />

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

function ReservationsLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-72 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-9 gap-4">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-10" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-14" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-14" />
                <div className="h-4 bg-gray-200 rounded animate-pulse ml-auto w-14" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="grid grid-cols-9 items-center gap-4">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="col-span-2 flex flex-col gap-1">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-6 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-14 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse mx-auto" />
                    <div className="flex gap-2 justify-end">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
