'use client'

import { InputHTMLAttributes, forwardRef, useMemo } from 'react'
import { cn, generateId } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'underlined'
  inputSize?: 'sm' | 'md' | 'lg'
  error?: boolean
  helperText?: string
  label?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = 'default', 
    inputSize = 'md', 
    error = false,
    helperText,
    label,
    startIcon,
    endIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = useMemo(() => id || generateId('input'), [id])
    
    const baseStyles = 'flex w-full rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
    
    const variants = {
      default: 'border-secondary-200 bg-white focus-visible:ring-primary-500',
      filled: 'border-transparent bg-secondary-100 focus-visible:ring-primary-500',
      underlined: 'border-0 border-b-2 border-secondary-200 bg-transparent rounded-none focus-visible:border-primary-500 focus-visible:ring-0',
    }
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-3 text-base',
      lg: 'h-12 px-4 text-lg',
    }

    const errorStyles = error ? 'border-error-500 focus-visible:ring-error-500' : ''
    const iconPadding = startIcon ? 'pl-10' : endIcon ? 'pr-10' : ''

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-2',
              error ? 'text-error-600' : 'text-secondary-700'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
              {startIcon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[inputSize],
              errorStyles,
              iconPadding,
              className
            )}
            ref={ref}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
              {endIcon}
            </div>
          )}
        </div>
        
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

Input.displayName = 'Input'

export { Input } 