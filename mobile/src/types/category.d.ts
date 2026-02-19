export interface Category {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  description: string | null;
  icon: string | null;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: any) => void;
  newCategory: Partial<FormValues>;
  setNewCategory: (cat: Partial<FormValues> | null) => void;
  mode?: "add" | "edit";
}

export interface GetAllCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CategoryListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface FormCategoryValues{
  name: string;
  name_bn: string;
  slug: string;
  description: string;
  image: File | null;
};
