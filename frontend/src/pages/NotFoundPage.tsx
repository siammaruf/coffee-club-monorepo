import type { MetaFunction } from 'react-router'
import { Link } from 'react-router'

export const meta: MetaFunction = () => [
  { title: 'Page Not Found | CoffeeClub' },
  { name: 'description', content: 'The page you are looking for does not exist.' },
  { property: 'og:title', content: 'Page Not Found | CoffeeClub' },
  { property: 'og:description', content: 'The page you are looking for does not exist.' },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Page Not Found | CoffeeClub' },
  { name: 'twitter:description', content: 'The page you are looking for does not exist.' },
  { name: 'robots', content: 'noindex, nofollow' },
]

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-bg-primary px-4 text-center">
      <h1
        className="text-[120px] font-normal leading-none tracking-[20px] text-accent sm:text-[180px]"
        style={{ letterSpacing: '20px' }}
      >
        404
      </h1>
      <p className="mt-4 text-lg uppercase tracking-[4px] text-text-muted">
        Page not found
      </p>
      <p className="mt-4 max-w-md text-sm text-text-muted">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-10">
        <Link to="/" className="btn-vincent-filled">
          Return to Home
        </Link>
      </div>
    </div>
  )
}
