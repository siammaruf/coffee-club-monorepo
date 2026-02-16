export interface Category {
  id: string
  name: string
  name_bn: string
  slug: string
  description?: string
  icon?: string
  item_count?: number
}

export interface ItemVariation {
  id: string
  name: string
  name_bn: string
  regular_price: number
  sale_price: number | null
  status: 'AVAILABLE' | 'ACTIVE' | 'ON_SALE' | 'OUT_OF_STOCK' | 'DISCONTINUED'
  sort_order: number
}

export interface Item {
  id: string
  name: string
  name_bn: string
  slug: string
  description: string
  type: 'BAR' | 'KITCHEN'
  status: 'AVAILABLE' | 'UNAVAILABLE'
  regular_price: number
  sale_price: number | null
  max_price?: number
  max_sale_price?: number
  has_variations: boolean
  variations?: ItemVariation[]
  image: string
  categories: Category[]
  created_at: string
  updated_at: string
}

/**
 * Backend returns pagination fields at the root level, not inside a `meta` object.
 * Shape: { data, total, page, limit, totalPages, status, message, statusCode }
 */
export interface ItemsResponse {
  data: Item[]
  total: number
  page: number
  limit: number
  totalPages: number
  status: string
  message: string
  statusCode: number
}

export interface ItemFilters {
  /** Filter by category slug -- backend param is `categorySlug` */
  categorySlug?: string
  search?: string
  page?: number
  limit?: number
}
