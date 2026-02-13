import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:from-primary-600 hover:to-primary-700 hover:shadow-lg active:scale-[0.98]',
        secondary:
          'bg-dark-card text-cream border border-primary-800/30 shadow-md hover:bg-dark-light hover:shadow-lg active:scale-[0.98]',
        outline:
          'border-2 border-primary-500 text-primary-400 bg-transparent hover:bg-primary-500/10 active:scale-[0.98]',
        ghost:
          'text-cream hover:bg-primary-500/10 hover:text-primary-400',
        danger:
          'bg-error text-white shadow-md hover:bg-red-600 hover:shadow-lg active:scale-[0.98]',
        'outline-white':
          'border-2 border-white text-white bg-transparent hover:bg-white/10 active:scale-[0.98]',
        gold:
          'bg-primary-500 text-dark font-bold hover:bg-primary-400 shadow-md hover:shadow-lg active:scale-[0.98]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-13 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
