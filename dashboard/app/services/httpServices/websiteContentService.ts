import { httpService } from '../httpService';

export interface HeroSlide {
  id: string;
  type: 'centered' | 'side-text' | 'bg-image';
  title: string;
  subtitle?: string;
  heading?: string;
  description?: string;
  image?: string;
  show_cta: boolean;
  background_image: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Advantage {
  id: string;
  icon?: string;
  title: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position?: string;
  quote: string;
  image?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WebsiteSettings {
  [key: string]: string;
}

// Backend response wrapper shape
interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export const websiteContentService = {
  // Hero Slides
  getHeroSlides: () => httpService.get<ApiResponse<HeroSlide[]>>('/website-content/hero-slides'),
  createHeroSlide: (data: Partial<HeroSlide>) => httpService.post<ApiResponse<HeroSlide>>('/website-content/hero-slides', data),
  updateHeroSlide: (id: string, data: Partial<HeroSlide>) => httpService.put<ApiResponse<HeroSlide>>(`/website-content/hero-slides/${id}`, data),
  deleteHeroSlide: (id: string) => httpService.delete(`/website-content/hero-slides/${id}`),

  // Advantages
  getAdvantages: () => httpService.get<ApiResponse<Advantage[]>>('/website-content/advantages'),
  createAdvantage: (data: Partial<Advantage>) => httpService.post<ApiResponse<Advantage>>('/website-content/advantages', data),
  updateAdvantage: (id: string, data: Partial<Advantage>) => httpService.put<ApiResponse<Advantage>>(`/website-content/advantages/${id}`, data),
  deleteAdvantage: (id: string) => httpService.delete(`/website-content/advantages/${id}`),

  // Testimonials
  getTestimonials: () => httpService.get<ApiResponse<Testimonial[]>>('/website-content/testimonials'),
  createTestimonial: (data: Partial<Testimonial>) => httpService.post<ApiResponse<Testimonial>>('/website-content/testimonials', data),
  updateTestimonial: (id: string, data: Partial<Testimonial>) => httpService.put<ApiResponse<Testimonial>>(`/website-content/testimonials/${id}`, data),
  deleteTestimonial: (id: string) => httpService.delete(`/website-content/testimonials/${id}`),

  // Settings
  getSettings: () => httpService.get<ApiResponse<WebsiteSettings>>('/website-content/settings'),
  updateSettings: (data: Record<string, string>) => httpService.put<ApiResponse<WebsiteSettings>>('/website-content/settings', data),

  // Image upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return httpService.post<ApiResponse<{ url: string }>>('/website-content/upload-image', formData);
  },
};
