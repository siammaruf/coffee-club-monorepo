import { Link } from 'react-router'
import { useBlogPosts } from '@/services/httpServices/queries/useBlog'
import { formatDate, truncate } from '@/lib/utils'

export function BlogPreviewSection() {
  const { data, isLoading } = useBlogPosts({ limit: 4 })
  const posts = data?.data ?? []

  return (
    <section className="py-16 md:py-24 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/img/back_3.jpg')" }}>
      <div className="vincent-container">
        {/* Header block */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h6 className="mb-[22px] text-text-body">
            Not just a pizza, but Lifestyle
          </h6>
          <h1 className="mb-[44px] text-text-heading">Something From The Blog</h1>
          <img
            src="/img/separator_dark.png"
            alt=""
            className="mx-auto mb-[39px]"
            aria-hidden="true"
          />
          <p className="mb-[40px] text-text-body">
            And yes, we&apos;re pizza people. But we&apos;re also human people,
            we lead with our hearts, we believe in giving back to the global
            community. Join us, welcome to our pizzerias!
          </p>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-3 h-3 w-1/3 rounded bg-bg-lighter" />
                <div className="mb-3 h-5 w-3/4 rounded bg-bg-lighter" />
                <div className="mb-2 h-3 w-full rounded bg-bg-lighter" />
                <div className="mb-2 h-3 w-full rounded bg-bg-lighter" />
                <div className="h-8 w-28 rounded bg-bg-lighter" />
              </div>
            ))}
          </div>
        )}

        {/* Blog posts grid */}
        {!isLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <div key={post.id} className="text-center px-5">
                <div className="mb-[20px] text-sm tracking-[2px] leading-[26px] text-text-muted">
                  {post.published_at
                    ? formatDate(post.published_at)
                    : post.created_at
                      ? formatDate(post.created_at)
                      : ''}
                </div>
                <h5 className="mb-[13px] leading-[26px] text-text-heading">
                  {post.title ?? ''}
                </h5>
                <p className="mb-[26px] text-[14px] text-text-body">
                  {truncate(post.excerpt ?? '', 120)}
                </p>
                <Link
                  to={`/blog/${post.slug ?? post.id}`}
                  className="btn-vincent-filled"
                >
                  Read More
                  <span className="ml-2" aria-hidden="true">
                    &rsaquo;
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <p className="text-center text-text-muted">
            No blog posts available yet.
          </p>
        )}
      </div>
    </section>
  )
}
