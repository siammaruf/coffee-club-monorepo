import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface PageBannerProps {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
}

export function PageBanner({ title, subtitle, breadcrumbs }: PageBannerProps) {
  return (
    <section className="relative overflow-hidden bg-dark py-20 sm:py-28">
      {/* Decorative warm gradient accent */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-primary-500 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-6 flex items-center justify-center gap-2 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-4 w-4 text-text-light/70" />}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-text-light/70 transition-colors hover:text-primary-400"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-primary-400">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className="font-heading text-4xl font-bold text-text-light sm:text-5xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-light/70">{subtitle}</p>
        )}

        {/* Decorative line */}
        <div className="gold-underline mx-auto mt-6" />
      </div>
    </section>
  )
}
