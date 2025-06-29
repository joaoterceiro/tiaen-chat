'use client'

import { InputHTMLAttributes, forwardRef, createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface RadioGroupContextType {
  value: string
  setValue: (value: string) => void
  name: string
  disabled?: boolean
  size: 'sm' | 'md' | 'lg'
  variant: 'default' | 'success' | 'warning' | 'error'
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined)

const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext)
  if (!context) {
    throw new Error('Radio components must be used within a RadioGroup')
  }
  return context
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLDivElement>, 'onChange' | 'size'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    className, 
    value, 
    defaultValue = '',
    onValueChange, 
    name,
    size = 'md',
    variant = 'default',
    orientation = 'vertical',
    disabled = false,
    children, 
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    
    const currentValue = value !== undefined ? value : internalValue
    
    const setValue = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <RadioGroupContext.Provider value={{ 
        value: currentValue, 
        setValue, 
        name, 
        disabled,
        size,
        variant 
      }}>
        <div
          ref={ref}
          className={cn(
            'flex gap-3',
            orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
            className
          )}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value: string
  label?: string
  description?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className, 
    value,
    label,
    description,
    disabled: itemDisabled = false,
    id,
    ...props 
  }, ref) => {
    const { value: groupValue, setValue, name, disabled: groupDisabled, size, variant } = useRadioGroupContext()
    
    const isChecked = groupValue === value
    const isDisabled = groupDisabled || itemDisabled
    const radioId = id || `radio-${name}-${value}`
    
    const handleChange = () => {
      if (!isDisabled) {
        setValue(value)
      }
    }
    
    const baseStyles = 'peer relative cursor-pointer rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }
    
    const variants = {
      default: {
        unchecked: 'border-secondary-300 bg-white hover:border-secondary-400 focus:ring-primary-500',
        checked: 'border-primary-500 bg-white hover:border-primary-600 focus:ring-primary-500',
      },
      success: {
        unchecked: 'border-secondary-300 bg-white hover:border-secondary-400 focus:ring-success-500',
        checked: 'border-success-500 bg-white hover:border-success-600 focus:ring-success-500',
      },
      warning: {
        unchecked: 'border-secondary-300 bg-white hover:border-secondary-400 focus:ring-warning-500',
        checked: 'border-warning-500 bg-white hover:border-warning-600 focus:ring-warning-500',
      },
      error: {
        unchecked: 'border-secondary-300 bg-white hover:border-secondary-400 focus:ring-error-500',
        checked: 'border-error-500 bg-white hover:border-error-600 focus:ring-error-500',
      },
    }
    
    const currentVariant = variants[variant]
    const stateStyle = isChecked ? currentVariant.checked : currentVariant.unchecked

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center">
          <input
            ref={ref}
            type="radio"
            className="sr-only"
            id={radioId}
            name={name}
            value={value}
            checked={isChecked}
            onChange={handleChange}
            disabled={isDisabled}
            {...props}
          />
          <label
            htmlFor={radioId}
            className={cn(
              baseStyles,
              sizes[size],
              stateStyle,
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isChecked && (
              <div className="flex items-center justify-center h-full w-full">
                <div className={cn(
                  'rounded-full',
                  size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3 w-3',
                  variant === 'default' ? 'bg-primary-500' :
                  variant === 'success' ? 'bg-success-500' :
                  variant === 'warning' ? 'bg-warning-500' :
                  'bg-error-500'
                )} />
              </div>
            )}
          </label>
        </div>
        
        {(label || description) && (
          <div className="ml-3 flex-1">
            {label && (
              <label
                htmlFor={radioId}
                className={cn(
                  'block text-sm font-medium text-secondary-900 cursor-pointer',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                'text-sm text-secondary-500',
                isDisabled && 'opacity-50'
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

Radio.displayName = 'Radio'

export { RadioGroup, Radio } 