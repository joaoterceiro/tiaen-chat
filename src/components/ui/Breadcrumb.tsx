'use client'

import { HTMLAttributes, ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  separator?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'pills'
}

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    className, 
    separator = <BreadcrumbSeparator />,
    size = 'md',
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    }

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(sizes[size], className)}
        {...props}
      >
        <ol className="flex items-center space-x-1">
          {children}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  isCurrentPage?: boolean
}

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ 
    className, 
    isCurrentPage = false,
    children,
    ...props 
  }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          'flex items-center',
          isCurrentPage && 'text-secondary-900 font-medium',
          !isCurrentPage && 'text-secondary-500',
          className
        )}
        aria-current={isCurrentPage ? 'page' : undefined}
        {...props}
      >
        {children}
      </li>
    )
  }
)

BreadcrumbItem.displayName = 'BreadcrumbItem'

export interface BreadcrumbLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string
  asChild?: boolean
  disabled?: boolean
}

const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ 
    className, 
    href,
    asChild = false,
    disabled = false,
    children,
    ...props 
  }, ref) => {
    const Component = asChild ? 'span' : 'a'

    return (
      <Component
        ref={ref}
        href={!asChild ? href : undefined}
        className={cn(
          'transition-colors hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

BreadcrumbLink.displayName = 'BreadcrumbLink'

export interface BreadcrumbPageProps extends HTMLAttributes<HTMLSpanElement> {}

const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ 
    className, 
    children,
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn(
          'font-medium text-secondary-900',
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

BreadcrumbPage.displayName = 'BreadcrumbPage'

export interface BreadcrumbSeparatorProps extends HTMLAttributes<HTMLLIElement> {
  children?: ReactNode
}

const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ 
    className, 
    children,
    ...props 
  }, ref) => {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn(
          'flex items-center text-secondary-400',
          className
        )}
        {...props}
      >
        {children ?? (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </li>
    )
  }
)

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

export interface BreadcrumbEllipsisProps extends HTMLAttributes<HTMLSpanElement> {}

const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ 
    className, 
    ...props 
  }, ref) => {
    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn(
          'flex h-9 w-9 items-center justify-center text-secondary-400',
          className
        )}
        {...props}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
        </svg>
        <span className="sr-only">More</span>
      </span>
    )
  }
)

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'

export { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator,
  BreadcrumbEllipsis 
} 