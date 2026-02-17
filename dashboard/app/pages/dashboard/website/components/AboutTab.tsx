import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { websiteContentService } from "~/services/httpServices/websiteContentService";
import { toast } from "sonner";

export default function AboutTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    website_about_title: "",
    website_about_subtitle: "",
    website_about_paragraph_1: "",
    website_about_paragraph_2: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await websiteContentService.getSettings();
        const settings = res.data;
        setForm({
          website_about_title: settings.website_about_title || "",
          website_about_subtitle: settings.website_about_subtitle || "",
          website_about_paragraph_1: settings.website_about_paragraph_1 || "",
          website_about_paragraph_2: settings.website_about_paragraph_2 || "",
        });
      } catch {
        // Settings not available yet
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await websiteContentService.updateSettings(form);
      toast("About section saved!", {
        description: "The about section content was updated successfully.",
        duration: 3000,
      });
    } catch {
      toast("Failed to save.", {
        description: "An error occurred while saving the about section.",
        duration: 3000,
      });
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading about settings...</div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">About Section</h2>

      <Card>
        <CardHeader>
          <CardTitle>About Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="about-title">Title</Label>
            <Input
              id="about-title"
              value={form.website_about_title}
              onChange={(e) => handleChange("website_about_title", e.target.value)}
              placeholder="About section title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about-subtitle">Subtitle</Label>
            <Input
              id="about-subtitle"
              value={form.website_about_subtitle}
              onChange={(e) => handleChange("website_about_subtitle", e.target.value)}
              placeholder="About section subtitle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about-p1">Paragraph 1</Label>
            <Textarea
              id="about-p1"
              value={form.website_about_paragraph_1}
              onChange={(e) => handleChange("website_about_paragraph_1", e.target.value)}
              placeholder="First paragraph of the about section"
              rows={5}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about-p2">Paragraph 2</Label>
            <Textarea
              id="about-p2"
              value={form.website_about_paragraph_2}
              onChange={(e) => handleChange("website_about_paragraph_2", e.target.value)}
              placeholder="Second paragraph of the about section"
              rows={5}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
