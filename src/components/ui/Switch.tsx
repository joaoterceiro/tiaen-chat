'use client'

import { HTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ 
    className, 
    checked: controlledChecked,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    size = 'md',
    ...props 
  }, ref) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked)
    
    const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked
    
    const handleToggle = () => {
      if (disabled) return
      
      const newChecked = !isChecked
      
      if (controlledChecked === undefined) {
        setInternalChecked(newChecked)
      }
      
      onCheckedChange?.(newChecked)
    }

    const sizes = {
      sm: {
        switch: 'h-4 w-7',
        thumb: 'h-3 w-3',
        translate: 'translate-x-3'
      },
      md: {
        switch: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'translate-x-4'
      },
      lg: {
        switch: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'translate-x-5'
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          sizes[size].switch,
          isChecked 
            ? 'bg-primary-500' 
            : 'bg-secondary-200',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
            sizes[size].thumb,
            isChecked ? sizes[size].translate : 'translate-x-0'
          )}
        />
      </button>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch } 