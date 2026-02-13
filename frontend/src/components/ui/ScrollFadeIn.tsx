import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

interface ScrollFadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function ScrollFadeIn({ children, className, delay = 0 }: ScrollFadeInProps) {
  const { ref, inView } = useInView({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        inView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6',
        className
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
