import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import { websiteContentService } from "~/services/httpServices/websiteContentService";
import type { HeroSlide } from "~/services/httpServices/websiteContentService";
import { toast } from "sonner";
import HeroSlideModal from "./HeroSlideModal";

export default function HeroSlidesTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSlide, setEditSlide] = useState<HeroSlide | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const res = await websiteContentService.getHeroSlides();
      setSlides(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSlides([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleSave = (slide: HeroSlide) => {
    if (editSlide) {
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? slide : s)));
      toast("Slide updated!", {
        description: "The hero slide was updated successfully.",
        duration: 3000,
      });
    } else {
      setSlides((prev) => [...prev, slide]);
      toast("Slide created!", {
        description: "The hero slide was added successfully.",
        duration: 3000,
      });
    }
    setShowModal(false);
    setEditSlide(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await websiteContentService.deleteHeroSlide(deleteId);
      setSlides((prev) => prev.filter((s) => s.id !== deleteId));
      toast("Slide deleted!", {
        description: "The hero slide was removed successfully.",
        duration: 3000,
      });
    } catch {
      toast("Failed to delete slide.", {
        description: "An error occurred while deleting the slide.",
        duration: 3000,
      });
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditSlide(slide);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditSlide(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Hero Slides</h2>
        <Button className="flex items-center gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Slide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slides ({slides.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading slides...</div>
          ) : (
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <div className="grid grid-cols-6 font-medium text-sm">
                  <div className="text-left">Order</div>
                  <div className="text-left">Image</div>
                  <div className="text-left">Title</div>
                  <div className="text-center">Type</div>
                  <div className="text-center">Active</div>
                  <div className="text-right">Actions</div>
                </div>
              </div>
              <div className="divide-y">
                {slides.length > 0 ? (
                  [...slides]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((slide) => (
                      <div key={slide.id} className="p-4 hover:bg-muted/50">
                        <div className="grid grid-cols-6 text-sm items-center">
                          <div className="text-left">{slide.sort_order}</div>
                          <div className="text-left">
                            {slide.image ? (
                              <img
                                src={slide.image}
                                alt={slide.title}
                                className="h-10 w-16 rounded border object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs">No image</span>
                            )}
                          </div>
                          <div className="text-left font-medium truncate pr-2">{slide.title}</div>
                          <div className="text-center">
                            <Badge variant="outline">{slide.type}</Badge>
                          </div>
                          <div className="text-center">
                            <Badge
                              className={
                                slide.is_active
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }
                            >
                              {slide.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              onClick={() => openEdit(slide)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              onClick={() => setDeleteId(slide.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No hero slides yet.</p>
                    <p className="text-sm mt-1">Create your first slide to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <HeroSlideModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditSlide(null); }}
        onSave={handleSave}
        slide={editSlide}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Hero Slide?"
        description="Are you sure you want to delete this hero slide? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
