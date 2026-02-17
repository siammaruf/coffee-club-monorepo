import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { websiteContentService } from "~/services/httpServices/websiteContentService";
import { toast } from "sonner";

export default function NewsletterTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    website_newsletter_title: "",
    website_newsletter_subtitle: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await websiteContentService.getSettings();
        const settings = res.data;
        setForm({
          website_newsletter_title: settings.website_newsletter_title || "",
          website_newsletter_subtitle: settings.website_newsletter_subtitle || "",
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
      toast("Newsletter settings saved!", {
        description: "The newsletter content was updated successfully.",
        duration: 3000,
      });
    } catch {
      toast("Failed to save.", {
        description: "An error occurred while saving the newsletter settings.",
        duration: 3000,
      });
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading newsletter settings...</div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Newsletter Section</h2>

      <Card>
        <CardHeader>
          <CardTitle>Newsletter Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsletter-title">Title</Label>
            <Input
              id="newsletter-title"
              value={form.website_newsletter_title}
              onChange={(e) => handleChange("website_newsletter_title", e.target.value)}
              placeholder="Subscribe to our newsletter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newsletter-subtitle">Subtitle</Label>
            <Input
              id="newsletter-subtitle"
              value={form.website_newsletter_subtitle}
              onChange={(e) => handleChange("website_newsletter_subtitle", e.target.value)}
              placeholder="Get the latest updates and offers (optional)"
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
