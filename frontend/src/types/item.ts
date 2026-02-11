export interface Category {
  id: string
  name: string
  name_bn: string
  slug: string
  description?: string
  icon?: string
  item_count?: number
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
  image: string
  categories: Category[]
  created_at: string
  updated_at: string
}

export interface ItemsResponse {
  data: Item[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ItemFilters {
  category?: string
  search?: string
  type?: 'BAR' | 'KITCHEN'
  page?: number
  limit?: number
}
