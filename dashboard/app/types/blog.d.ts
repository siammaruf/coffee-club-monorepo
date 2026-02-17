export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  author: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostListResponse {
  data: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  status: string;
  message: string;
  statusCode: number;
}

export interface GetAllBlogPostsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BlogPostPayload {
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  is_published?: boolean;
}
