export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerListResponse {
  data: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
}

export interface GetAllPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PartnerPayload {
  name: string;
  logo: string;
  website?: string;
  sort_order?: number;
  is_active?: boolean;
}
