'use client'

import { HTMLAttributes, forwardRef, createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
  variant: 'default' | 'pills' | 'underline' | 'bordered'
  size: 'sm' | 'md' | 'lg'
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  variant?: 'default' | 'pills' | 'underline' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className, 
    defaultValue, 
    value, 
    onValueChange, 
    variant = 'default',
    size = 'md',
    orientation = 'horizontal',
    children, 
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    
    const activeTab = value !== undefined ? value : internalValue
    const setActiveTab = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab, variant, size }}>
        <div
          ref={ref}
          className={cn(
            'w-full',
            orientation === 'vertical' && 'flex gap-4',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)

Tabs.displayName = 'Tabs'

const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { variant, size } = useTabsContext()
    
    const baseStyles = 'inline-flex items-center justify-center'
    
    const variants = {
      default: 'bg-secondary-100 p-1 rounded-lg',
      pills: 'space-x-1',
      underline: 'border-b border-secondary-200',
      bordered: 'border border-secondary-200 rounded-lg p-1 bg-secondary-50',
    }
    
    const sizes = {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12',
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== 'pills' && variant !== 'underline' && sizes[size],
          className
        )}
        role="tablist"
        {...props}
      />
    )
  }
)
TabsList.displayName = 'TabsList'

const TabsTrigger = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement> & {
  value: string
  disabled?: boolean
}>(
  ({ className, value, disabled = false, children, ...props }, ref) => {
    const { activeTab, setActiveTab, variant, size } = useTabsContext()
    const isActive = activeTab === value
    
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      default: cn(
        'rounded-md px-3 text-sm',
        isActive 
          ? 'bg-white text-secondary-900 shadow-sm' 
          : 'text-secondary-600 hover:text-secondary-900'
      ),
      pills: cn(
        'rounded-full px-4 text-sm',
        isActive 
          ? 'bg-primary-500 text-white shadow-sm' 
          : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
      ),
      underline: cn(
        'border-b-2 px-4 pb-2 text-sm',
        isActive 
          ? 'border-primary-500 text-primary-600' 
          : 'border-transparent text-secondary-600 hover:text-secondary-900'
      ),
      bordered: cn(
        'rounded-md px-3 text-sm',
        isActive 
          ? 'bg-white text-secondary-900 shadow-sm border border-secondary-200' 
          : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
      ),
    }
    
    const sizes = {
      sm: 'h-7 text-xs',
      md: 'h-8 text-sm',
      lg: 'h-10 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== 'underline' && sizes[size],
          className
        )}
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        onClick={() => !disabled && setActiveTab(value)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
  value: string
}>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab } = useTabsContext()
    const isActive = activeTab === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        className={cn(
          'mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          className
        )}
        role="tabpanel"
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent } 