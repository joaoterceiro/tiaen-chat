'use client'

import { HTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'transparent' | 'bordered'
  position?: 'static' | 'sticky' | 'fixed'
  size?: 'sm' | 'md' | 'lg'
}

const Navigation = forwardRef<HTMLElement, NavigationProps>(
  ({ className, variant = 'default', position = 'static', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'w-full z-40 transition-all duration-200'
    
    const variants = {
      default: 'bg-white border-b border-secondary-200 shadow-sm',
      transparent: 'bg-white/80 backdrop-blur-sm border-b border-secondary-200/50',
      bordered: 'bg-white border border-secondary-200 rounded-lg shadow-sm',
    }
    
    const positions = {
      static: 'relative',
      sticky: 'sticky top-0',
      fixed: 'fixed top-0 left-0 right-0',
    }
    
    const sizes = {
      sm: 'h-12',
      md: 'h-16',
      lg: 'h-20',
    }

    return (
      <nav
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          positions[position],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </nav>
    )
  }
)

Navigation.displayName = 'Navigation'

// Sub-componentes do Navigation
const NavContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full', className)}
      {...props}
    />
  )
)
NavContainer.displayName = 'NavContainer'

const NavContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between h-full', className)}
      {...props}
    />
  )
)
NavContent.displayName = 'NavContent'

const NavBrand = forwardRef<HTMLDivElement | HTMLAnchorElement, HTMLAttributes<HTMLDivElement> & {
  href?: string
}>(
  ({ className, href, ...props }, ref) => {
    if (href) {
      const { onToggle, ...anchorProps } = props as any
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cn('flex items-center space-x-3 text-decoration-none', className)}
          {...anchorProps}
        />
      )
    }
    
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn('flex items-center space-x-3', className)}
        {...props}
      />
    )
  }
)
NavBrand.displayName = 'NavBrand'

const NavMenu = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
  mobile?: boolean
}>(
  ({ className, mobile = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center space-x-1',
        mobile && 'flex-col space-x-0 space-y-1 w-full',
        className
      )}
      {...props}
    />
  )
)
NavMenu.displayName = 'NavMenu'

const NavItem = forwardRef<HTMLAnchorElement, HTMLAttributes<HTMLAnchorElement> & {
  href?: string
  active?: boolean
  disabled?: boolean
}>(
  ({ className, active = false, disabled = false, children, href, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      className={cn(
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        'hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        active ? 'bg-primary-50 text-primary-600' : 'text-secondary-700',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
)
NavItem.displayName = 'NavItem'

// Mobile Navigation Toggle
const NavToggle = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean
  onToggle?: () => void
}>(
  ({ className, isOpen = false, onToggle, ...props }, ref) => (
    <button
      ref={ref}
      onClick={onToggle}
      className={cn(
        'md:hidden p-2 rounded-lg text-secondary-700 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      {...props}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  )
)
NavToggle.displayName = 'NavToggle'

// Mobile Navigation Menu
const NavMobile = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
  isOpen?: boolean
}>(
  ({ className, isOpen = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'md:hidden overflow-hidden transition-all duration-300',
        isOpen ? 'max-h-96 border-t border-secondary-200' : 'max-h-0',
        className
      )}
      {...props}
    >
      <div className="px-4 py-3 space-y-1">
        {children}
      </div>
    </div>
  )
)
NavMobile.displayName = 'NavMobile'

export { 
  Navigation, 
  NavContainer, 
  NavContent, 
  NavBrand, 
  NavMenu, 
  NavItem, 
  NavToggle, 
  NavMobile 
} 