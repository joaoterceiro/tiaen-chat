'use client'

import { TextareaHTMLAttributes, forwardRef, useMemo } from 'react'
import { cn, generateId } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled'
  textareaSize?: 'sm' | 'md' | 'lg'
  error?: boolean
  helperText?: string
  label?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant = 'default', 
    textareaSize = 'md', 
    error = false,
    helperText,
    label,
    resize = 'vertical',
    id,
    ...props 
  }, ref) => {
    const textareaId = useMemo(() => id || generateId('textarea'), [id])
    
    const baseStyles = 'flex w-full rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
    
    const variants = {
      default: 'border-secondary-200 bg-white focus-visible:ring-primary-500',
      filled: 'border-transparent bg-secondary-100 focus-visible:ring-primary-500',
    }
    
    const sizes = {
      sm: 'min-h-[80px] px-3 py-2 text-sm',
      md: 'min-h-[100px] px-3 py-2 text-base',
      lg: 'min-h-[120px] px-4 py-3 text-lg',
    }

    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }

    const errorStyles = error ? 'border-error-500 focus-visible:ring-error-500' : ''

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium mb-2',
              error ? 'text-error-600' : 'text-secondary-700'
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          className={cn(
            baseStyles,
            variants[variant],
            sizes[textareaSize],
            resizeStyles[resize],
            errorStyles,
            className
          )}
          ref={ref}
          {...props}
        />
        
        {helperText && (
          <p className={cn(
            'mt-2 text-sm',
            error ? 'text-error-600' : 'text-secondary-600'
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea } 