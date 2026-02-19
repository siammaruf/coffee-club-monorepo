import type { ExpenseCategory } from "./expenseCategory";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category_id?: string;
  description?: string;
  category?: ExpenseCategory;
  status: "pending" | "approved" | "rejected" | string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCreate {
  title: string;
  amount: number;
  category_id: string;
  description?: string;
  status: "pending" | "approved" | "rejected" | string;
}

export interface ExpenseUpdate {
  title?: string;
  amount?: number;
  category_id?: string;
  description?: string;
  status?: "pending" | "approved" | "rejected" | string;
}

export interface ExpenseItem {
    id: string;
    title: string;
    amount: number;
    description: string;
    status: 'approved' | 'pending' | 'rejected';
    category: {
        id: string;
        name: string;
        slug: string;
        description?: string;
        icon?: string;
    };
    receipt_reference?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
}
