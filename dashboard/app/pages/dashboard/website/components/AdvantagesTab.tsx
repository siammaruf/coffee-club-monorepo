import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { websiteContentService } from "~/services/httpServices/websiteContentService";
import type { Advantage } from "~/services/httpServices/websiteContentService";
import { toast } from "sonner";
import AdvantageModal from "./AdvantageModal";

export default function AdvantagesTab() {
  const [items, setItems] = useState<Advantage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Advantage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await websiteContentService.getAdvantages();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = (item: Advantage) => {
    if (editItem) {
      setItems((prev) => prev.map((a) => (a.id === item.id ? item : a)));
      toast("Advantage updated!", {
        description: "The advantage was updated successfully.",
        duration: 3000,
      });
    } else {
      setItems((prev) => [...prev, item]);
      toast("Advantage created!", {
        description: "The advantage was added successfully.",
        duration: 3000,
      });
    }
    setShowModal(false);
    setEditItem(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await websiteContentService.deleteAdvantage(deleteId);
      setItems((prev) => prev.filter((a) => a.id !== deleteId));
      toast("Advantage deleted!", {
        description: "The advantage was removed successfully.",
        duration: 3000,
      });
    } catch {
      toast("Failed to delete advantage.", {
        description: "An error occurred while deleting.",
        duration: 3000,
      });
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const openEdit = (item: Advantage) => {
    setEditItem(item);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditItem(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Advantages</h2>
        <Button className="flex items-center gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Advantage
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advantages ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading advantages...</div>
          ) : (
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-5 font-medium text-sm">
                  <div className="text-left">Order</div>
                  <div className="text-left">Icon</div>
                  <div className="text-left">Title</div>
                  <div className="text-center">Active</div>
                  <div className="text-right">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {items.length > 0 ? (
                  [...items]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((item) => (
                      <div key={item.id} className="p-4 hover:bg-muted/50">
                        <div className="grid grid-cols-5 text-sm items-center">
                          <div className="text-left">{item.sort_order}</div>
                          <div className="text-left">
                            {item.icon ? (
                              <img
                                src={item.icon}
                                alt={item.title}
                                className="h-10 w-10 rounded border object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs">No icon</span>
                            )}
                          </div>
                          <div className="text-left font-medium truncate pr-2">{item.title}</div>
                          <div className="text-center">
                            <Badge
                              className={
                                item.is_active
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }
                            >
                              {item.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              onClick={() => openEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No advantages yet.</p>
                    <p className="text-sm mt-1">Create your first advantage to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AdvantageModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        onSave={handleSave}
        advantage={editItem}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Advantage?"
        description="Are you sure you want to delete this advantage? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
