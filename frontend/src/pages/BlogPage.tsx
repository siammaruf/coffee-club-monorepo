import type { MetaFunction } from 'react-router'
import { Link, useSearchParams } from 'react-router'
import { useBlogPosts } from '@/services/httpServices/queries/useBlog'
import { BlogSidebar } from '@/components/shared/BlogSidebar'
import { formatDate, truncate } from '@/lib/utils'
import type { BlogPost } from '@/types/blog'

export const meta: MetaFunction = () => [
  { title: 'Blog | CoffeeClub' },
  {
    name: 'description',
    content:
      'Read the latest articles, stories, and coffee insights from CoffeeClub.',
  },
  { property: 'og:title', content: 'Blog | CoffeeClub' },
  {
    property: 'og:description',
    content:
      'Read the latest articles, stories, and coffee insights from CoffeeClub.',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Blog | CoffeeClub' },
  {
    name: 'twitter:description',
    content:
      'Read the latest articles, stories, and coffee insights from CoffeeClub.',
  },
  { name: 'robots', content: 'index, follow' },
]

function BlogCardSkeleton() {
  return (
    <div className="animate-pulse border-b border-border pb-8">
      <div className="h-[250px] bg-bg-lighter" />
      <div className="mt-4 h-3 w-32 bg-bg-lighter" />
      <div className="mt-3 h-5 w-3/4 bg-bg-lighter" />
      <div className="mt-3 h-3 w-full bg-bg-lighter" />
      <div className="mt-2 h-3 w-2/3 bg-bg-lighter" />
      <div className="mt-4 h-8 w-28 bg-bg-lighter" />
    </div>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  const imageUrl = post?.image ?? '/img/1-80x80.jpg'
  const title = post?.title ?? ''
  const excerpt = post?.excerpt ?? ''
  const author = post?.author ?? 'CoffeeClub'
  const date = post?.published_at ?? post?.created_at ?? ''

  return (
    <article className="border-b border-border pb-8">
      {/* Featured Image */}
      <Link to={`/blog/${post?.slug ?? ''}`} className="group block overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-[250px] w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[300px]"
        />
      </Link>

      {/* Meta */}
      <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-[2px] text-text-muted">
        {date && <span>{formatDate(date)}</span>}
        <span>/</span>
        <span>{author}</span>
      </div>

      {/* Title */}
      <h5 className="mt-3">
        <Link
          to={`/blog/${post?.slug ?? ''}`}
          className="transition-colors hover:text-link-hover"
        >
          {title}
        </Link>
      </h5>

      {/* Excerpt */}
      <p className="mt-3 text-sm text-text-body">
        {truncate(excerpt, 180)}
      </p>

      {/* Read More */}
      <Link
        to={`/blog/${post?.slug ?? ''}`}
        className="btn-vincent mt-4 inline-block"
      >
        Read More
      </Link>
    </article>
  )
}

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''

  const { data, isLoading, isError } = useBlogPosts({
    page,
    limit: 6,
    search,
  })

  const posts = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (newPage > 1) params.page = String(newPage)
    setSearchParams(params)
  }

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>Blog</h1>
      </div>

      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Main Content - 8 cols */}
            <div className="lg:col-span-8">
              {/* Results Count */}
              <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
                <p className="text-sm text-text-muted">
                  {isLoading
                    ? 'Loading...'
                    : `${total} article${total !== 1 ? 's' : ''} found`}
                </p>
                {search && (
                  <button
                    onClick={() => setSearchParams({})}
                    className="text-sm text-accent transition-colors hover:text-link-hover"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {/* Error State */}
              {isError && (
                <div className="border-2 border-error/30 bg-error/5 p-4 text-center text-sm text-error">
                  Failed to load blog posts. Please try again later.
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Posts */}
              {!isLoading && !isError && (
                <>
                  {posts.length === 0 ? (
                    <div className="py-16 text-center">
                      <h3 className="text-text-muted">No articles found</h3>
                      <p className="mt-2 text-sm text-text-muted">
                        {search
                          ? 'Try adjusting your search terms.'
                          : 'Check back soon for new articles.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-10">
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
                    className="btn-vincent disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={
                          p === page ? 'btn-vincent-filled' : 'btn-vincent'
                        }
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="btn-vincent disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar - 4 cols */}
            <aside className="lg:col-span-4">
              <BlogSidebar />
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
