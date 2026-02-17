import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import { Edit, Plus, Search, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { partnerService } from "~/services/httpServices/partnerService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import PartnerModal from "./components/PartnerModal";
import type { Partner } from "~/types/partner";

export default function PartnersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [total, setTotal] = useState(0);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (searchTerm) params.search = searchTerm;

        const res = viewMode === 'active'
          ? await partnerService.getAll(params)
          : await partnerService.getTrash(params);
        setPartners((res as any).data || []);
        setTotal((res as any).total || 0);
      } catch {
        setPartners([]);
        setTotal(0);
      }
      setIsLoading(false);
    };
    fetchPartners();
  }, [currentPage, searchTerm, viewMode]);

  useEffect(() => {
    partnerService.getTrash({ page: 1, limit: 1 }).then((res: any) => setTrashCount(res.total || 0)).catch(() => {});
  }, []);

  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  const handleAddPartner = (partnerData: Partner) => {
    setPartners(prev => [partnerData, ...prev]);
    setShowAddModal(false);
  };

  const handleEditPartner = (partnerData: Partner) => {
    setPartners(prev => prev.map(p => (p.id === partnerData.id ? partnerData : p)));
    setEditPartner(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await partnerService.delete(deleteId);
      setPartners(prev => prev.filter(p => p.id !== deleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to delete partner:", error);
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await partnerService.bulkDelete(Array.from(selectedIds));
      setPartners(prev => prev.filter(item => !selectedIds.has(item.id)));
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
      await partnerService.bulkRestore(Array.from(selectedIds));
      setPartners(prev => prev.filter(item => !selectedIds.has(item.id)));
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
      await partnerService.bulkPermanentDelete(Array.from(selectedIds));
      setPartners(prev => prev.filter(item => !selectedIds.has(item.id)));
      setTotal(prev => prev - selectedIds.size);
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
    }
    setBulkLoading(false);
  };

  const handleRestore = async (id: string) => {
    try {
      await partnerService.restore(id);
      setPartners(prev => prev.filter(item => item.id !== id));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await partnerService.permanentDelete(id);
      setPartners(prev => prev.filter(item => item.id !== id));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (isLoading) {
    return <PartnersLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Partners</h2>
          <p className="text-muted-foreground">Manage partner brands and logos</p>
        </div>
        {viewMode === 'active' && (
          <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        )}
      </div>

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
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
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
              <div className="grid grid-cols-7 font-medium text-sm">
                <div className="flex items-center">
                  <Checkbox
                    checked={isAllSelected(partners.map(p => p.id))}
                    onChange={() => toggleSelectAll(partners.map(p => p.id))}
                  />
                </div>
                <div className="col-span-2 text-left">Partner</div>
                <div className="text-center">Website</div>
                <div className="text-center">Sort Order</div>
                <div className="text-center">Status</div>
                <div className="text-right">Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {partners.length > 0 ? (
                partners.map(partner => (
                  <div key={partner.id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-7 text-sm items-center">
                      <div className="flex items-center">
                        <Checkbox
                          checked={isSelected(partner.id)}
                          onChange={() => toggleSelect(partner.id)}
                        />
                      </div>
                      <div className="col-span-2 text-left">
                        <div className="flex items-center gap-3">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-10 h-10 rounded border object-contain bg-gray-50 p-0.5 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3ENo%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          <span className="font-medium truncate">{partner.name}</span>
                        </div>
                      </div>
                      <div className="text-center text-gray-600 truncate px-1">
                        {partner.website ? (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {partner.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          "---"
                        )}
                      </div>
                      <div className="text-center text-gray-600">{partner.sort_order}</div>
                      <div className="text-center">
                        <Badge
                          className={
                            partner.is_active
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {partner.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 justify-end">
                        {viewMode === 'active' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              title="Edit"
                              type="button"
                              onClick={() => setEditPartner(partner)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete"
                              onClick={() => setDeleteId(partner.id)}
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
                              onClick={() => handleRestore(partner.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Permanently"
                              onClick={() => handlePermanentDelete(partner.id)}
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
                      <p className="text-sm mt-1">No deleted partners found.</p>
                    </>
                  ) : searchTerm ? (
                    <>
                      <p>No partners found matching &quot;{searchTerm}&quot;.</p>
                      <p className="text-sm mt-1">Try adjusting your search terms.</p>
                    </>
                  ) : (
                    <>
                      <p>No partners available.</p>
                      <p className="text-sm mt-1">Add your first partner to get started.</p>
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

      <PartnerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPartner}
        mode="add"
      />

      {editPartner && (
        <PartnerModal
          isOpen={!!editPartner}
          onClose={() => setEditPartner(null)}
          onSave={handleEditPartner}
          partner={editPartner}
          mode="edit"
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Partner?"
        description="Are you sure you want to delete this partner? It will be moved to trash."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}

function PartnersLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-9 w-40 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="relative w-64">
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-7 gap-4">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-14" />
                <div className="h-4 bg-gray-200 rounded animate-pulse ml-auto w-14" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="grid grid-cols-7 items-center gap-4">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
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
