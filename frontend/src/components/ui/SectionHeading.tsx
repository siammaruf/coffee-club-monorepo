import { cn } from '@/lib/utils'
import { DecorativeOrnament } from '@/components/ui/DecorativeOrnament'

interface SectionHeadingProps {
  tagline?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  dark?: boolean
}

export function SectionHeading({
  tagline,
  title,
  subtitle,
  align = 'center',
  dark = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-12',
        align === 'center' && 'text-center'
      )}
    >
      {tagline && (
        <p
          className={cn(
            'font-script text-lg md:text-xl mb-2',
            dark ? 'text-primary-400' : 'text-primary-500'
          )}
        >
          {tagline}
        </p>
      )}
      <h2
        className={cn(
          'font-heading text-3xl md:text-4xl font-bold',
          dark ? 'text-text-light' : 'text-text-primary'
        )}
      >
        {title}
      </h2>
      <div className={cn('mt-4', align === 'center' && 'flex justify-center')}>
        <DecorativeOrnament dark={dark} />
      </div>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-base md:text-lg max-w-2xl',
            align === 'center' && 'mx-auto',
            dark ? 'text-text-light/70' : 'text-text-muted'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
