'use client'

import { HTMLAttributes, forwardRef, useState, useRef, useEffect, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface SelectContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  value: string
  setValue: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size: 'sm' | 'md' | 'lg'
  variant: 'default' | 'filled' | 'underlined'
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

const useSelectContext = () => {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within a Select provider')
  }
  return context
}

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'underlined'
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    className, 
    value, 
    defaultValue = '',
    onValueChange, 
    placeholder = 'Select an option',
    disabled = false,
    size = 'md',
    variant = 'default',
    children, 
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)
    
    const currentValue = value !== undefined ? value : internalValue
    
    const setValue = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
      setIsOpen(false)
    }
    
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <SelectContext.Provider value={{ 
        isOpen, 
        setIsOpen, 
        value: currentValue, 
        setValue, 
        placeholder, 
        disabled,
        size,
        variant 
      }}>
        <div
          ref={selectRef}
          className={cn('relative w-full', className)}
          {...props}
        >
          {children}
        </div>
      </SelectContext.Provider>
    )
  }
)

Select.displayName = 'Select'

const SelectTrigger = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen, disabled, size, variant } = useSelectContext()
    
    const baseStyles = 'flex w-full items-center justify-between rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-3 text-sm',
      lg: 'h-11 px-4 text-base',
    }
    
    const variants = {
      default: 'border-secondary-200 bg-white hover:bg-secondary-50',
      filled: 'border-transparent bg-secondary-100 hover:bg-secondary-200',
      underlined: 'border-0 border-b-2 border-secondary-200 bg-transparent rounded-none hover:border-secondary-300 focus:border-primary-500',
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          baseStyles,
          sizes[size],
          variants[variant],
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...props}
      >
        {children}
        <svg
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const { value, placeholder } = useSelectContext()
    
    return (
      <span
        ref={ref}
        className={cn(
          'block truncate text-left',
          !value && 'text-secondary-500',
          className
        )}
        {...props}
      >
        {value || placeholder}
      </span>
    )
  }
)
SelectValue.displayName = 'SelectValue'

const SelectContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useSelectContext()
    
    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-1 w-full rounded-lg border border-secondary-200 bg-white py-1 shadow-lg animate-in fade-in-0 zoom-in-95',
          className
        )}
        role="listbox"
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = 'SelectContent'

const SelectItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
  value: string
  disabled?: boolean
}>(
  ({ className, value, disabled = false, children, ...props }, ref) => {
    const { value: selectedValue, setValue } = useSelectContext()
    const isSelected = selectedValue === value
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors',
          'hover:bg-secondary-100 focus:bg-secondary-100',
          isSelected && 'bg-primary-50 text-primary-600',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        role="option"
        aria-selected={isSelected}
        onClick={() => !disabled && setValue(value)}
        {...props}
      >
        {children}
        {isSelected && (
          <svg
            className="ml-auto h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    )
  }
)
SelectItem.displayName = 'SelectItem'

const SelectSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('my-1 h-px bg-secondary-200', className)}
      {...props}
    />
  )
)
SelectSeparator.displayName = 'SelectSeparator'

const SelectLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-3 py-2 text-xs font-medium text-secondary-500 uppercase tracking-wider', className)}
      {...props}
    />
  )
)
SelectLabel.displayName = 'SelectLabel'

export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem, 
  SelectSeparator, 
  SelectLabel 
} 