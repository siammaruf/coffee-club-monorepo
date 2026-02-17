export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string | null
  author: string
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogPostsResponse {
  data: BlogPost[]
  total: number
  page: number
  limit: number
  totalPages: number
}
