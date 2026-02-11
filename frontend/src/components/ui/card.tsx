import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

function Card({ className, hover = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-primary-100 bg-white shadow-sm transition-all duration-300',
        hover && 'hover:shadow-lg hover:-translate-y-1 hover:border-primary-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 pt-6', className)} {...props} />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4', className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 pb-6', className)} {...props} />
  )
}

export { Card, CardHeader, CardContent, CardFooter }
