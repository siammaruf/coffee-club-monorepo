import type { MetaFunction } from 'react-router'
import { HeroSlider } from '@/components/home/HeroSlider'
import { AdvantagesSection } from '@/components/home/AdvantagesSection'
import { HotSalesSection } from '@/components/home/HotSalesSection'
import { AboutTestimonialsSection } from '@/components/home/AboutTestimonialsSection'
import { TabbedMenuSection } from '@/components/home/TabbedMenuSection'
import { BlogPreviewSection } from '@/components/home/BlogPreviewSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { useWebsiteContent } from '@/services/httpServices/queries/useWebsiteContent'
import {
  defaultSlides,
  defaultAdvantages,
  defaultTestimonials,
} from '@/lib/defaults'

export const meta: MetaFunction = () => [
  { title: 'Premium Coffee & Dining | CoffeeClub' },
  {
    name: 'description',
    content:
      'Welcome to CoffeeClub. Discover our premium coffee, refreshing beverages, and delicious dishes. Order online for dine-in, takeaway, or delivery.',
  },
  { property: 'og:title', content: 'Premium Coffee & Dining | CoffeeClub' },
  {
    property: 'og:description',
    content:
      'Welcome to CoffeeClub. Discover our premium coffee, refreshing beverages, and delicious dishes. Order online for dine-in, takeaway, or delivery.',
  },
  { property: 'og:type', content: 'restaurant' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Premium Coffee & Dining | CoffeeClub' },
  {
    name: 'twitter:description',
    content:
      'Welcome to CoffeeClub. Discover our premium coffee, refreshing beverages, and delicious dishes. Order online for dine-in, takeaway, or delivery.',
  },
  { name: 'robots', content: 'index, follow' },
  {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: 'CoffeeClub',
      description:
        'Premium coffee, refreshing beverages, and delicious dishes',
      servesCuisine: ['Coffee', 'Beverages', 'Snacks', 'Fine Dining'],
      acceptsReservations: true,
      priceRange: '$$',
    },
  },
]

export default function HomePage() {
  const { data: content } = useWebsiteContent()

  return (
    <div>
      <HeroSlider slides={content?.heroSlides ?? defaultSlides} />
      <AdvantagesSection
        advantages={content?.advantages ?? defaultAdvantages}
      />
      <HotSalesSection />
      <AboutTestimonialsSection
        about={content?.settings?.about}
        testimonials={content?.testimonials ?? defaultTestimonials}
      />
      <TabbedMenuSection />
      <BlogPreviewSection />
      <NewsletterSection
        title={content?.settings?.newsletter?.title}
        subtitle={content?.settings?.newsletter?.subtitle}
      />
    </div>
  )
}
