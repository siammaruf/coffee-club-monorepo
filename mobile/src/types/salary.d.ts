import type { User } from './user';

export interface Salary{
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    picture?: string;
  };
  id?:string
  user_id?: string;
  month?: string;
  base_salary?: number;
  bonus?: number;
  deductions?: number;
  total_payble?: number;
  is_paid?: boolean;
  notes?: string;
  receipt_image?: string;
}

export interface SalaryFormData {
  user_id: string;
  base_salary: number;
  bonus?: number;
  deductions?: number;
  total_payble: number;
  receipt_image?: string;
  is_paid?: boolean;
  notes?: string;
  month?: string;
}

export interface SalaryListResponse {
  data: Salary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface SalaryResponse {
  data: Salary;
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface GetAllSalariesParams {
  page?: number;
  per_page?: number;
  limit?: number;
  user_id?: string;
  payment_status?: 'paid' | 'unpaid' | 'pending';
  start_date?: string;
  end_date?: string;
  sort_by?: 'created_at' | 'salary_month' | 'total_salary' | 'payment_date';
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export type SalaryStatus = 'paid' | 'unpaid' | 'pending';

export interface SalarySummary {
  total_salaries: number;
  total_paid: number;
  total_unpaid: number;
  total_pending: number;
  average_salary: number;
  total_overtime: number;
  total_bonus: number;
  total_deductions: number;
}
