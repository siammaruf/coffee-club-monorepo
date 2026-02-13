import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Calendar, User, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageBanner } from '@/components/ui/PageBanner'
import { useBlogPosts } from '@/services/httpServices/queries/useBlog'
import { formatDate, truncate } from '@/lib/utils'
import type { BlogPost } from '@/types/blog'

function BlogCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="h-48 bg-warm-surface" />
      <div className="p-5">
        <div className="h-3 w-24 rounded bg-warm-surface" />
        <div className="mt-3 h-5 w-3/4 rounded bg-warm-surface" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-warm-surface" />
          <div className="h-3 w-2/3 rounded bg-warm-surface" />
        </div>
        <div className="mt-4 h-4 w-28 rounded bg-warm-surface" />
      </div>
    </div>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-warm-surface">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-warm-surface">
            <BookOpen className="h-12 w-12 text-primary-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.published_at)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {post.author}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading mt-2 text-lg font-bold text-text-primary transition-colors group-hover:text-primary-600">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mt-2 text-sm leading-relaxed text-text-body">
          {truncate(post.excerpt, 120)}
        </p>

        {/* Read More */}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition-colors group-hover:text-primary-700">
          Read More
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const page = Number(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''

  const { data, isLoading, isError } = useBlogPosts({ page, limit: 9, search })

  const posts = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params: Record<string, string> = {}
    if (searchInput.trim()) params.search = searchInput.trim()
    setSearchParams(params)
  }

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (newPage > 1) params.page = String(newPage)
    setSearchParams(params)
  }

  return (
    <>
      <SEO
        title="Blog"
        description="Read the latest articles, stories, and coffee insights from CoffeeClub."
      />

      <PageBanner
        title="Our Blog"
        subtitle="Stories, tips, and insights from the world of coffee and beyond."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      />

      <div className="bg-warm-bg">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto max-w-xl">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles..."
                className="h-12 w-full rounded-xl border border-border bg-white pl-12 pr-24 text-base text-text-primary shadow-sm transition-colors placeholder:text-text-muted/50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Search
              </button>
            </div>
          </form>

          {/* Results Count */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              {isLoading ? 'Loading...' : `${total} article${total !== 1 ? 's' : ''} found`}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearchInput('')
                  setSearchParams({})
                }}
                className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Error State */}
          {isError && (
            <div className="mt-6 rounded-xl border border-error/20 bg-error/5 p-4 text-center text-sm text-error">
              Failed to load blog posts. Please try again later.
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Posts Grid */}
          {!isLoading && !isError && (
            <>
              {posts.length === 0 ? (
                <div className="mt-16 flex flex-col items-center justify-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                    <BookOpen className="h-10 w-10 text-primary-500" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-text-primary">No articles found</h3>
                  <p className="mt-1 max-w-sm text-sm text-text-body">
                    {search
                      ? 'Try adjusting your search terms or browse all articles.'
                      : 'Check back soon for new articles and stories.'}
                  </p>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-muted transition-colors hover:bg-warm-surface hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    p === page
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'border border-border bg-white text-text-body hover:bg-warm-surface hover:text-primary-600'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-muted transition-colors hover:bg-warm-surface hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
