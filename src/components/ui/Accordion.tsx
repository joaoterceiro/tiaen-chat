'use client'

import { HTMLAttributes, ReactNode, forwardRef, createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface AccordionContextType {
  value: string | string[]
  setValue: (value: string) => void
  type: 'single' | 'multiple'
  disabled?: boolean
  variant: 'default' | 'bordered' | 'separated'
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined)

const useAccordionContext = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion')
  }
  return context
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  disabled?: boolean
  variant?: 'default' | 'bordered' | 'separated'
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ 
    className, 
    type = 'single',
    value,
    defaultValue = type === 'multiple' ? [] : '',
    onValueChange,
    collapsible = false,
    disabled = false,
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    
    const currentValue = value !== undefined ? value : internalValue
    
    const setValue = (newValue: string | string[]) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }
    
    const toggleItem = (itemValue: string) => {
      if (type === 'single') {
        const currentSingle = currentValue as string
        if (currentSingle === itemValue && collapsible) {
          setValue('')
        } else {
          setValue(itemValue)
        }
      } else {
        const currentMultiple = currentValue as string[]
        if (currentMultiple.includes(itemValue)) {
          setValue(currentMultiple.filter(v => v !== itemValue))
        } else {
          setValue([...currentMultiple, itemValue])
        }
      }
    }
    
    const isItemOpen = (itemValue: string) => {
      if (type === 'single') {
        return currentValue === itemValue
      } else {
        return (currentValue as string[]).includes(itemValue)
      }
    }

    return (
      <AccordionContext.Provider value={{ 
        value: currentValue, 
        setValue: toggleItem, 
        type, 
        disabled,
        variant 
      }}>
        <div
          ref={ref}
          className={cn(
            'w-full',
            variant === 'bordered' && 'border border-secondary-200 rounded-lg',
            variant === 'separated' && 'space-y-2',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)

Accordion.displayName = 'Accordion'

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ 
    className, 
    value,
    disabled: itemDisabled = false,
    children,
    ...props 
  }, ref) => {
    const { disabled: groupDisabled, variant } = useAccordionContext()
    const isDisabled = groupDisabled || itemDisabled

    return (
      <div
        ref={ref}
        className={cn(
          'group',
          variant === 'default' && 'border-b border-secondary-200 last:border-b-0',
          variant === 'separated' && 'border border-secondary-200 rounded-lg',
          isDisabled && 'opacity-50',
          className
        )}
        data-state={isDisabled ? 'disabled' : 'enabled'}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AccordionItem.displayName = 'AccordionItem'

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string
  children: ReactNode
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ 
    className, 
    value,
    children,
    ...props 
  }, ref) => {
    const { setValue, disabled, variant } = useAccordionContext()
    const context = useAccordionContext()
    
    const isOpen = context.type === 'single' 
      ? context.value === value 
      : (context.value as string[]).includes(value)

    return (
      <button
        ref={ref}
        className={cn(
          'flex w-full items-center justify-between py-4 text-left font-medium transition-all',
          'hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          variant === 'default' && 'px-0',
          variant === 'bordered' && 'px-4 first:rounded-t-lg',
          variant === 'separated' && 'px-4 rounded-lg',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        onClick={() => !disabled && setValue(value)}
        disabled={disabled}
        aria-expanded={isOpen}
        data-state={isOpen ? 'open' : 'closed'}
        {...props}
      >
        {children}
        <svg
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
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

AccordionTrigger.displayName = 'AccordionTrigger'

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string
  children: ReactNode
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ 
    className, 
    value,
    children,
    ...props 
  }, ref) => {
    const { variant } = useAccordionContext()
    const context = useAccordionContext()
    
    const isOpen = context.type === 'single' 
      ? context.value === value 
      : (context.value as string[]).includes(value)

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'animate-in slide-in-from-top-1' : 'animate-out slide-out-to-top-1 h-0',
          !isOpen && 'hidden'
        )}
        data-state={isOpen ? 'open' : 'closed'}
      >
        <div
          className={cn(
            'pb-4 pt-0 text-secondary-600',
            variant === 'default' && 'px-0',
            variant === 'bordered' && 'px-4',
            variant === 'separated' && 'px-4',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)

AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } 