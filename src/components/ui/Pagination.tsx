'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  siblingCount?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  disabled?: boolean
}

const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ 
    className,
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    showPrevNext = true,
    siblingCount = 1,
    size = 'md',
    variant = 'default',
    disabled = false,
    ...props 
  }, ref) => {
    const generatePageNumbers = () => {
      const pages: (number | string)[] = []
      
      // Always show first page
      pages.push(1)
      
      // Calculate range around current page
      const startPage = Math.max(2, currentPage - siblingCount)
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount)
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...')
      }
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      
      // Always show last page (if more than 1 page)
      if (totalPages > 1) {
        pages.push(totalPages)
      }
      
      return pages
    }
    
    const pages = generatePageNumbers()
    
    const sizes = {
      sm: 'h-8 min-w-8 text-xs',
      md: 'h-10 min-w-10 text-sm',
      lg: 'h-12 min-w-12 text-base',
    }
    
    const variants = {
      default: {
        base: 'border border-secondary-300 bg-white text-secondary-900 hover:bg-secondary-50',
        active: 'border-primary-500 bg-primary-500 text-white hover:bg-primary-600',
        disabled: 'border-secondary-200 bg-secondary-100 text-secondary-400 cursor-not-allowed',
      },
      outline: {
        base: 'border border-secondary-300 bg-transparent text-secondary-900 hover:bg-secondary-50',
        active: 'border-primary-500 bg-primary-50 text-primary-600 hover:bg-primary-100',
        disabled: 'border-secondary-200 bg-transparent text-secondary-400 cursor-not-allowed',
      },
      ghost: {
        base: 'border-transparent bg-transparent text-secondary-900 hover:bg-secondary-50',
        active: 'border-transparent bg-primary-50 text-primary-600 hover:bg-primary-100',
        disabled: 'border-transparent bg-transparent text-secondary-400 cursor-not-allowed',
      },
    }

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <ul className="flex items-center gap-1">
          {/* First Page */}
          {showFirstLast && currentPage > 1 && (
            <li>
              <PaginationButton
                onClick={() => onPageChange(1)}
                disabled={disabled}
                size={size}
                variant={variant}
                aria-label="Go to first page"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </PaginationButton>
            </li>
          )}
          
          {/* Previous Page */}
          {showPrevNext && (
            <li>
              <PaginationButton
                onClick={() => onPageChange(currentPage - 1)}
                disabled={disabled || currentPage <= 1}
                size={size}
                variant={variant}
                aria-label="Go to previous page"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </PaginationButton>
            </li>
          )}
          
          {/* Page Numbers */}
          {pages.map((page, index) => (
            <li key={index}>
              {page === '...' ? (
                <PaginationEllipsis size={size} />
              ) : (
                <PaginationButton
                  onClick={() => onPageChange(page as number)}
                  disabled={disabled}
                  isActive={page === currentPage}
                  size={size}
                  variant={variant}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </PaginationButton>
              )}
            </li>
          ))}
          
          {/* Next Page */}
          {showPrevNext && (
            <li>
              <PaginationButton
                onClick={() => onPageChange(currentPage + 1)}
                disabled={disabled || currentPage >= totalPages}
                size={size}
                variant={variant}
                aria-label="Go to next page"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </PaginationButton>
            </li>
          )}
          
          {/* Last Page */}
          {showFirstLast && currentPage < totalPages && (
            <li>
              <PaginationButton
                onClick={() => onPageChange(totalPages)}
                disabled={disabled}
                size={size}
                variant={variant}
                aria-label="Go to last page"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </PaginationButton>
            </li>
          )}
        </ul>
      </nav>
    )
  }
)

Pagination.displayName = 'Pagination'

interface PaginationButtonProps extends HTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  disabled?: boolean
  size: 'sm' | 'md' | 'lg'
  variant: 'default' | 'outline' | 'ghost'
}

const PaginationButton = forwardRef<HTMLButtonElement, PaginationButtonProps>(
  ({ 
    className,
    isActive = false,
    disabled = false,
    size,
    variant,
    children,
    ...props 
  }, ref) => {
    const sizes = {
      sm: 'h-8 min-w-8 text-xs px-2',
      md: 'h-10 min-w-10 text-sm px-3',
      lg: 'h-12 min-w-12 text-base px-4',
    }
    
    const variants = {
      default: {
        base: 'border border-secondary-300 bg-white text-secondary-900 hover:bg-secondary-50',
        active: 'border-primary-500 bg-primary-500 text-white hover:bg-primary-600',
        disabled: 'border-secondary-200 bg-secondary-100 text-secondary-400 cursor-not-allowed',
      },
      outline: {
        base: 'border border-secondary-300 bg-transparent text-secondary-900 hover:bg-secondary-50',
        active: 'border-primary-500 bg-primary-50 text-primary-600 hover:bg-primary-100',
        disabled: 'border-secondary-200 bg-transparent text-secondary-400 cursor-not-allowed',
      },
      ghost: {
        base: 'border-transparent bg-transparent text-secondary-900 hover:bg-secondary-50',
        active: 'border-transparent bg-primary-50 text-primary-600 hover:bg-primary-100',
        disabled: 'border-transparent bg-transparent text-secondary-400 cursor-not-allowed',
      },
    }
    
    const variantStyles = variants[variant]
    const buttonStyle = disabled ? variantStyles.disabled : 
                       isActive ? variantStyles.active : 
                       variantStyles.base

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          sizes[size],
          buttonStyle,
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

PaginationButton.displayName = 'PaginationButton'

interface PaginationEllipsisProps {
  size: 'sm' | 'md' | 'lg'
}

const PaginationEllipsis = ({ size }: PaginationEllipsisProps) => {
  const sizes = {
    sm: 'h-8 min-w-8 text-xs',
    md: 'h-10 min-w-10 text-sm',
    lg: 'h-12 min-w-12 text-base',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-secondary-400',
        sizes[size]
      )}
      aria-hidden="true"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
      </svg>
    </span>
  )
}

export { Pagination } 