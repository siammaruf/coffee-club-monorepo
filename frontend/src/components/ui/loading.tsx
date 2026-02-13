import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  fullPage?: boolean
}

function Loading({ size = 'md', className, text, fullPage = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary-500', sizeClasses[size])} />
      {text && <p className="text-sm text-text-muted">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-warm-bg">
        {spinner}
      </div>
    )
  }

  return spinner
}

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-warm-surface',
        className
      )}
    />
  )
}

export { Loading, LoadingSkeleton }
