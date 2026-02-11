export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
}

export type AttendanceFormData = {
  user_id: string;
  attendance_date: string;
  check_in?: string;
  check_out?: string;
  status: AttendanceStatus;
  work_hours: number;
  overtime_hours: number;
  notes?: string;
  is_approved?: boolean;
  approved_by?: string;
};

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  image?: string;
}

export interface Attendance {
  id: string;
  user: User; 
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  work_hours: string; 
  overtime_hours: string; 
  notes?: string | null;
  is_approved: boolean;
  approved_by?: string | null;
  approver: User | null;
  created_at: string;
  updated_at: string;
}

export interface GetAllAttendanceParams {
  page?: number;
  per_page?: number;
  search?: string;
  user_id?: string;
  department?: string;
  status?: AttendanceStatus;
  attendance_date?: string;
  start_date?: string;
  end_date?: string;
  is_approved?: boolean;
  sort_by?: 'attendance_date' | 'employee_name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface AttendanceResponse {
  data: Attendance;
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface AttendanceListResponse {
  data: Attendance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface AddAttendanceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceFormData) => Promise<void>;
  employees?: Employee[];
  isLoading?: boolean;
}

export interface AttendanceStats {
  total_employees: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  pending_approvals: number;
  attendance_rate: number;
}

export interface AttendanceStatsResponse {
  data: AttendanceStats;
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}