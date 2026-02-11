export interface SalesReport {
  id: string;
  report_date: string;
  total_sales: number;
  bar_sales: number;
  kitchen_sales: number;
  total_orders: number;
  bar_orders: number;
  kitchen_orders: number;
  total_expenses: number;
  total_expense_items: number;
  credit_amount: number;
  is_auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ViewSalesReportModalProps {
  open: boolean;
  onClose: () => void;
  reportId: string | null;
}

interface FinancialSummary {
  total_sales: number;
  total_expenses: number;
  current_fund: number;
  generated_at?: string;
}

export interface FilteredReport {
  id: string;
  report_date: string;
  total_sales: number;
  bar_sales: number;
  kitchen_sales: number;
  total_orders: number;
  bar_orders: number;
  kitchen_orders: number;
  total_expenses: number;
  total_expense_items: number;
  credit_amount: number;
  is_auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilteredSummary {
  period: string;
  total_sales: number;
  total_expenses: number;
  total_profit: number;
  total_orders: number;
  total_days: number;
  average_daily_sales: number;
  average_daily_orders: number;
  best_sales_day: { date: string; amount: number };
  worst_sales_day: { date: string; amount: number };
  sales_trend: {
    increasing_days: number;
    decreasing_days: number;
    stable_days: number;
  };
  filter_info: {
    type: string;
    start_date: string;
    end_date: string;
  };
}