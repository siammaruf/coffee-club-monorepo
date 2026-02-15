import { httpService } from '../httpService';
import type { Attendance, AttendanceListResponse, GetAllAttendanceParams, AttendanceFormData, AttendanceResponse } from '~/types/attendance';

export const attendanceService = {
  create: (attendance: AttendanceFormData) => httpService.post<AttendanceResponse>('/stuff-attendance', attendance),
  getAll: (params?: GetAllAttendanceParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<AttendanceListResponse>('/stuff-attendance', config);
  },
  getById: (id: string) => httpService.get<Attendance>(`/stuff-attendance/${id}`),
  update: (id: string, attendance: AttendanceFormData) => httpService.patch<Attendance>(`/stuff-attendance/${id}`, attendance),
  delete: (id: string) => httpService.delete(`/stuff-attendance/${id}`),
  approve: (id: string, approved_by: string) => httpService.post<Attendance>(`/stuff-attendance/approve/${id}`, { approved_by }),
  reject: (id: string, reason?: string) => httpService.patch<Attendance>(`/stuff-attendance/${id}/reject`, { reason }),
  getByEmployee: (employeeId: string, params?: GetAllAttendanceParams) => {
    const config = params ? { params } : undefined;
    return httpService.get<AttendanceListResponse>(`/stuff-attendance/employee/${employeeId}`, config);
  },
  getByDateRange: (startDate: string, endDate: string, params?: GetAllAttendanceParams) => {
    const queryParams = { start_date: startDate, end_date: endDate, ...params };
    return httpService.get<AttendanceListResponse>('/stuff-attendance', { params: queryParams });
  },
  bulkDelete: (ids: string[]) => httpService.delete('/stuff-attendance/bulk/delete', { data: { ids } }),
  getTrash: (params?: Record<string, any>) => httpService.get('/stuff-attendance/trash/list', params ? { params } : undefined),
  restore: (id: string) => httpService.patch(`/stuff-attendance/${id}/restore`),
  permanentDelete: (id: string) => httpService.delete(`/stuff-attendance/${id}/permanent`),
  bulkRestore: (ids: string[]) => httpService.patch('/stuff-attendance/bulk/restore', { ids }),
  bulkPermanentDelete: (ids: string[]) => httpService.delete('/stuff-attendance/bulk/permanent', { data: { ids } }),
};