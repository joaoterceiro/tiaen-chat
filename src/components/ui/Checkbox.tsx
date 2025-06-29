'use client'

import { InputHTMLAttributes, forwardRef, useState, useMemo } from 'react'
import { cn, generateId } from '@/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  label?: string
  description?: string
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    size = 'md', 
    variant = 'default',
    label,
    description,
    checked,
    defaultChecked,
    indeterminate = false,
    onCheckedChange,
    onChange,
    disabled = false,
    id,
    ...props 
  }, ref) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked || false)
    
    const isChecked = checked !== undefined ? checked : internalChecked
    const checkboxId = useMemo(() => id || generateId('checkbox'), [id])
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked
      
      if (checked === undefined) {
        setInternalChecked(newChecked)
      }
      
      onCheckedChange?.(newChecked)
      onChange?.(event)
    }
    
    const baseStyles = 'peer relative cursor-pointer rounded border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }
    
    const variants = {
      default: {
        unchecked: 'border-secondary-300 bg-white hover:border-secondary-400 focus:ring-primary-500',
        checked: 'border-primary-500 bg-primary-500 hover:bg-primary-600 focus:ring-primary-500',
        indeterminate: 'border-primary-500 bg-primary-500 hover:bg-primary-600 focus:ring-primary-500',
      },
      success: {
        unchecked: 'border-secondary-300 bg-white hover:border-secondary-400 focus:ring-success-500',
        checked: 'border-success-500 bg-success-500 hover:bg-success-600 focus:ring-success-500',
        indeterminate: 'border-success-500 bg-success-500 hover:bg-success-600 focus:ring-success-500',
      },
      warning: {
        unchecked: 'border-secondary-300 bg-white hover:border-secondary-400 focus:ring-warning-500',
        checked: 'border-warning-500 bg-warning-500 hover:bg-warning-600 focus:ring-warning-500',
        indeterminate: 'border-warning-500 bg-warning-500 hover:bg-warning-600 focus:ring-warning-500',
      },
      error: {
        unchecked: 'border-secondary-300 bg-white hover:border-secondary-400 focus:ring-error-500',
        checked: 'border-error-500 bg-error-500 hover:bg-error-600 focus:ring-error-500',
        indeterminate: 'border-error-500 bg-error-500 hover:bg-error-600 focus:ring-error-500',
      },
    }
    
    const currentVariant = variants[variant]
    const stateStyle = indeterminate ? currentVariant.indeterminate : 
                     isChecked ? currentVariant.checked : currentVariant.unchecked

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            id={checkboxId}
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              baseStyles,
              sizes[size],
              stateStyle,
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {(isChecked || indeterminate) && (
              <div className="flex items-center justify-center h-full w-full">
                {indeterminate ? (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </label>
        </div>
        
        {(label || description) && (
          <div className="ml-3 flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'block text-sm font-medium text-secondary-900 cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-sm text-secondary-500',
                disabled && 'opacity-50'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox } 