import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Upload, Loader2 } from "lucide-react";
import { websiteContentService } from "~/services/httpServices/websiteContentService";
import type { HeroSlide } from "~/services/httpServices/websiteContentService";

interface HeroSlideModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (slide: HeroSlide) => void;
  slide?: HeroSlide | null;
}

export default function HeroSlideModal({ open, onClose, onSave, slide }: HeroSlideModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    type: "centered" as HeroSlide["type"],
    title: "",
    subtitle: "",
    heading: "",
    description: "",
    image: "",
    show_cta: true,
    background_image: false,
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (slide) {
      setForm({
        type: slide.type || "centered",
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        heading: slide.heading || "",
        description: slide.description || "",
        image: slide.image || "",
        show_cta: slide.show_cta ?? true,
        background_image: slide.background_image ?? false,
        sort_order: slide.sort_order ?? 0,
        is_active: slide.is_active ?? true,
      });
    } else {
      setForm({
        type: "centered",
        title: "",
        subtitle: "",
        heading: "",
        description: "",
        image: "",
        show_cta: true,
        background_image: false,
        sort_order: 0,
        is_active: true,
      });
    }
  }, [slide, open]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await websiteContentService.uploadImage(file);
      handleChange("image", res.data.url);
    } catch {
      // Upload failed silently; user can still type URL manually
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (slide?.id) {
        result = await websiteContentService.updateHeroSlide(slide.id, form);
      } else {
        result = await websiteContentService.createHeroSlide(form);
      }
      onSave(result.data);
    } catch {
      // Error handled by caller via toast if needed
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{slide ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
          <DialogDescription>
            {slide ? "Update the hero slide details below." : "Fill in the details to create a new hero slide."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="slide-type">Type</Label>
            <Select
              id="slide-type"
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="centered">Centered</option>
              <option value="side-text">Side Text</option>
              <option value="bg-image">Background Image</option>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="slide-title">Title *</Label>
            <Input
              id="slide-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter slide title"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="slide-subtitle">Subtitle</Label>
            <Input
              id="slide-subtitle"
              value={form.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              placeholder="Enter subtitle (optional)"
            />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <Label htmlFor="slide-heading">Heading</Label>
            <Input
              id="slide-heading"
              value={form.heading}
              onChange={(e) => handleChange("heading", e.target.value)}
              placeholder="Enter heading (optional)"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="slide-description">Description</Label>
            <Textarea
              id="slide-description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          {/* Image URL + Upload */}
          <div className="space-y-2">
            <Label htmlFor="slide-image">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="slide-image"
                value={form.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="shrink-0"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {form.image && (
              <div className="mt-2">
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-20 w-auto rounded border object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Checkboxes row */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="slide-show-cta"
                checked={form.show_cta}
                onChange={(e) => handleChange("show_cta", (e.target as HTMLInputElement).checked)}
              />
              <Label htmlFor="slide-show-cta">Show CTA</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="slide-bg-image"
                checked={form.background_image}
                onChange={(e) => handleChange("background_image", (e.target as HTMLInputElement).checked)}
              />
              <Label htmlFor="slide-bg-image">Background Image</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="slide-active"
                checked={form.is_active}
                onChange={(e) => handleChange("is_active", (e.target as HTMLInputElement).checked)}
              />
              <Label htmlFor="slide-active">Active</Label>
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="slide-sort-order">Sort Order</Label>
            <Input
              id="slide-sort-order"
              type="number"
              value={form.sort_order}
              onChange={(e) => handleChange("sort_order", parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : slide ? "Update Slide" : "Add Slide"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
