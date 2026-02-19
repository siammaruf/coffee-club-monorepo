import type { SalesReport, FilteredSummary } from '../../types/report';
import { httpService } from '../httpService';

interface ReportListResponse {
  data: SalesReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

interface ReportResponse {
  data: SalesReport;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

interface FinancialSummaryResponse {
  data: {
    total_sales: number;
    total_expenses: number;
    total_credit: number;
    current_fund: number;
    total_orders: number;
    total_expense_items: number;
    bar_sales: number;
    kitchen_sales: number;
    summary_date: string;
  };
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

interface DashboardResponse {
  data: {
    todays_total_sales: number;
    active_orders: number;
    todays_expenses: number;
    pending_orders: number;
    takeaway_orders: number;
    dinein_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    todays_profit: number;
    total_orders_today: number;
    average_order_value: number;
    total_customers: number;
    total_active_customers: number;
    total_tables: number;
    total_items: number;
    total_sales_reports: number;
    generated_at: string;
  };
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

interface FilteredSummaryResponse {
  data: FilteredSummary;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

const BASE_URL = '/sales-reports';

const reportService = {
  getFinancialSummary: () => httpService.get<FinancialSummaryResponse>(`${BASE_URL}/financial-summary`),
  getFilteredSummary: (params?: any) => httpService.get<FilteredSummaryResponse>(`${BASE_URL}/filtered-summary`, { params }),
  getKitchenReport: () => httpService.get(`${BASE_URL}/kitchen-report`),
  generate: (data: any) => httpService.post<ReportResponse>(`${BASE_URL}/generate`, data),
  regenerate: (date: string) => httpService.post<ReportResponse>(`${BASE_URL}/regenerate/${date}`),
  getAll: (params?: any) => httpService.get<ReportListResponse>(BASE_URL, { params }),
  getById: (id: string) => httpService.get<ReportResponse>(`${BASE_URL}/${id}`),
  delete: (id: string) => httpService.delete<{ message: string }>(`${BASE_URL}/${id}`),
  getDashboard: () => httpService.get<DashboardResponse>(`${BASE_URL}/dashboard`),
  getSalesProgressChart: (params?: any) => httpService.get(`${BASE_URL}/charts/sales-progress`, { params }),
  getExpensesChart: (params?: any) => httpService.get(`${BASE_URL}/charts/expenses`, { params }),
};

export default reportService;
