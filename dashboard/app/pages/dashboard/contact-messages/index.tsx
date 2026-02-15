import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Eye, Search, Trash2 } from "lucide-react";
import { contactMessageService } from "~/services/httpServices/contactMessageService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import ContactMessageModal from "./components/ContactMessageModal";
import type { ContactMessage, ContactMessageStatus } from "~/types/contactMessage";

function getStatusBadgeClasses(status: ContactMessageStatus): string {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "read":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "replied":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getStatusLabel(status: ContactMessageStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "read":
      return "Read";
    case "replied":
      return "Replied";
    default:
      return status;
  }
}

export default function ContactMessagesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          limit: itemsPerPage,
        };
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        const res = await contactMessageService.getAll(params);
        setMessages(res.data || []);
        setTotal(res.total || 0);
      } catch {
        setMessages([]);
        setTotal(0);
      }
      setIsLoading(false);
    };
    fetchMessages();
  }, [currentPage, searchTerm, statusFilter]);

  const handleMessageUpdate = (updated: ContactMessage) => {
    setMessages(prev =>
      prev.map(m => (m.id === updated.id ? updated : m))
    );
    setViewMessage(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await contactMessageService.delete(deleteId);
      setMessages(prev => prev.filter(m => m.id !== deleteId));
      setTotal(prev => prev - 1);
    } catch (error) {
      console.error("Failed to delete contact message:", error);
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (isLoading) {
    return <ContactMessagesLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contact Messages</h2>
          <p className="text-muted-foreground">Manage customer inquiries and messages</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <span>Contact Messages ({total})</span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select
                value={statusFilter}
                onChange={e => {
                  setCurrentPage(1);
                  setStatusFilter(e.target.value);
                }}
                className="w-40 h-10"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, subject..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => {
                    setCurrentPage(1);
                    setSearchTerm(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-7 font-medium text-sm">
                <div className="col-span-2 text-left">Name</div>
                <div className="text-center">Email</div>
                <div className="text-center">Subject</div>
                <div className="text-center">Status</div>
                <div className="text-center">Date</div>
                <div className="text-right">Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {messages.length > 0 ? (
                messages.map(msg => (
                  <div key={msg.id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-7 text-sm items-center">
                      <div className="col-span-2 text-left">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{msg.name}</span>
                          {msg.phone && (
                            <span className="text-xs text-gray-500 mt-0.5 truncate">
                              {msg.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-center text-gray-600 truncate px-1">{msg.email}</div>
                      <div className="text-center text-gray-600 truncate px-1">
                        {msg.subject || "---"}
                      </div>
                      <div className="text-center">
                        <Badge className={getStatusBadgeClasses(msg.status)}>
                          {getStatusLabel(msg.status)}
                        </Badge>
                      </div>
                      <div className="text-center text-gray-500 text-xs">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 cursor-pointer"
                          title="View"
                          onClick={() => setViewMessage(msg)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete"
                          onClick={() => setDeleteId(msg.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {searchTerm || statusFilter ? (
                    <>
                      <p>No contact messages found matching your filters.</p>
                      <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
                    </>
                  ) : (
                    <>
                      <p>No contact messages available.</p>
                      <p className="text-sm mt-1">Messages from the website contact form will appear here.</p>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center gap-2 p-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Prev
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {viewMessage && (
        <ContactMessageModal
          isOpen={!!viewMessage}
          onClose={() => setViewMessage(null)}
          onUpdate={handleMessageUpdate}
          message={viewMessage}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Contact Message?"
        description="Are you sure you want to delete this contact message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}

function ContactMessagesLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-9 w-56 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-72 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-7 gap-4">
                <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-14" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-12" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-14" />
                <div className="h-4 bg-gray-200 rounded animate-pulse ml-auto w-14" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="grid grid-cols-7 items-center gap-4">
                    <div className="col-span-2 flex flex-col gap-1">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="h-6 w-14 bg-gray-200 rounded-full animate-pulse mx-auto" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="flex gap-2 justify-end">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
