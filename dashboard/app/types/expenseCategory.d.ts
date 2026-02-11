
export interface ExpenseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategoryCreate {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface AddExpenseCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (category: ExpenseCategory) => void;
  onCreate: (data: { name: string; slug: string; description: string; icon: string }) => Promise<any>;
}

export interface FormValues {
  name: string;
  slug: string;
  description: string;
  icon: string;
};
