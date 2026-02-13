import { Coffee, Heart, Award, Users, Target, Sparkles } from 'lucide-react'
import { PageBanner } from '@/components/ui/PageBanner'

const values = [
  {
    icon: Coffee,
    title: 'Quality First',
    description: 'We source only the finest beans and freshest ingredients, ensuring every product meets our high standards.',
  },
  {
    icon: Heart,
    title: 'Community Love',
    description: 'CoffeeClub is more than a cafe. It is a gathering place where neighbors become friends and ideas come to life.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'From barista training to food preparation, we strive for excellence in every aspect of your experience.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction drives everything we do. We listen, adapt, and continually improve to serve you better.',
  },
]

const team = [
  { name: 'Ahmed Rahman', role: 'Founder & Head Barista', initials: 'AR' },
  { name: 'Fatima Khan', role: 'Executive Chef', initials: 'FK' },
  { name: 'Karim Hossain', role: 'Operations Manager', initials: 'KH' },
  { name: 'Nusrat Alam', role: 'Customer Experience Lead', initials: 'NA' },
]

export default function AboutPage() {
  return (
    <>
      <title>About Us | CoffeeClub</title>
      <meta name="description" content="Learn about CoffeeClub's story, our passion for premium coffee, and our commitment to quality dining experiences." />
      <meta property="og:title" content="About Us | CoffeeClub" />
      <meta property="og:description" content="Learn about CoffeeClub's story, our passion for premium coffee, and our commitment to quality dining." />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
    <div className="bg-dark">
      {/* Page Banner */}
      <PageBanner
        title="About Us"
        subtitle="The story behind Dhaka's favorite coffee destination."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      {/* Story Section */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-400">
            Our Journey
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold text-cream sm:text-4xl">
            From a Small Corner to a Community Hub
          </h2>
          <div className="mx-auto mt-3 h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-400" />
        </div>

        <div className="mt-10 space-y-6 text-coffee-light leading-relaxed">
          <p>
            CoffeeClub was born in 2014 from a simple idea: create a space where people could enjoy
            exceptional coffee and food in a warm, welcoming environment. Our founder, Ahmed Rahman,
            spent years traveling across coffee-producing regions, learning the art of roasting and
            brewing before bringing that expertise home to Dhaka.
          </p>
          <p>
            What started as a small 20-seat cafe in Gulshan has grown into one of the most beloved
            coffee destinations in the city. But through all the growth, our core mission has remained
            the same: serve great coffee, make delicious food, and create a space where everyone feels at home.
          </p>
          <p>
            Today, CoffeeClub serves over 500 customers daily, offers more than 50 menu items, and
            has become the go-to spot for morning coffee, business meetings, study sessions, and
            weekend brunches. Our online ordering platform makes it easier than ever to enjoy your
            CoffeeClub favorites wherever you are.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-dark-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary-400" />
                <h2 className="font-heading text-2xl font-bold text-cream">Our Mission</h2>
              </div>
              <p className="mt-4 text-coffee-light leading-relaxed">
                To be Dhaka&apos;s most loved coffee and dining destination by delivering consistently
                exceptional products, memorable experiences, and genuine hospitality. We aim to build
                a community around our shared love for great coffee and food.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary-400" />
                <h2 className="font-heading text-2xl font-bold text-cream">Our Vision</h2>
              </div>
              <p className="mt-4 text-coffee-light leading-relaxed">
                To set the standard for premium cafe culture in Bangladesh, inspiring a new generation
                of coffee lovers and food enthusiasts. We envision a future where every neighborhood
                has a CoffeeClub that serves as a pillar of the community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-cream">Our Values</h2>
          <div className="mx-auto mt-3 h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-400" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-primary-800/30 bg-dark-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-700/50"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-500/10">
                <value.icon className="h-7 w-7 text-primary-400" />
              </div>
              <h3 className="mt-4 text-base font-bold text-cream">{value.title}</h3>
              <p className="mt-2 text-sm text-coffee-light">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-dark-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-cream">Meet Our Team</h2>
            <div className="mx-auto mt-3 h-[2px] w-16 bg-gradient-to-r from-primary-500 to-primary-400" />
            <p className="mx-auto mt-4 max-w-xl text-coffee-light">
              The passionate people behind your favorite coffee and meals.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-400 shadow-lg">
                  <span className="text-2xl font-bold text-dark">{member.initials}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-cream">{member.name}</h3>
                <p className="text-sm text-coffee-light">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
  )
}
