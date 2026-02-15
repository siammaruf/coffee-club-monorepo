import { httpService } from '../httpService';
import type {
  ContactMessage,
  ContactMessageListResponse,
  GetAllContactMessagesParams,
  ReplyContactMessagePayload,
  UpdateContactMessageStatusPayload,
} from '~/types/contactMessage';

export const contactMessageService = {
  getAll: (params?: GetAllContactMessagesParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<ContactMessageListResponse>('/contact-messages', config);
  },
  getById: (id: string) => httpService.get<{ data: ContactMessage }>(`/contact-messages/${id}`),
  reply: (id: string, data: ReplyContactMessagePayload) =>
    httpService.put<{ data: ContactMessage }>(`/contact-messages/${id}/reply`, data),
  updateStatus: (id: string, data: UpdateContactMessageStatusPayload) =>
    httpService.put<{ data: ContactMessage }>(`/contact-messages/${id}/status`, data),
  delete: (id: string) => httpService.delete(`/contact-messages/${id}`),
  bulkDelete: (ids: string[]) => httpService.delete('/contact-messages/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/contact-messages/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/contact-messages/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/contact-messages/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch('/contact-messages/bulk/restore', { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete('/contact-messages/bulk/permanent', { data: { ids } }),
};
