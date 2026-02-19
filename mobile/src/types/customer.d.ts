export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  picture: string;
  points: number;
  balance: number;
  created_at?: string;
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
  is_active?: boolean;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  is_active: boolean;
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

interface CustomerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomerId?: string;
  onSelectCustomer: (customer: Customer) => void;
}
