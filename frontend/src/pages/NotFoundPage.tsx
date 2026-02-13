import { Link } from 'react-router-dom'
import { Coffee, Home, ArrowLeft } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />
      <div className="flex min-h-[70vh] items-center justify-center bg-warm-bg px-4">
        <div className="text-center">
          {/* Illustration */}
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary-100">
            <Coffee className="h-16 w-16 text-primary-500" />
          </div>

          {/* 404 Text */}
          <h1 className="font-heading mt-6 text-7xl font-bold text-primary-500 sm:text-8xl">404</h1>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">Page Not Found</h2>
          <p className="mx-auto mt-3 max-w-md text-text-body">
            Oops! The page you are looking for does not exist or may have been moved.
            Let us get you back to something delicious.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/">
              <Button size="lg">
                <Home className="h-5 w-5" />
                Go Home
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="outline" size="lg">
                <ArrowLeft className="h-5 w-5" />
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
