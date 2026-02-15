export interface HeroSlide {
  id: string
  type: 'centered' | 'side-text' | 'bg-image'
  image: string | null
  title: string
  subtitle: string | null
  heading: string | null
  description: string
  show_cta: boolean
  bg_image: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Advantage {
  id: string
  icon: string | null
  title: string
  description: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Testimonial {
  id: string
  quote: string
  image: string | null
  name: string
  position: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WebsiteSettings {
  phone: string
  hours: string
  social: {
    twitter: string
    facebook: string
    instagram: string
  }
  newsletter: {
    title: string
    subtitle: string
  }
  about: {
    title: string
    subtitle: string
    paragraph1: string
    paragraph2: string
  }
}

export interface WebsiteContent {
  heroSlides: HeroSlide[]
  advantages: Advantage[]
  testimonials: Testimonial[]
  settings: WebsiteSettings
}

export interface WebsiteContentResponse {
  data: WebsiteContent
  status: string
  message: string
  statusCode: number
  timestamp: string
}
