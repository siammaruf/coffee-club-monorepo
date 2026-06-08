export type VendorPaymentType = 'CASH' | 'BANK' | 'BKASH' | 'NAGAD';

export interface VendorPayment {
  id: string;
  vendor_id: string;
  vendor: {
    id: string;
    vendor_name: string;
  };
  amount: number;
  payment_date: string;
  payment_type: VendorPaymentType;
  note: string | null;
  screenshot_url: string | null;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorPaymentInput {
  vendor_id: string;
  amount: number;
  payment_date: string;
  payment_type: VendorPaymentType;
  note?: string;
  screenshot_url?: string;
}

export interface UpdateVendorPaymentInput extends Partial<CreateVendorPaymentInput> {}

export interface VendorPaymentListResponse {
  data: VendorPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VendorPaymentFilters {
  page?: number;
  limit?: number;
  vendor_id?: string;
  start_date?: string;
  end_date?: string;
  payment_type?: VendorPaymentType;
}
