import type { MetaFunction } from 'react-router'
import { Link, useParams, useNavigate, useLocation } from 'react-router'
import { Loader2 } from 'lucide-react'
import { FaFacebook, FaTwitter, FaPinterest } from 'react-icons/fa'
import { useBlogPost, useBlogPosts } from '@/services/httpServices/queries/useBlog'
import { BlogSidebar } from '@/components/shared/BlogSidebar'
import { formatDate, truncate } from '@/lib/utils'

export const meta: MetaFunction = () => [
  { title: 'Blog Post | CoffeeClub' },
  {
    name: 'description',
    content: 'Read this article on the CoffeeClub blog.',
  },
  { property: 'og:title', content: 'Blog Post | CoffeeClub' },
  {
    property: 'og:description',
    content: 'Read this article on the CoffeeClub blog.',
  },
  { property: 'og:type', content: 'article' },
  { property: 'og:site_name', content: 'CoffeeClub' },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Blog Post | CoffeeClub' },
  {
    name: 'twitter:description',
    content: 'Read this article on the CoffeeClub blog.',
  },
  { name: 'robots', content: 'index, follow' },
]

const PLACEHOLDER_TAGS = ['Blog', 'Lifestyle', 'Pizza', 'Vincent']

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const { data: post, isLoading, isError } = useBlogPost(slug || '')
  const { data: relatedData } = useBlogPosts({ limit: 3 })
  const relatedPosts = (relatedData?.data ?? [])
    .filter((p) => p.slug !== slug)
    .slice(0, 2)

  // Build share URL from location (SSR-safe, no window.location)
  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.origin + location.pathname
      : location.pathname

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="page-title-block">
          <h1>Loading...</h1>
        </div>
        <div className="flex min-h-[40vh] items-center justify-center bg-bg-primary">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </>
    )
  }

  // Error / not found
  if (isError || !post) {
    return (
      <>
        <div className="page-title-block">
          <h1>Article Not Found</h1>
        </div>
        <div className="flex min-h-[40vh] flex-col items-center justify-center bg-bg-primary px-4 text-center">
          <p className="text-text-muted">
            The article you are looking for does not exist or may have been
            removed.
          </p>
          <Link to="/blog" className="btn-vincent-filled mt-6">
            Back to Blog
          </Link>
        </div>
      </>
    )
  }

  const title = post?.title ?? ''
  const author = post?.author ?? 'CoffeeClub'
  const date = post?.published_at ?? post?.created_at ?? ''
  const imageUrl = post?.image ?? null
  const excerpt = post?.excerpt ?? ''
  const content = post?.content ?? ''

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  return (
    <>
      {/* Page Title Block */}
      <div className="page-title-block">
        <h1>{title}</h1>
      </div>

      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="vincent-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Main Content - 8 cols */}
            <article className="lg:col-span-8">
              {/* Post Meta */}
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[2px] text-text-muted">
                {date && <span>{formatDate(date)}</span>}
                <span>/</span>
                <span>
                  By{' '}
                  <span className="text-accent">{author}</span>
                </span>
                <span>/</span>
                <span>0 Comments</span>
              </div>

              {/* Featured Image */}
              {imageUrl && (
                <div className="mb-8 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full object-cover"
                  />
                </div>
              )}

              {/* Excerpt */}
              {excerpt && (
                <p className="mb-8 text-lg italic text-text-body">{excerpt}</p>
              )}

              {/* Content */}
              <div
                className="prose prose-invert max-w-none text-text-body prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-[4px] prose-headings:text-text-heading prose-p:leading-relaxed prose-a:text-accent hover:prose-a:text-link-hover prose-strong:text-text-primary prose-blockquote:border-l-accent prose-blockquote:text-text-muted prose-img:w-full"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Divider */}
              <hr className="my-10 border-border" />

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-heading text-sm uppercase tracking-[3px] text-text-muted">
                  Tags:
                </span>
                {PLACEHOLDER_TAGS.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?search=${tag}`}
                    className="text-sm uppercase tracking-[2px] text-text-muted transition-colors hover:text-link-hover"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Share Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="font-heading text-sm uppercase tracking-[3px] text-text-muted">
                  Share This Post
                </span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#3b5998] transition-opacity hover:opacity-80"
                >
                  <FaFacebook className="h-4 w-4" />
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#1da1f2] transition-opacity hover:opacity-80"
                >
                  <FaTwitter className="h-4 w-4" />
                  Twitter
                </a>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#bd081c] transition-opacity hover:opacity-80"
                >
                  <FaPinterest className="h-4 w-4" />
                  Pinterest
                </a>
              </div>

              {/* Author Info Box */}
              <div className="mt-10 flex gap-6 border-t border-b border-border py-8">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-bg-secondary">
                  <img
                    src="/img/e5df5a63a52667f2ca78d48b52fdc2d2.png"
                    alt={author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h6 className="mb-2 font-heading text-base uppercase tracking-[3px]">
                    <span className="text-accent">{author}</span>
                  </h6>
                  <p className="text-sm leading-relaxed text-text-body">
                    All made possible by our flavor, innovation and, most
                    importantly, by unlocking potential in our team members.
                    Instead of following trends, we set them.
                  </p>
                </div>
              </div>

              {/* Post Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="btn-vincent"
                >
                  &larr; Previous Post
                </button>
                <Link to="/blog" className="btn-vincent">
                  Next Post &rarr;
                </Link>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h4 className="mb-8 font-heading text-lg uppercase tracking-[4px] text-text-heading">
                    Related Posts
                  </h4>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {relatedPosts.map((relPost) => (
                      <div key={relPost.id}>
                        {relPost.image && (
                          <Link to={`/blog/${relPost.slug}`}>
                            <img
                              src={relPost.image}
                              alt={relPost.title}
                              className="mb-4 w-full object-cover transition-opacity hover:opacity-80"
                            />
                          </Link>
                        )}
                        <div className="mb-3 text-xs uppercase tracking-[2px] text-text-muted">
                          {formatDate(
                            relPost.published_at ?? relPost.created_at
                          )}{' '}
                          / By {relPost.author || 'CoffeeClub'}
                        </div>
                        <Link to={`/blog/${relPost.slug}`}>
                          <h5 className="mb-3 font-heading text-base uppercase tracking-[3px] text-text-heading transition-colors hover:text-link-hover">
                            {relPost.title}
                          </h5>
                        </Link>
                        <p className="text-sm leading-relaxed text-text-body">
                          {truncate(relPost.excerpt || '', 150)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

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
