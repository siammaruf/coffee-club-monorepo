import { useCallback, useEffect, useState } from 'react';
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { Select } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { toast } from 'sonner';
import { Link } from 'react-router';
import {
  Megaphone,
  Loader2,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { whatsappService } from '~/services/httpServices/whatsappService';

interface PromotionItem {
  id: string;
  title: string;
  message: string;
  target: string;
  status: string;
  total_recipients: number;
  success_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
}

interface PromotionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PromotionForm {
  title: string;
  message: string;
  target: string;
}

const defaultForm: PromotionForm = {
  title: '',
  message: '',
  target: 'ALL',
};

function getTargetBadge(target: string) {
  switch (target) {
    case 'ALL':
      return (
        <Badge className="border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          All
        </Badge>
      );
    case 'REGULAR':
      return (
        <Badge className="border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
          Regular
        </Badge>
      );
    case 'MEMBER':
      return (
        <Badge className="border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          Member
        </Badge>
      );
    default:
      return <Badge variant="secondary">{target || 'Unknown'}</Badge>;
  }
}

function getPromotionStatusBadge(status: string) {
  switch (status) {
    case 'DRAFT':
      return (
        <Badge className="border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Draft
        </Badge>
      );
    case 'SENT':
      return (
        <Badge className="border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Sent
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '\u2014';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function WhatsAppPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [meta, setMeta] = useState<PromotionMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionItem | null>(null);
  const [form, setForm] = useState<PromotionForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  // Send confirmation state
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sendingPromotion, setSendingPromotion] = useState<PromotionItem | null>(null);
  const [recipientCount, setRecipientCount] = useState<number>(0);
  const [loadingRecipientCount, setLoadingRecipientCount] = useState(false);
  const [sending, setSending] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPromotions = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      try {
        const res = (await whatsappService.getPromotions({
          page: currentPage,
          limit: 20,
        })) as any;
        const result = res?.data || res;

        if (Array.isArray(result?.data)) {
          setPromotions(result.data);
          setMeta({
            total: result.meta?.total ?? 0,
            page: result.meta?.page ?? currentPage,
            limit: result.meta?.limit ?? 20,
            totalPages: result.meta?.totalPages ?? 0,
          });
        } else if (Array.isArray(result)) {
          setPromotions(result);
          setMeta({
            total: result.length,
            page: 1,
            limit: 20,
            totalPages: 1,
          });
        } else {
          setPromotions([]);
        }
      } catch {
        toast.error('Failed to load promotions');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPromotions(1);
  }, [fetchPromotions]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchPromotions(newPage);
    },
    [fetchPromotions],
  );

  // Create / Edit modal
  const openCreateModal = useCallback(() => {
    setEditingPromotion(null);
    setForm(defaultForm);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((promo: PromotionItem) => {
    setEditingPromotion(promo);
    setForm({
      title: promo.title,
      message: promo.message,
      target: promo.target,
    });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingPromotion(null);
    setForm(defaultForm);
  }, []);

  const handleFormChange = useCallback(
    (field: keyof PromotionForm, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.message.trim()) {
      toast.error('Message is required');
      return;
    }

    setSaving(true);
    try {
      if (editingPromotion) {
        await whatsappService.updatePromotion(editingPromotion.id, form);
        toast.success('Promotion updated successfully');
      } else {
        await whatsappService.createPromotion(form);
        toast.success('Promotion created successfully');
      }
      closeModal();
      fetchPromotions(page);
    } catch {
      toast.error(
        editingPromotion
          ? 'Failed to update promotion'
          : 'Failed to create promotion',
      );
    } finally {
      setSaving(false);
    }
  }, [form, editingPromotion, closeModal, fetchPromotions, page]);

  // Send promotion
  const openSendConfirm = useCallback(async (promo: PromotionItem) => {
    setSendingPromotion(promo);
    setLoadingRecipientCount(true);
    setSendConfirmOpen(true);

    try {
      const res = (await whatsappService.getRecipientCount(promo.target)) as any;
      const data = res?.data || res;
      setRecipientCount(data?.count ?? data ?? 0);
    } catch {
      toast.error('Failed to fetch recipient count');
      setRecipientCount(0);
    } finally {
      setLoadingRecipientCount(false);
    }
  }, []);

  const closeSendConfirm = useCallback(() => {
    setSendConfirmOpen(false);
    setSendingPromotion(null);
    setRecipientCount(0);
  }, []);

  const handleSend = useCallback(async () => {
    if (!sendingPromotion) return;

    setSending(true);
    try {
      await whatsappService.sendPromotion(sendingPromotion.id);
      toast.success('Promotion sent successfully');
      closeSendConfirm();
      fetchPromotions(page);
    } catch {
      toast.error('Failed to send promotion');
    } finally {
      setSending(false);
    }
  }, [sendingPromotion, closeSendConfirm, fetchPromotions, page]);

  // Delete promotion
  const handleDelete = useCallback(
    async (promo: PromotionItem) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${promo.title}"?`,
      );
      if (!confirmed) return;

      setDeleting(promo.id);
      try {
        await whatsappService.deletePromotion(promo.id);
        toast.success('Promotion deleted successfully');
        fetchPromotions(page);
      } catch {
        toast.error('Failed to delete promotion');
      } finally {
        setDeleting(null);
      }
    },
    [fetchPromotions, page],
  );

  return (
    <PermissionGuard permission="whatsapp.view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard/settings/whatsapp">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Megaphone className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Promotions</h1>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Create Promotion
          </Button>
        </div>

        {/* Promotions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Promotions</CardTitle>
              {meta.total > 0 && (
                <span className="text-sm text-muted-foreground">
                  Showing {(meta.page - 1) * meta.limit + 1}-
                  {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : promotions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Megaphone className="mb-3 h-10 w-10" />
                <p className="text-sm">No promotions found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={openCreateModal}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first promotion
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Recipients</TableHead>
                      <TableHead className="text-center">Success</TableHead>
                      <TableHead className="text-center">Failed</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-medium">
                          {promo.title}
                        </TableCell>
                        <TableCell>{getTargetBadge(promo.target)}</TableCell>
                        <TableCell>
                          {getPromotionStatusBadge(promo.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          {promo.total_recipients ?? 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 dark:text-green-400">
                            {promo.success_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-red-600 dark:text-red-400">
                            {promo.failed_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDate(promo.sent_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {promo.status === 'DRAFT' ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Edit"
                                  onClick={() => openEditModal(promo)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Send"
                                  onClick={() => openSendConfirm(promo)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete"
                                  onClick={() => handleDelete(promo)}
                                  disabled={deleting === promo.id}
                                >
                                  {deleting === promo.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  )}
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View"
                                onClick={() => openEditModal(promo)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {meta.page} of {meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
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

      {/* Create / Edit Promotion Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPromotion
                ? editingPromotion.status === 'SENT'
                  ? 'View Promotion'
                  : 'Edit Promotion'
                : 'Create Promotion'}
            </DialogTitle>
            <DialogDescription>
              {editingPromotion
                ? editingPromotion.status === 'SENT'
                  ? 'Viewing a sent promotion (read-only).'
                  : 'Update the promotion details below.'
                : 'Fill in the details to create a new promotion.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="promo-title">Title</Label>
              <Input
                id="promo-title"
                placeholder="Promotion title"
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                disabled={editingPromotion?.status === 'SENT'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-message">Message</Label>
              <Textarea
                id="promo-message"
                placeholder="Write your promotional message..."
                rows={5}
                value={form.message}
                onChange={(e) => handleFormChange('message', e.target.value)}
                disabled={editingPromotion?.status === 'SENT'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-target">Target</Label>
              <Select
                id="promo-target"
                value={form.target}
                onChange={(e) => handleFormChange('target', e.target.value)}
                disabled={editingPromotion?.status === 'SENT'}
              >
                <option value="ALL">All Contacts</option>
                <option value="REGULAR">Regular Customers</option>
                <option value="MEMBER">Members Only</option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              {editingPromotion?.status === 'SENT' ? 'Close' : 'Cancel'}
            </Button>
            {editingPromotion?.status !== 'SENT' && (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {saving
                  ? 'Saving...'
                  : editingPromotion
                    ? 'Update'
                    : 'Create'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Promotion</DialogTitle>
            <DialogDescription>
              {sendingPromotion
                ? `Are you sure you want to send "${sendingPromotion.title}"?`
                : 'Confirm sending this promotion.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingRecipientCount ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching recipient count...
              </div>
            ) : (
              <p className="text-sm">
                This promotion will be sent to{' '}
                <span className="font-semibold">{recipientCount}</span>{' '}
                recipient{recipientCount !== 1 ? 's' : ''}.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeSendConfirm}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || loadingRecipientCount}
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {sending ? 'Sending...' : 'Send Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGuard>
  );
}
