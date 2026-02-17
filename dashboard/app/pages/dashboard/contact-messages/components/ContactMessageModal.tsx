import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { X, Send, Upload, XCircle, Eye } from "lucide-react";
import { contactMessageService } from "~/services/httpServices/contactMessageService";
import { toast } from "sonner";
import type { ContactMessage } from "~/types/contactMessage";

interface ContactMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (message: ContactMessage) => void;
  message: ContactMessage | null;
}

function getStatusBadgeClasses(status: string): string {
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

function getStatusLabel(status: string): string {
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

export default function ContactMessageModal({
  isOpen,
  onClose,
  onUpdate,
  message,
}: ContactMessageModalProps) {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  if (!isOpen || !message) return null;

  const handleMarkAsRead = async () => {
    setIsMarkingRead(true);
    try {
      const result = await contactMessageService.updateStatus(message.id, { status: "read" });
      const saved = result.data || result;
      onUpdate(saved as ContactMessage);
      toast("Message marked as read!", {
        description: (
          <span style={{ color: "#000" }}>
            The message status was updated successfully.
          </span>
        ),
        duration: 3000,
        icon: <Upload className="text-green-600 mr-2" />,
        style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
      });
    } catch (error: any) {
      let apiMessage = "Failed to update message status.";
      if (error?.response?.data?.message) {
        apiMessage = error.response.data.message;
      } else if (error?.message) {
        apiMessage = error.message;
      }
      toast("Failed to update status.", {
        description: (
          <span style={{ color: "#000" }}>
            {apiMessage}
          </span>
        ),
        duration: 3000,
        icon: <XCircle className="text-red-600" style={{ marginTop: 10, marginRight: 10 }} />,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          alignItems: "flex-start",
          border: "1.5px solid #ef4444",
        },
      });
    }
    setIsMarkingRead(false);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await contactMessageService.reply(message.id, { reply: replyText.trim() });
      const saved = result.data || result;
      onUpdate(saved as ContactMessage);
      setReplyText("");
      toast("Reply sent!", {
        description: (
          <span style={{ color: "#000" }}>
            Your reply has been sent successfully.
          </span>
        ),
        duration: 3000,
        icon: <Upload className="text-green-600 mr-2" />,
        style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
      });
      setTimeout(() => onClose(), 500);
    } catch (error: any) {
      let apiMessage = "Failed to send reply.";
      if (error?.response?.data?.message) {
        apiMessage = error.response.data.message;
      } else if (error?.message) {
        apiMessage = error.message;
      }
      toast("Failed to send reply.", {
        description: (
          <span style={{ color: "#000" }}>
            {apiMessage}
          </span>
        ),
        duration: 3000,
        icon: <XCircle className="text-red-600" style={{ marginTop: 10, marginRight: 10 }} />,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          alignItems: "flex-start",
          border: "1.5px solid #ef4444",
        },
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Contact Message</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Sender Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Sender Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <p className="text-gray-900">{message.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{message.email}</p>
              </div>
              {message.phone && (
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <p className="text-gray-900">{message.phone}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <div className="mt-1">
                  <Badge className={getStatusBadgeClasses(message.status)}>
                    {getStatusLabel(message.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Message
            </h4>
            {message.subject && (
              <div className="text-sm">
                <span className="font-medium text-gray-600">Subject:</span>
                <p className="text-gray-900 font-medium">{message.subject}</p>
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium text-gray-600">Message:</span>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Admin Reply (if already replied) */}
          {message.status === "replied" && message.admin_reply && (
            <div className="bg-green-50 rounded-lg p-4 space-y-2 border border-green-200">
              <h4 className="font-semibold text-green-800 text-sm uppercase tracking-wide">
                Admin Reply
              </h4>
              <p className="text-sm text-green-900 whitespace-pre-wrap">{message.admin_reply}</p>
              {message.replied_at && (
                <p className="text-xs text-green-600 mt-2">
                  Replied on: {new Date(message.replied_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 flex gap-4">
            <span>Received: {new Date(message.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(message.updated_at).toLocaleString()}</span>
          </div>

          {/* Mark as Read Button (if status is 'new') */}
          {message.status === "new" && (
            <div className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleMarkAsRead}
                disabled={isMarkingRead}
              >
                <Eye className="h-4 w-4" />
                {isMarkingRead ? "Updating..." : "Mark as Read"}
              </Button>
            </div>
          )}

          {/* Reply Section (if not yet replied) */}
          {message.status !== "replied" && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm">Send Reply</h4>
              <div className="space-y-2">
                <Label htmlFor="reply" className="text-sm font-medium text-gray-700">
                  Reply Message
                </Label>
                <Textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  className="min-h-[100px] resize-y"
                  rows={4}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
              disabled={isSubmitting}
            >
              Close
            </Button>
            {message.status !== "replied" && (
              <Button
                type="button"
                className="px-6 bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                onClick={handleSendReply}
                disabled={isSubmitting || !replyText.trim()}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Reply"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
