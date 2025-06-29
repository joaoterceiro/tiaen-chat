import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-colors'
    
    const variants = {
      default: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
      primary: 'bg-primary-500 text-white hover:bg-primary-600',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
      success: 'bg-success-500 text-white hover:bg-success-600',
      warning: 'bg-warning-500 text-white hover:bg-warning-600',
      error: 'bg-error-500 text-white hover:bg-error-600',
      outline: 'border-2 border-secondary-200 text-secondary-700 hover:bg-secondary-50',
    }
    
    const sizes = {
      sm: dot ? 'h-2 w-2' : 'h-5 px-2 text-xs',
      md: dot ? 'h-3 w-3' : 'h-6 px-2.5 text-sm',
      lg: dot ? 'h-4 w-4' : 'h-8 px-3 text-base',
    }

    if (dot) {
      return (
        <div
          className={cn(
            'rounded-full',
            variants[variant],
            sizes[size],
            className
          )}
          ref={ref}
          {...props}
        />
      )
    }

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge } 