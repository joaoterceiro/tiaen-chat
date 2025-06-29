'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Variante do container */
  variant?: 'default' | 'centered' | 'full' | 'narrow'
  /** Se deve ter padding vertical */
  withPadding?: boolean
  /** Se deve ter fundo */
  withBackground?: boolean
  /** Altura mínima */
  minHeight?: 'screen' | 'auto' | 'content'
}

const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ 
    className,
    variant = 'default',
    withPadding = true,
    withBackground = true,
    minHeight = 'auto',
    children,
    ...props 
  }, ref) => {
    const variants = {
      default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      centered: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
      full: 'w-full px-4 sm:px-6 lg:px-8',
      narrow: 'max-w-2xl mx-auto px-4 sm:px-6',
    }

    const heights = {
      screen: 'min-h-screen',
      auto: 'min-h-auto',
      content: 'min-h-content',
    }

    const baseStyles = cn(
      variants[variant],
      heights[minHeight],
      withPadding && 'py-8',
      withBackground && 'bg-gradient-to-br from-secondary-50 to-primary-50'
    )

    return (
      <div
        ref={ref}
        className={cn(baseStyles, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PageContainer.displayName = 'PageContainer'

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Título da página */
  title: string
  /** Descrição opcional */
  description?: string
  /** Ações do header */
  actions?: React.ReactNode
  /** Se deve centralizar o conteúdo */
  centered?: boolean
}

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ 
    className,
    title,
    description,
    actions,
    centered = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mb-8',
          centered ? 'text-center' : 'flex items-start justify-between',
          className
        )}
        {...props}
      >
        <div className={cn(centered && 'mx-auto max-w-2xl')}>
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-secondary-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && !centered && (
          <div className="flex items-center gap-3 ml-6">
            {actions}
          </div>
        )}
        {actions && centered && (
          <div className="flex items-center justify-center gap-3 mt-6">
            {actions}
          </div>
        )}
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'

export interface PageContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout do conteúdo */
  layout?: 'single' | 'grid' | 'sidebar' | 'split'
  /** Espaçamento entre elementos */
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

const PageContent = forwardRef<HTMLDivElement, PageContentProps>(
  ({ 
    className,
    layout = 'single',
    spacing = 'lg',
    children,
    ...props 
  }, ref) => {
    const layouts = {
      single: '',
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      sidebar: 'grid grid-cols-1 lg:grid-cols-4',
      split: 'grid grid-cols-1 lg:grid-cols-2',
    }

    const spacings = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    }

    return (
      <div
        ref={ref}
        className={cn(
          layout !== 'single' && layouts[layout],
          layout !== 'single' && spacings[spacing],
          layout === 'single' && `space-y-${spacing === 'sm' ? '4' : spacing === 'md' ? '6' : spacing === 'lg' ? '8' : '12'}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

PageContent.displayName = 'PageContent'

export interface PageSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Título da seção */
  title?: string
  /** Descrição da seção */
  description?: string
  /** Ações da seção */
  actions?: React.ReactNode
  /** Variante da seção */
  variant?: 'default' | 'card' | 'bordered'
}

const PageSection = forwardRef<HTMLDivElement, PageSectionProps>(
  ({ 
    className,
    title,
    description,
    actions,
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const variants = {
      default: '',
      card: 'bg-white rounded-xl shadow-sm border border-secondary-200 p-6',
      bordered: 'border border-secondary-200 rounded-lg p-6',
    }

    return (
      <section
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {(title || description || actions) && (
          <div className="flex items-start justify-between mb-6">
            <div>
              {title && (
                <h2 className="text-xl md:text-2xl font-semibold text-secondary-900 mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-secondary-600">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3 ml-6">
                {actions}
              </div>
            )}
          </div>
        )}
        {children}
      </section>
    )
  }
)

PageSection.displayName = 'PageSection'

export { PageContainer, PageHeader, PageContent, PageSection } 