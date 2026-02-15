import type { MetaFunction } from 'react-router'
import { Link, useParams, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useBlogPost } from '@/services/httpServices/queries/useBlog'
import { BlogSidebar } from '@/components/shared/BlogSidebar'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading, isError } = useBlogPost(slug || '')

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || 'CoffeeClub Blog',
          text: post?.excerpt || '',
          url,
        })
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

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

              {/* Meta */}
              <div className="mb-6 flex items-center gap-4 text-xs uppercase tracking-[2px] text-text-muted">
                {date && <span>{formatDate(date)}</span>}
                <span>/</span>
                <span>{author}</span>
              </div>

              {/* Excerpt */}
              {excerpt && (
                <p className="mb-8 text-lg italic text-text-body">{excerpt}</p>
              )}

              {/* Content */}
              <div
                className="prose prose-invert max-w-none text-text-body prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-[4px] prose-headings:text-text-heading prose-p:leading-relaxed prose-a:text-accent hover:prose-a:text-accent-hover prose-strong:text-text-primary prose-blockquote:border-l-accent prose-blockquote:text-text-muted prose-img:w-full"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Divider */}
              <hr className="my-10 border-border" />

              {/* Bottom Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="btn-vincent"
                >
                  Go Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleShare}
                    className="btn-vincent"
                  >
                    Share
                  </button>
                  <Link to="/blog" className="btn-vincent-filled">
                    All Articles
                  </Link>
                </div>
              </div>
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
