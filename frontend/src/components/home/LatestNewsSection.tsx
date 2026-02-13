import { Link } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollFadeIn } from '@/components/ui/ScrollFadeIn'
import { Button } from '@/components/ui/button'

const blogPosts = [
  {
    id: '1',
    title: 'The Perfect Pour: Mastering Latte Art at Home',
    excerpt:
      'Learn the techniques our baristas use to create stunning latte art. From the basics of milk frothing to advanced rosetta designs.',
    date: '2025-01-15',
    category: 'Coffee Tips',
    image: null,
  },
  {
    id: '2',
    title: 'Behind the Beans: Our Sourcing Journey to Ethiopia',
    excerpt:
      'Follow our team as we travel to the highlands of Ethiopia to discover the origins of our signature single-origin blend.',
    date: '2025-01-08',
    category: 'Stories',
    image: null,
  },
  {
    id: '3',
    title: 'New Seasonal Menu: Winter Warmers Collection',
    excerpt:
      'Introducing our winter specials - from spiced chai lattes to rich chocolate fondant. Discover the flavors of the season.',
    date: '2024-12-28',
    category: 'News',
    image: null,
  },
]

function formatBlogDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function LatestNewsSection() {
  return (
    <section className="section-light-alt py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollFadeIn>
          <SectionHeading
            tagline="From Our Blog"
            title="Latest News & Stories"
            subtitle="Stay updated with the latest from CoffeeClub. Tips, stories, and announcements."
          />
        </ScrollFadeIn>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {blogPosts.map((post, index) => (
            <ScrollFadeIn key={post.id} delay={index * 150}>
              <article className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-400/50">
                {/* Image placeholder */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-warm-surface to-warm-light">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-heading text-5xl font-bold text-primary-200/40">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Category badge */}
                  <span className="absolute left-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-primary-600">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
                    {post.excerpt}
                  </p>

                  {/* Read More */}
                  <Link
                    to="/blog"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
                  >
                    Read More
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            </ScrollFadeIn>
          ))}
        </div>

        {/* View All Posts */}
        <ScrollFadeIn delay={200}>
          <div className="mt-12 text-center">
            <Link to="/blog">
              <Button variant="outline" size="lg">
                View All Posts
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  )
}
