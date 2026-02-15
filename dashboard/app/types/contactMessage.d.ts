export type ContactMessageStatus = 'new' | 'read' | 'replied';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactMessageStatus;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageListResponse {
  data: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
}

export interface GetAllContactMessagesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactMessageStatus;
}

export interface ReplyContactMessagePayload {
  reply: string;
}

export interface UpdateContactMessageStatusPayload {
  status: ContactMessageStatus;
}
