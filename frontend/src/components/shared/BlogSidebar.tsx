import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import { useBlogPosts } from '@/services/httpServices/queries/useBlog'
import { formatDate } from '@/lib/utils'

const categories = [
  'Food',
  'Inspiration',
  'Lifestyle',
  'People',
  'Recipes',
  'World',
]

const tags = [
  'Blog',
  'Food',
  'Lifestyle',
  'Pizza',
  'Restaurant',
  'Coffee',
  'Recipe',
  'Tips',
]

export function BlogSidebar() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')

  const { data } = useBlogPosts({ limit: 3 })
  const posts = data?.data ?? []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed) {
      navigate(`/blog?search=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/blog')
    }
  }

  const handleCategoryClick = (category: string) => {
    navigate(`/blog?search=${encodeURIComponent(category)}`)
  }

  const handleTagClick = (tag: string) => {
    navigate(`/blog?search=${encodeURIComponent(tag)}`)
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-8 border-b border-border pb-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            className="w-full border-2 border-border bg-transparent py-2 pl-4 pr-10 text-sm tracking-[3px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Featured Posts */}
      <div className="mb-8 border-b border-border pb-8">
        <h5 className="mb-4">Featured Posts</h5>
        <div className="space-y-4">
          {posts.length > 0
            ? posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group flex items-start gap-3"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-bg-secondary">
                    <img
                      src={post.image ?? '/img/1-80x80.jpg'}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-sm text-text-primary transition-colors group-hover:text-link-hover">
                      {post.title}
                    </span>
                    <div className="mt-1 text-xs text-text-muted">
                      {formatDate(post.published_at ?? post.created_at)}
                    </div>
                  </div>
                </Link>
              ))
            : (
              <>
                <Link to="/blog" className="group flex items-start gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-bg-secondary">
                    <img src="/img/1-80x80.jpg" alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className="text-sm text-text-primary transition-colors group-hover:text-link-hover">
                      Healthy Food for healthy body
                    </span>
                    <div className="mt-1 text-xs text-text-muted">April 6, 2017</div>
                  </div>
                </Link>
                <Link to="/blog" className="group flex items-start gap-3">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-bg-secondary">
                    <img src="/img/2-80x80.jpg" alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className="text-sm text-text-primary transition-colors group-hover:text-link-hover">
                      Food design trends 2017
                    </span>
                    <div className="mt-1 text-xs text-text-muted">April 6, 2017</div>
                  </div>
                </Link>
              </>
            )}
        </div>
      </div>

      {/* Blog Categories */}
      <div className="mb-8 border-b border-border pb-8">
        <h5 className="mb-4">Blog Categories</h5>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => handleCategoryClick(cat)}
                className="text-sm text-text-muted transition-colors hover:text-link-hover"
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="mb-8">
        <h5 className="mb-4">Tags</h5>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="border border-border px-3 py-1 text-xs uppercase tracking-[2px] text-text-muted transition-colors hover:border-link-hover hover:text-link-hover"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
