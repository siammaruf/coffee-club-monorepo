export type VendorType = 'FOOD_SUPPLIER' | 'NON_FOOD_SUPPLIER';
export type VendorStatus = 'ACTIVE' | 'INACTIVE';

export interface Vendor {
  id: string;
  vendor_name: string;
  contact_person: string;
  vendor_type: VendorType;
  address: string;
  mobile: string;
  email: string | null;
  status: VendorStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorInput {
  vendor_name: string;
  contact_person: string;
  vendor_type: VendorType;
  address: string;
  mobile: string;
  email?: string;
  status?: VendorStatus;
}

export interface UpdateVendorInput extends Partial<CreateVendorInput> {}

export interface VendorListResponse {
  data: Vendor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VendorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: VendorStatus;
  vendor_type?: VendorType;
}
