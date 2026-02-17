import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { websiteContentService } from "~/services/httpServices/websiteContentService";
import { toast } from "sonner";

export default function ContactSocialTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    website_contact_phone: "",
    website_contact_hours: "",
    website_social_twitter: "",
    website_social_facebook: "",
    website_social_instagram: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await websiteContentService.getSettings();
        const settings = res.data;
        setForm({
          website_contact_phone: settings.website_contact_phone || "",
          website_contact_hours: settings.website_contact_hours || "",
          website_social_twitter: settings.website_social_twitter || "",
          website_social_facebook: settings.website_social_facebook || "",
          website_social_instagram: settings.website_social_instagram || "",
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
      toast("Contact info saved!", {
        description: "Contact and social media settings were updated successfully.",
        duration: 3000,
      });
    } catch {
      toast("Failed to save.", {
        description: "An error occurred while saving the contact info.",
        duration: 3000,
      });
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading contact settings...</div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Contact & Social Media</h2>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={form.website_contact_phone}
              onChange={(e) => handleChange("website_contact_phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-hours">Business Hours</Label>
            <Input
              id="contact-hours"
              value={form.website_contact_hours}
              onChange={(e) => handleChange("website_contact_hours", e.target.value)}
              placeholder="Mon-Fri: 7AM - 10PM, Sat-Sun: 8AM - 11PM"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="social-twitter">Twitter URL</Label>
            <Input
              id="social-twitter"
              value={form.website_social_twitter}
              onChange={(e) => handleChange("website_social_twitter", e.target.value)}
              placeholder="https://twitter.com/yourpage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-facebook">Facebook URL</Label>
            <Input
              id="social-facebook"
              value={form.website_social_facebook}
              onChange={(e) => handleChange("website_social_facebook", e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social-instagram">Instagram URL</Label>
            <Input
              id="social-instagram"
              value={form.website_social_instagram}
              onChange={(e) => handleChange("website_social_instagram", e.target.value)}
              placeholder="https://instagram.com/yourpage"
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
