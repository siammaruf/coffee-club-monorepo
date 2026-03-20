import { useCallback, useEffect, useState } from 'react';
import { PermissionGuard } from '~/hooks/auth/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Select } from '~/components/ui/select';
import { Label } from '~/components/ui/label';
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
  MessageSquare,
  Loader2,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { whatsappService } from '~/services/httpServices/whatsappService';

interface MessageItem {
  id: string;
  recipient: string;
  recipient_name: string;
  message: string;
  message_type: string;
  status: string;
  error?: string;
  created_at: string;
}

interface MessageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'SENT':
      return (
        <Badge className="border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Sent
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge className="border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Failed
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge className="border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Pending
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'order_notification':
      return (
        <Badge className="border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Order
        </Badge>
      );
    case 'daily_report':
      return (
        <Badge className="border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          Report
        </Badge>
      );
    case 'custom':
      return (
        <Badge className="border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
          Custom
        </Badge>
      );
    case 'promotion':
      return (
        <Badge className="border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          Promotion
        </Badge>
      );
    case 'otp':
      return (
        <Badge className="border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
          OTP
        </Badge>
      );
    default:
      return <Badge variant="secondary">{type || 'Unknown'}</Badge>;
  }
}

function formatDate(dateStr: string) {
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

function truncateMessage(message: string, maxLength = 50) {
  if (!message) return '';
  return message.length > maxLength
    ? message.substring(0, maxLength) + '...'
    : message;
}

export default function WhatsAppMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [meta, setMeta] = useState<MessageMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchMessages = useCallback(
    async (currentPage: number, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const params: Record<string, unknown> = {
          page: currentPage,
          limit: 20,
        };
        if (statusFilter) params.status = statusFilter;
        if (typeFilter) params.message_type = typeFilter;

        const res = (await whatsappService.getMessages(params)) as any;
        const result = res?.data || res;

        if (Array.isArray(result?.data)) {
          setMessages(result.data);
          setMeta({
            total: result.meta?.total ?? 0,
            page: result.meta?.page ?? currentPage,
            limit: result.meta?.limit ?? 20,
            totalPages: result.meta?.totalPages ?? 0,
          });
        } else if (Array.isArray(result)) {
          setMessages(result);
          setMeta({ total: result.length, page: 1, limit: 20, totalPages: 1 });
        } else {
          setMessages([]);
        }
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, typeFilter],
  );

  useEffect(() => {
    setPage(1);
    fetchMessages(1);
  }, [fetchMessages]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchMessages(newPage);
    },
    [fetchMessages],
  );

  const handleRefresh = useCallback(() => {
    fetchMessages(page, true);
  }, [fetchMessages, page]);

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
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Message Log</h1>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="">All</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter">Type</Label>
                <Select
                  id="type-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-48"
                >
                  <option value="">All</option>
                  <option value="order_notification">Order Notification</option>
                  <option value="daily_report">Daily Report</option>
                  <option value="custom">Custom</option>
                  <option value="promotion">Promotion</option>
                  <option value="otp">OTP</option>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Messages</CardTitle>
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
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="mb-3 h-10 w-10" />
                <p className="text-sm">No messages found</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Recipient Name</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell className="font-mono text-sm">
                          {msg.recipient}
                        </TableCell>
                        <TableCell>{msg.recipient_name || '—'}</TableCell>
                        <TableCell
                          className="max-w-[200px]"
                          title={msg.message}
                        >
                          {truncateMessage(msg.message)}
                        </TableCell>
                        <TableCell>{getTypeBadge(msg.message_type)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(msg.status)}
                            {msg.status === 'FAILED' && msg.error && (
                              <span
                                title={msg.error}
                                className="cursor-help"
                              >
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDate(msg.created_at)}
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
    </PermissionGuard>
  );
}
