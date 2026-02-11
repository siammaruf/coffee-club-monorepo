export interface Bank {
  id: string;
  bank_name: string;
  branch_name: string;
  account_number: string;
  routing_number: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nid_number: string;
  nid_front_picture: string;
  nid_back_picture: string;
  address: string;
  date_joined: string;
  status: string;
  role: UserRole;
  picture: string;
  base_salary: number;
  created_at: string;
  updated_at: string;
  banks: Bank[];
  password?: string;
}

export interface UserResponse {
  data: User;
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface UsersListResponse {
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nid_number: string;
  nid_front_picture: FileList;
  nid_back_picture: FileList;
  address: string;
  bank_name?: string;
  branch_name?: string;
  account_number?: string;
  routing_number?: string;
  status: boolean;
  role: UserRole;
  date_joined: string;
  picture?: FileList;
  password: string;
  base_salary: number;
  bank?: {
    bank_name: string;
    branch_name: string;
    account_number: string;
    routing_number: string;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: 'success' | 'error';
  message: string;
  statusCode: number;
  timestamp: string;
}