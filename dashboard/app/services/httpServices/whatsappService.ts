import { httpService } from '../httpService';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const whatsappService = {
  // Connection
  getStatus: () => httpService.get('/whatsapp/status'),
  connect: () => httpService.post('/whatsapp/connect'),
  disconnect: () => httpService.post('/whatsapp/disconnect'),
  logout: () => httpService.post('/whatsapp/logout'),

  // QR polling fallback
  getPendingQr: () => httpService.get('/whatsapp/pending-qr'),

  // Groups
  getGroups: () => httpService.get('/whatsapp/groups'),

  // Config
  getConfig: () => httpService.get('/whatsapp/config'),
  updateConfig: (data: any) => httpService.put('/whatsapp/config', data),

  // Contacts
  getContacts: (params?: any) => httpService.get('/whatsapp/contacts', { params }),
  createContact: (data: any) => httpService.post('/whatsapp/contacts', data),
  updateContact: (id: string, data: any) =>
    httpService.put(`/whatsapp/contacts/${id}`, data),
  deleteContact: (id: string) => httpService.delete(`/whatsapp/contacts/${id}`),

  // Messages
  sendMessage: (data: { recipients: string[]; message: string; message_type?: string }) =>
    httpService.post('/whatsapp/send', data),
  getMessages: (params?: any) => httpService.get('/whatsapp/messages', { params }),

  // Report
  sendDailyReport: () => httpService.post('/whatsapp/report/send'),

  // Promotions
  getPromotions: (params?: any) => httpService.get('/whatsapp/promotions', { params }),
  createPromotion: (data: any) => httpService.post('/whatsapp/promotions', data),
  updatePromotion: (id: string, data: any) =>
    httpService.put(`/whatsapp/promotions/${id}`, data),
  deletePromotion: (id: string) => httpService.delete(`/whatsapp/promotions/${id}`),
  sendPromotion: (id: string) =>
    httpService.post(`/whatsapp/promotions/${id}/send`),
  getRecipientCount: (target: string) =>
    httpService.get('/whatsapp/promotions/recipient-count', { params: { target } }),
};
