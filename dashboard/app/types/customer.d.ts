export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  picture: string;
  status: "active" | "inactive";
  is_active?: boolean;
}

export interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}

export interface GetAllCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface CustomerCreateResponse {
  data: Customer;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface CustomerFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdated: (customer: Customer) => void;
}