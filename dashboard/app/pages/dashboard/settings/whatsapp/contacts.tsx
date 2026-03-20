import { useCallback, useEffect, useState } from 'react';
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { Select } from '~/components/ui/select';
import { toast } from 'sonner';
import { Link } from 'react-router';
import {
  Users,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { whatsappService } from '~/services/httpServices/whatsappService';

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  type: 'INDIVIDUAL' | 'GROUP';
  is_active: boolean;
  receive_order_notifications: boolean;
  receive_daily_reports: boolean;
}

interface ContactsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ContactFormData {
  name: string;
  phone: string;
  type: 'INDIVIDUAL' | 'GROUP';
  is_active: boolean;
  receive_order_notifications: boolean;
  receive_daily_reports: boolean;
}

const defaultFormData: ContactFormData = {
  name: '',
  phone: '',
  type: 'INDIVIDUAL',
  is_active: true,
  receive_order_notifications: true,
  receive_daily_reports: false,
};

export default function WhatsAppContactsPage() {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [meta, setMeta] = useState<ContactsMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<WhatsAppContact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchContacts = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = (await whatsappService.getContacts({ page: currentPage, limit: 20 })) as any;
      const data = res?.data || res;
      setContacts(data?.data || []);
      if (data?.meta) {
        setMeta(data.meta);
      }
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts(page);
  }, [page, fetchContacts]);

  const openAddModal = useCallback(() => {
    setEditingContact(null);
    setFormData(defaultFormData);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((contact: WhatsAppContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      type: contact.type,
      is_active: contact.is_active,
      receive_order_notifications: contact.receive_order_notifications,
      receive_daily_reports: contact.receive_daily_reports,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingContact(null);
    setFormData(defaultFormData);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setSaving(true);
    try {
      if (editingContact) {
        await whatsappService.updateContact(editingContact.id, formData);
        toast.success('Contact updated successfully');
      } else {
        await whatsappService.createContact(formData);
        toast.success('Contact created successfully');
      }
      closeModal();
      fetchContacts(page);
    } catch {
      toast.error(
        editingContact ? 'Failed to update contact' : 'Failed to create contact',
      );
    } finally {
      setSaving(false);
    }
  }, [formData, editingContact, closeModal, fetchContacts, page]);

  const handleDelete = useCallback(
    async (contact: WhatsAppContact) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${contact.name}"?`,
      );
      if (!confirmed) return;

      setDeleting(contact.id);
      try {
        await whatsappService.deleteContact(contact.id);
        toast.success('Contact deleted successfully');
        fetchContacts(page);
      } catch {
        toast.error('Failed to delete contact');
      } finally {
        setDeleting(null);
      }
    },
    [fetchContacts, page],
  );

  const handleFormChange = useCallback(
    (field: keyof ContactFormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  return (
    <PermissionGuard permission="whatsapp.view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">WhatsApp Contacts</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/dashboard/settings/whatsapp">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contacts ({meta.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="mb-3 h-10 w-10" />
                <p className="text-sm">No contacts found</p>
                <Button variant="outline" className="mt-4" onClick={openAddModal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first contact
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">
                          Phone
                        </th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">
                          Type
                        </th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">
                          Order Notifications
                        </th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">
                          Daily Reports
                        </th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">
                          Active
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr
                          key={contact.id}
                          className="border-b last:border-b-0"
                        >
                          <td className="py-3 pr-4 font-medium">
                            {contact.name}
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs">
                            {contact.phone}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="secondary"
                              className={
                                contact.type === 'GROUP'
                                  ? 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              }
                            >
                              {contact.type === 'GROUP' ? 'Group' : 'Individual'}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="secondary"
                              className={
                                contact.receive_order_notifications
                                  ? 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'border-transparent bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-500'
                              }
                            >
                              {contact.receive_order_notifications ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="secondary"
                              className={
                                contact.receive_daily_reports
                                  ? 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'border-transparent bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-500'
                              }
                            >
                              {contact.receive_daily_reports ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant="secondary"
                              className={
                                contact.is_active
                                  ? 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }
                            >
                              {contact.is_active ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(contact)}
                                title="Edit contact"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(contact)}
                                disabled={deleting === contact.id}
                                title="Delete contact"
                                className="text-destructive hover:text-destructive"
                              >
                                {deleting === contact.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(meta.page - 1) * meta.limit + 1}-
                      {Math.min(meta.page * meta.limit, meta.total)} of{' '}
                      {meta.total}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {meta.page} of {meta.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(meta.totalPages, p + 1))
                        }
                        disabled={page >= meta.totalPages}
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Contact Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeModal}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeModal();
            }}
          />
          <div className="relative z-50 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">
                {editingContact ? 'Edit Contact' : 'Add Contact'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="Contact name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone *</Label>
                <Input
                  id="contact-phone"
                  placeholder="+8801XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-type">Type</Label>
                <Select
                  id="contact-type"
                  value={formData.type}
                  onChange={(e) =>
                    handleFormChange(
                      'type',
                      e.target.value as 'INDIVIDUAL' | 'GROUP',
                    )
                  }
                >
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="GROUP">Group</option>
                </Select>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="contact-active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleFormChange('is_active', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="contact-active" className="cursor-pointer">
                    Active
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="contact-order-notifications"
                    type="checkbox"
                    checked={formData.receive_order_notifications}
                    onChange={(e) =>
                      handleFormChange(
                        'receive_order_notifications',
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="contact-order-notifications"
                    className="cursor-pointer"
                  >
                    Receive Order Notifications
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="contact-daily-reports"
                    type="checkbox"
                    checked={formData.receive_daily_reports}
                    onChange={(e) =>
                      handleFormChange(
                        'receive_daily_reports',
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="contact-daily-reports"
                    className="cursor-pointer"
                  >
                    Receive Daily Reports
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {saving
                  ? editingContact
                    ? 'Updating...'
                    : 'Creating...'
                  : editingContact
                    ? 'Update Contact'
                    : 'Create Contact'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PermissionGuard>
  );
}
