'use client'

import React, { HTMLAttributes, ReactNode, forwardRef, createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { cn, generateId } from '@/lib/utils'

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerId: string
  contentId: string
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined)

const useDropdownContext = () => {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown')
  }
  return context
}

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ 
    className, 
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
    children,
    ...props 
  }, ref) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const containerRef = useRef<HTMLDivElement>(null)
    
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    
    const setOpen = useCallback((open: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(open)
      }
      onOpenChange?.(open)
    }, [controlledOpen, onOpenChange])

    const { triggerId, contentId } = useMemo(() => ({
      triggerId: generateId('dropdown-trigger'),
      contentId: generateId('dropdown-content')
    }), [])

    // Close on escape key or click outside
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          setOpen(false)
        }
      }

      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, setOpen])

    return (
      <DropdownContext.Provider value={{ open: isOpen, setOpen, triggerId, contentId }}>
        <div
          ref={containerRef}
          className={cn('relative inline-block', className)}
          {...props}
        >
          {children}
        </div>
      </DropdownContext.Provider>
    )
  }
)

Dropdown.displayName = 'Dropdown'

export interface DropdownTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  disabled?: boolean
}

const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, asChild = false, disabled = false, children, ...props }, ref) => {
    const { open, setOpen, triggerId } = useDropdownContext()

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        id: triggerId,
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        onClick: (e: React.MouseEvent) => {
          if (!disabled) {
            setOpen(!open)
          }
          children.props.onClick?.(e)
        },
        ...children.props,
      } as any)
    }

    return (
      <button
        ref={ref}
        id={triggerId}
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

DropdownTrigger.displayName = 'DropdownTrigger'

export interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  alignOffset?: number
}

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ 
    className, 
    align = 'start',
    side = 'bottom',
    sideOffset = 4,
    alignOffset = 0,
    children,
    ...props 
  }, ref) => {
    const { open, contentId } = useDropdownContext()

    if (!open) return null

    const alignmentStyles = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    }

    const sideStyles = {
      top: 'bottom-full mb-1',
      bottom: 'top-full mt-1',
      left: 'right-full mr-1',
      right: 'left-full ml-1',
    }

    return (
      <div
        ref={ref}
        id={contentId}
        role="menu"
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-secondary-200 bg-white shadow-lg',
          'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          alignmentStyles[align],
          sideStyles[side],
          className
        )}
        style={{
          marginTop: side === 'bottom' ? sideOffset : undefined,
          marginBottom: side === 'top' ? sideOffset : undefined,
          marginLeft: side === 'right' ? sideOffset : undefined,
          marginRight: side === 'left' ? sideOffset : undefined,
          left: align === 'center' ? `calc(50% + ${alignOffset}px)` : undefined,
        }}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    )
  }
)

DropdownContent.displayName = 'DropdownContent'

export interface DropdownItemProps extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean
  destructive?: boolean
  inset?: boolean
}

const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, disabled = false, destructive = false, inset = false, children, ...props }, ref) => {
    const { setOpen } = useDropdownContext()

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'transition-colors focus:bg-secondary-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          destructive 
            ? 'text-error-600 focus:bg-error-50 focus:text-error-600' 
            : 'hover:bg-secondary-100',
          inset && 'pl-8',
          className
        )}
        disabled={disabled}
        onClick={(e) => {
          props.onClick?.(e)
          setOpen(false)
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

DropdownItem.displayName = 'DropdownItem'

export interface DropdownSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('-mx-1 my-1 h-px bg-secondary-200', className)}
      {...props}
    />
  )
)

DropdownSeparator.displayName = 'DropdownSeparator'

export interface DropdownLabelProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ className, inset = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-sm font-semibold text-secondary-900',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
)

DropdownLabel.displayName = 'DropdownLabel'

export { 
  Dropdown, 
  DropdownTrigger, 
  DropdownContent, 
  DropdownItem, 
  DropdownSeparator, 
  DropdownLabel 
} 