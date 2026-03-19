import { useEffect, useState } from 'react';
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Wifi, Save, Loader2 } from 'lucide-react';
import { settingsService } from '~/services/httpServices/settingsService';
import { toast } from 'sonner';

export default function WifiSettingsPage() {
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWifiSettings = async () => {
      try {
        const res = await settingsService.getWifi() as any;
        const data = res?.data || res;
        setWifiName(data?.wifi_name || '');
        setWifiPassword(data?.wifi_password || '');
      } catch {
        toast.error('Failed to load WiFi settings');
      } finally {
        setLoading(false);
      }
    };
    fetchWifiSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        settingsService.update('wifi_name', wifiName),
        settingsService.update('wifi_password', wifiPassword),
      ]);
      toast.success('WiFi settings saved successfully');
    } catch {
      toast.error('Failed to save WiFi settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGuard permission="settings.roles_permissions">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Wifi className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">WiFi Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>WiFi Credentials</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure the WiFi name and password that will be printed on customer receipts and tokens.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="wifi-name">WiFi Name (SSID)</Label>
                  <Input
                    id="wifi-name"
                    placeholder="e.g. CoffeeClub"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wifi-password">WiFi Password</Label>
                  <Input
                    id="wifi-password"
                    type="text"
                    placeholder="e.g. 12345678"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
