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
import type { Advantage } from "~/services/httpServices/websiteContentService";

interface AdvantageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (advantage: Advantage) => void;
  advantage?: Advantage | null;
}

export default function AdvantageModal({ open, onClose, onSave, advantage }: AdvantageModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    icon: "",
    title: "",
    description: "",
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (advantage) {
      setForm({
        icon: advantage.icon || "",
        title: advantage.title || "",
        description: advantage.description || "",
        sort_order: advantage.sort_order ?? 0,
        is_active: advantage.is_active ?? true,
      });
    } else {
      setForm({
        icon: "",
        title: "",
        description: "",
        sort_order: 0,
        is_active: true,
      });
    }
  }, [advantage, open]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await websiteContentService.uploadImage(file);
      handleChange("icon", res.data.url);
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
      if (advantage?.id) {
        result = await websiteContentService.updateAdvantage(advantage.id, form);
      } else {
        result = await websiteContentService.createAdvantage(form);
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
          <DialogTitle>{advantage ? "Edit Advantage" : "Add Advantage"}</DialogTitle>
          <DialogDescription>
            {advantage ? "Update the advantage details below." : "Fill in the details to create a new advantage."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon / Image URL + Upload */}
          <div className="space-y-2">
            <Label htmlFor="adv-icon">Icon (Image URL)</Label>
            <div className="flex gap-2">
              <Input
                id="adv-icon"
                value={form.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="https://example.com/icon.svg"
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
            {form.icon && (
              <div className="mt-2">
                <img
                  src={form.icon}
                  alt="Icon preview"
                  className="h-12 w-12 rounded border object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="adv-title">Title *</Label>
            <Input
              id="adv-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter advantage title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="adv-description">Description</Label>
            <Textarea
              id="adv-description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label htmlFor="adv-sort-order">Sort Order</Label>
            <Input
              id="adv-sort-order"
              type="number"
              value={form.sort_order}
              onChange={(e) => handleChange("sort_order", parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="adv-active"
              checked={form.is_active}
              onChange={(e) => handleChange("is_active", (e.target as HTMLInputElement).checked)}
            />
            <Label htmlFor="adv-active">Active</Label>
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
              ) : advantage ? "Update Advantage" : "Add Advantage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
