import type { MetaFunction } from 'react-router'
import { HeroSlider } from '@/components/home/HeroSlider'
import { AboutSection } from '@/components/home/AboutSection'
import { OpeningHoursSection } from '@/components/home/OpeningHoursSection'
import { SpecialMenuSection } from '@/components/home/SpecialMenuSection'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { PrivateEventsSection } from '@/components/home/PrivateEventsSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { PartnersSection } from '@/components/home/PartnersSection'
import { LatestNewsSection } from '@/components/home/LatestNewsSection'
import { CTASection } from '@/components/home/CTASection'

export const meta: MetaFunction = () => [
  { title: 'Premium Coffee & Dining | CoffeeClub' },
  { name: 'description', content: 'Welcome to CoffeeClub. Discover our premium coffee, refreshing beverages, and delicious dishes. Order online for dine-in, takeaway, or delivery.' },
  { property: 'og:title', content: 'Premium Coffee & Dining | CoffeeClub' },
  { property: 'og:description', content: 'Welcome to CoffeeClub. Discover our premium coffee, refreshing beverages, and delicious dishes. Order online for dine-in, takeaway, or delivery.' },
  { property: 'og:type', content: 'restaurant' },
  {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: 'CoffeeClub',
      description: 'Premium coffee, refreshing beverages, and delicious dishes',
      servesCuisine: ['Coffee', 'Beverages', 'Snacks', 'Fine Dining'],
      acceptsReservations: true,
      priceRange: '$$',
    },
  },
]

export default function HomePage() {
  return (
    <>
      <div>
        <HeroSlider />
        <AboutSection />
        <OpeningHoursSection />
        <SpecialMenuSection />
        <WhyChooseUs />
        <PrivateEventsSection />
        <TestimonialsSection />
        <PartnersSection />
        <LatestNewsSection />
        <CTASection />
      </div>
    </>
  )
}
