import type { MetaFunction } from 'react-router'
import { Link, useParams, useNavigate } from 'react-router'
import { Calendar, User, ArrowLeft, BookOpen, Share2, ChevronRight } from 'lucide-react'
import { Loading } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { useBlogPost } from '@/services/httpServices/queries/useBlog'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export const meta: MetaFunction = () => [
  { title: 'Blog Post | CoffeeClub' },
  { name: 'description', content: 'Read this article on the CoffeeClub blog.' },
  { property: 'og:title', content: 'Blog Post | CoffeeClub' },
  { property: 'og:description', content: 'Read this article on the CoffeeClub blog.' },
  { property: 'og:type', content: 'article' },
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

  if (isLoading) {
    return (
      <Loading fullPage text="Loading article..." />
    )
  }

  if (isError || !post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-warm-bg px-4">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-100">
              <BookOpen className="h-12 w-12 text-primary-500" />
            </div>
            <h1 className="font-heading mt-6 text-2xl font-bold text-text-primary">
              Article Not Found
            </h1>
            <p className="mt-2 max-w-md text-text-body">
              The article you are looking for does not exist or may have been removed.
            </p>
            <div className="mt-6">
              <Link to="/blog">
                <Button>
                  <ArrowLeft className="h-4 w-4" />
                  Back to Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
    )
  }

  return (
    <>
      {/* Hero Banner with Post Image */}
      <section className="relative overflow-hidden bg-dark py-20 sm:py-28">
        {/* Background image overlay */}
        {post.image && (
          <div className="absolute inset-0">
            <img
              src={post.image}
              alt=""
              className="h-full w-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-dark/70" />
          </div>
        )}

        {/* Decorative warm gradient accent */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-primary-500 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center justify-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-text-light/70 transition-colors hover:text-primary-400">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-text-light/70" />
            <Link to="/blog" className="text-text-light/70 transition-colors hover:text-primary-400">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4 text-text-light/70" />
            <span className="text-primary-400">Article</span>
          </nav>

          {/* Meta */}
          <div className="flex items-center justify-center gap-4 text-sm text-text-light/70">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.published_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading mt-4 text-3xl font-bold text-text-light sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {/* Decorative line */}
          <div className="gold-underline mx-auto mt-6" />
        </div>
      </section>

      {/* Article Content */}
      <div className="bg-warm-bg">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* Featured Image */}
          {post.image && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-border shadow-sm">
              <img
                src={post.image}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* Excerpt / Lead */}
          {post.excerpt && (
            <p className="mb-8 text-lg font-medium leading-relaxed text-text-primary">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <article
            className="prose prose-lg max-w-none text-text-body
              prose-headings:font-heading prose-headings:text-text-primary
              prose-h2:mt-10 prose-h2:text-2xl prose-h2:font-bold
              prose-h3:mt-8 prose-h3:text-xl prose-h3:font-bold
              prose-p:leading-relaxed
              prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-text-primary
              prose-blockquote:border-l-primary-500 prose-blockquote:bg-warm-surface prose-blockquote:py-2 prose-blockquote:pl-6 prose-blockquote:italic
              prose-img:rounded-xl prose-img:shadow-sm
              prose-li:marker:text-primary-500"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Divider */}
          <hr className="my-10 border-border" />

          {/* Bottom Actions */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-body shadow-sm transition-colors hover:bg-warm-surface hover:text-primary-600"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>

              <Link to="/blog">
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4" />
                  All Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
