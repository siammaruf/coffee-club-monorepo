import { HeroSection } from '@/components/home/HeroSection'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { FeaturedMenu } from '@/components/home/FeaturedMenu'
import { AboutSection } from '@/components/home/AboutSection'
import { StatsSection } from '@/components/home/StatsSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { CTASection } from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <title>CoffeeClub - Premium Coffee & Dining</title>
      <meta name="description" content="Welcome to CoffeeClub. Discover our premium coffee, refreshing beverages, and delicious dishes. Order online for dine-in, takeaway, or delivery." />
      <meta property="og:title" content="CoffeeClub - Premium Coffee & Dining" />
      <meta property="og:description" content="Discover our premium coffee, refreshing beverages, and delicious dishes." />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": "CoffeeClub",
          "description": "Premium coffee, refreshing beverages, and delicious dishes",
          "servesCuisine": ["Coffee", "Beverages", "Snacks"],
          "acceptsReservations": true,
          "priceRange": "$$"
        })}
      </script>
      <div>
        <HeroSection />
      <CategoryShowcase />
      <FeaturedMenu />
      <AboutSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  </>
  )
}
