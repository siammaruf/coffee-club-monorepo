import { useState, type FormEvent } from 'react'

interface NewsletterSectionProps {
  title?: string
  subtitle?: string
}

export function NewsletterSection({ title, subtitle }: NewsletterSectionProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    setEmail('')
    // Reset toast after 3 seconds
    setTimeout(() => setSubmitted(false), 3000)
  }

  const displayTitle = title || 'Subscribe for Our Newsletter'

  return (
    <section className="py-16 md:py-24">
      <div className="vincent-container">
        <h1 className="mb-4 text-center text-text-heading">
          {displayTitle}
        </h1>
        {subtitle && (
          <p className="mb-6 text-center text-text-muted tracking-[2px]">
            {subtitle}
          </p>
        )}
        <div className={subtitle ? 'mx-auto max-w-lg' : 'mx-auto mt-4 max-w-lg'}>
          <form onSubmit={handleSubmit} className="flex gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              required
              data-lpignore="true"
              autoComplete="off"
              className="flex-1 border-2 border-border bg-transparent px-4 py-2.5 text-sm tracking-[3px] text-text-primary placeholder:text-text-muted focus:border-text-primary focus:outline-none"
            />
            <button
              type="submit"
              className="inline-block border-2 border-bg-secondary bg-bg-secondary text-accent uppercase tracking-[3px] text-[14px] transition-all duration-200 hover:bg-accent hover:border-link-hover hover:text-bg-primary whitespace-nowrap"
              style={{ padding: '6px 14px 6px 17px' }}
            >
              Submit
            </button>
          </form>
          {submitted && (
            <p className="mt-4 text-center text-sm tracking-[2px] text-text-body animate-fade-in">
              Thank you for subscribing!
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
