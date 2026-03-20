import { useCallback, useEffect, useState } from 'react';
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { Textarea } from '~/components/ui/textarea';
import { toast } from 'sonner';
import { Link } from 'react-router';
import {
  MessageCircle,
  Loader2,
  Save,
  Plug,
  PlugZap,
  Send,
  Users,
  Mail,
  Megaphone,
  SendHorizontal,
} from 'lucide-react';
import { whatsappService } from '~/services/httpServices/whatsappService';
import { useWhatsAppSocket } from '~/hooks/useWhatsAppSocket';

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  type: 'INDIVIDUAL' | 'GROUP';
  is_active: boolean;
}

interface WhatsAppConfig {
  enabled: boolean;
  order_notifications_enabled: boolean;
  daily_report_enabled: boolean;
  otp_via_whatsapp: boolean;
  daily_report_time: string;
  order_notification_template: string;
  daily_report_template: string;
}

const defaultConfig: WhatsAppConfig = {
  enabled: false,
  order_notifications_enabled: false,
  daily_report_enabled: false,
  otp_via_whatsapp: false,
  daily_report_time: '08:00',
  order_notification_template: '',
  daily_report_template: '',
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'CONNECTED':
      return (
        <Badge className="border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Connected
        </Badge>
      );
    case 'SCANNING_QR':
      return (
        <Badge className="border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Scanning QR
        </Badge>
      );
    case 'CONNECTING':
      return (
        <Badge className="border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Connecting
        </Badge>
      );
    case 'DISCONNECTED':
      return (
        <Badge className="border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Disconnected
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          {status || 'Unknown'}
        </Badge>
      );
  }
}

