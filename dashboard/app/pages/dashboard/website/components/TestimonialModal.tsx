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
import { Checkbox } from "~/components/ui/checkbox";
import { Upload, Loader2 } from "lucide-react";
import { websiteContentService } from "~/services/httpServices/websiteContentService";
import type { Testimonial } from "~/services/httpServices/websiteContentService";

interface TestimonialModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (testimonial: Testimonial) => void;
  testimonial?: Testimonial | null;
}

export default function TestimonialModal({ open, onClose, onSave, testimonial }: TestimonialModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    position: "",
    quote: "",
    image: "",
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (testimonial) {
      setForm({
        name: testimonial.name || "",
        position: testimonial.position || "",
        quote: testimonial.quote || "",
        image: testimonial.image || "",
        sort_order: testimonial.sort_order ?? 0,
        is_active: testimonial.is_active ?? true,
      });
    } else {
      setForm({
        name: "",
        position: "",
        quote: "",
        image: "",
        sort_order: 0,
        is_active: true,
      });
    }
  }, [testimonial, open]);

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
      // Upload failed
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (testimonial?.id) {
        result = await websiteContentService.updateTestimonial(testimonial.id, form);
      } else {
        result = await websiteContentService.createTestimonial(form);
      }
      onSave(result.data);
    } catch {
      // Error handled by caller
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{testimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          <DialogDescription>
            {testimonial ? "Update the testimonial details below." : "Fill in the details to create a new testimonial."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="test-name">Name *</Label>
            <Input
              id="test-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter person's name"
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="test-position">Position</Label>
            <Input
              id="test-position"
              value={form.position}
              onChange={(e) => handleChange("position", e.target.value)}
              placeholder="e.g. CEO, Regular Customer"
            />
          </div>

          {/* Quote */}
          <div className="space-y-2">
            <Label htmlFor="test-quote">Quote *</Label>
            <Textarea
              id="test-quote"
              value={form.quote}
              onChange={(e) => handleChange("quote", e.target.value)}
              placeholder="Enter testimonial quote"
              rows={4}
              required
            />
          </div>

          {/* Image URL + Upload */}
          <div className="space-y-2">
            <Label htmlFor="test-image">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="test-image"
                value={form.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
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
                  className="h-12 w-12 rounded-full border object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="test-sort-order">Sort Order</Label>
            <Input
              id="test-sort-order"
              type="number"
              value={form.sort_order}
              onChange={(e) => handleChange("sort_order", parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="test-active"
              checked={form.is_active}
              onChange={(e) => handleChange("is_active", (e.target as HTMLInputElement).checked)}
            />
            <Label htmlFor="test-active">Active</Label>
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
              ) : testimonial ? "Update Testimonial" : "Add Testimonial"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
