import { SEO } from '@/components/SEO'
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

export default function HomePage() {
  return (
    <>
      <SEO
        title="Premium Coffee & Dining"
        description="Welcome to CoffeeClub. Discover our premium coffee, refreshing beverages, and delicious dishes. Order online for dine-in, takeaway, or delivery."
        type="restaurant"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Restaurant',
          name: 'CoffeeClub',
          description: 'Premium coffee, refreshing beverages, and delicious dishes',
          servesCuisine: ['Coffee', 'Beverages', 'Snacks', 'Fine Dining'],
          acceptsReservations: true,
          priceRange: '$$',
        }}
      />
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