export default function WhatsAppSettingsPage() {
  const { status, qrCode, error, isConnected, socketConnected } = useWhatsAppSocket();

  const [config, setConfig] = useState<WhatsAppConfig>(defaultConfig);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);

  // Test send message state
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = (await whatsappService.getConfig()) as any;
        const data = res?.data || res;
        if (data) {
          setConfig({
            enabled: data.enabled ?? false,
            order_notifications_enabled: data.order_notifications_enabled ?? false,
            daily_report_enabled: data.daily_report_enabled ?? false,
            otp_via_whatsapp: data.otp_via_whatsapp ?? false,
            daily_report_time: data.daily_report_time ?? '08:00',
            order_notification_template: data.order_notification_template ?? '',
            daily_report_template: data.daily_report_template ?? '',
          });
        }
      } catch {
        toast.error('Failed to load WhatsApp configuration');
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = (await whatsappService.getContacts({ limit: 100 })) as any;
        const data = res?.data || res;
        const list: WhatsAppContact[] = data?.data || [];
        setContacts(list.filter((c) => c.is_active));
      } catch {
        // silent
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, []);

  const handleToggleRecipient = useCallback((phone: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone],
    );
  }, []);

  const handleSelectAllRecipients = useCallback(() => {
    setSelectedRecipients((prev) =>
      prev.length === contacts.length ? [] : contacts.map((c) => c.phone),
    );
  }, [contacts]);

  const handleSendTestMessage = useCallback(async () => {
    if (selectedRecipients.length === 0) {
      toast.error('Select at least one recipient');
      return;
    }
    if (!testMessage.trim()) {
      toast.error('Enter a message');
      return;
    }
    setSendingTest(true);
    try {
      const res = (await whatsappService.sendMessage({
        recipients: selectedRecipients,
        message: testMessage.trim(),
        message_type: 'test',
      })) as any;
      const result = res?.data || res;
      toast.success(
        `Sent: ${result.successful || 0} successful, ${result.failed || 0} failed`,
      );
      setTestMessage('');
      setSelectedRecipients([]);
    } catch {
      toast.error('Failed to send test message');
    } finally {
      setSendingTest(false);
    }
  }, [selectedRecipients, testMessage]);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      await whatsappService.connect();
      toast.success('Connection initiated. Please scan the QR code.');
    } catch {
      toast.error('Failed to initiate WhatsApp connection');
    } finally {
      setConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true);
    try {
      await whatsappService.disconnect();
      toast.success('WhatsApp disconnected');
    } catch {
      toast.error('Failed to disconnect WhatsApp');
    } finally {
      setDisconnecting(false);
    }
  }, []);

  const handleSaveConfig = useCallback(async () => {
    setSavingConfig(true);
    try {
      await whatsappService.updateConfig(config);
      toast.success('Configuration saved successfully');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  }, [config]);

  const handleSendDailyReport = useCallback(async () => {
    setSendingReport(true);
    try {
      await whatsappService.sendDailyReport();
      toast.success('Daily report sent successfully');
    } catch {
      toast.error('Failed to send daily report');
    } finally {
      setSendingReport(false);
    }
  }, []);

  const handleToggle = useCallback((field: keyof WhatsAppConfig) => {
    setConfig((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleChange = useCallback(
    (field: keyof WhatsAppConfig, value: string) => {
      setConfig((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  return (
    <PermissionGuard permission="whatsapp.view">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">WhatsApp</h1>
        </div>

        {/* Connection Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>WhatsApp Connection</CardTitle>
              {getStatusBadge(status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {error}
                </p>
              </div>
            )}

            {status === 'SCANNING_QR' && qrCode && (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your WhatsApp app to connect
                </p>
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="h-64 w-64 rounded-lg border"
                />
              </div>
            )}

            {status === 'CONNECTING' && (
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Connecting to WhatsApp...
                </span>
              </div>
            )}

            <div className="flex gap-3">
              {!isConnected && status !== 'CONNECTING' && status !== 'SCANNING_QR' && (
                <Button onClick={handleConnect} disabled={connecting}>
                  {connecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plug className="mr-2 h-4 w-4" />
                  )}
                  {connecting ? 'Connecting...' : 'Connect'}
                </Button>
              )}
              {isConnected && (
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlugZap className="mr-2 h-4 w-4" />
                  )}
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {loadingConfig ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Toggle fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="toggle-enabled" className="cursor-pointer">
                      Enable WhatsApp
                    </Label>
                    <button
                      id="toggle-enabled"
                      type="button"
                      role="switch"
                      aria-checked={config.enabled}
                      onClick={() => handleToggle('enabled')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        config.enabled ? 'bg-primary' : 'bg-input'
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          config.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="toggle-order-notifications"
                      className="cursor-pointer"
                    >
                      Order Notifications
                    </Label>
                    <button
                      id="toggle-order-notifications"
                      type="button"
                      role="switch"
                      aria-checked={config.order_notifications_enabled}
                      onClick={() => handleToggle('order_notifications_enabled')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        config.order_notifications_enabled ? 'bg-primary' : 'bg-input'
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          config.order_notifications_enabled
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="toggle-daily-report"
                      className="cursor-pointer"
                    >
                      Daily Sales Report
                    </Label>
                    <button
                      id="toggle-daily-report"
                      type="button"
                      role="switch"
                      aria-checked={config.daily_report_enabled}
                      onClick={() => handleToggle('daily_report_enabled')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        config.daily_report_enabled ? 'bg-primary' : 'bg-input'
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          config.daily_report_enabled
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="toggle-otp" className="cursor-pointer">
                      OTP via WhatsApp
                    </Label>
                    <button
                      id="toggle-otp"
                      type="button"
                      role="switch"
                      aria-checked={config.otp_via_whatsapp}
                      onClick={() => handleToggle('otp_via_whatsapp')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        config.otp_via_whatsapp ? 'bg-primary' : 'bg-input'
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          config.otp_via_whatsapp
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Time input */}
                <div className="space-y-2">
                  <Label htmlFor="daily-report-time">Daily Report Time</Label>
                  <Input
                    id="daily-report-time"
                    type="time"
                    value={config.daily_report_time}
                    onChange={(e) =>
                      handleChange('daily_report_time', e.target.value)
                    }
                    className="w-40"
                  />
                </div>

                {/* Template textareas */}
                <div className="space-y-2">
                  <Label htmlFor="order-notification-template">
                    Order Notification Template
                  </Label>
                  <Textarea
                    id="order-notification-template"
                    placeholder="Enter order notification message template..."
                    rows={4}
                    value={config.order_notification_template}
                    onChange={(e) =>
                      handleChange('order_notification_template', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily-report-template">
                    Daily Report Template
                  </Label>
                  <Textarea
                    id="daily-report-template"
                    placeholder="Enter daily report message template..."
                    rows={4}
                    value={config.daily_report_template}
                    onChange={(e) =>
                      handleChange('daily_report_template', e.target.value)
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveConfig} disabled={savingConfig}>
                    {savingConfig ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {savingConfig ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Send Test Message Card */}
        <Card>
          <CardHeader>
            <CardTitle>Send Test Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected && (
              <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  WhatsApp must be connected to send messages.
                </p>
              </div>
            )}

            {/* Recipients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recipients</Label>
                {contacts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllRecipients}
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedRecipients.length === contacts.length
                      ? 'Clear All'
                      : 'Select All'}
                  </button>
                )}
              </div>
              {loadingContacts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active contacts.{' '}
                  <Link
                    to="/dashboard/settings/whatsapp/contacts"
                    className="text-primary hover:underline"
                  >
                    Add contacts
                  </Link>
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-md border p-2 space-y-1">
                  {contacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(contact.phone)}
                        onChange={() => handleToggleRecipient(contact.phone)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">{contact.name}</span>
                      <Badge
                        variant="secondary"
                        className={`ml-auto text-[10px] ${
                          contact.type === 'GROUP'
                            ? 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {contact.type === 'GROUP' ? 'Group' : 'Individual'}
                      </Badge>
                    </label>
                  ))}
                </div>
              )}
              {selectedRecipients.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedRecipients.length} recipient
                  {selectedRecipients.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="test-message">Message</Label>
              <Textarea
                id="test-message"
                placeholder="Type your test message..."
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSendTestMessage}
                disabled={
                  !isConnected ||
                  selectedRecipients.length === 0 ||
                  !testMessage.trim() ||
                  sendingTest
                }
              >
                {sendingTest ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="mr-2 h-4 w-4" />
                )}
                {sendingTest ? 'Sending...' : 'Send Test Message'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSendDailyReport}
              disabled={sendingReport}
            >
              {sendingReport ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {sendingReport ? 'Sending...' : 'Send Daily Report Now'}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link to="/dashboard/settings/whatsapp/contacts">
                <Users className="mr-2 h-4 w-4" />
                Manage Contacts
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link to="/dashboard/settings/whatsapp/messages">
                <Mail className="mr-2 h-4 w-4" />
                Message Log
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link to="/dashboard/settings/whatsapp/promotions">
                <Megaphone className="mr-2 h-4 w-4" />
                Promotions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
