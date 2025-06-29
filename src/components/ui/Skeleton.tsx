'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
  lines?: number
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'default',
    animation = 'pulse',
    width,
    height,
    lines = 1,
    style,
    ...props 
  }, ref) => {
    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse', // Could be enhanced with custom wave animation
      none: '',
    }
    
    const variants = {
      default: 'bg-secondary-200 rounded',
      text: 'bg-secondary-200 rounded h-4',
      circular: 'bg-secondary-200 rounded-full',
      rectangular: 'bg-secondary-200',
    }
    
    const getSkeletonStyle = () => {
      const baseStyle: React.CSSProperties = { ...style }
      
      if (width !== undefined) {
        baseStyle.width = typeof width === 'number' ? `${width}px` : width
      }
      
      if (height !== undefined) {
        baseStyle.height = typeof height === 'number' ? `${height}px` : height
      }
      
      return baseStyle
    }

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                variants.text,
                animations[animation],
                index === lines - 1 && 'w-3/4' // Last line is shorter
              )}
              style={getSkeletonStyle()}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          animations[animation],
          className
        )}
        style={getSkeletonStyle()}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Predefined skeleton components for common use cases
export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {}

const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, ...props }, ref) => {
    return <Skeleton ref={ref} variant="text" lines={lines} {...props} />
  }
)

SkeletonText.displayName = 'SkeletonText'

export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant'> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    }
    
    return (
      <Skeleton
        ref={ref}
        variant="circular"
        className={cn(sizes[size], className)}
        {...props}
      />
    )
  }
)

SkeletonAvatar.displayName = 'SkeletonAvatar'

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  hasAvatar?: boolean
  hasImage?: boolean
  lines?: number
  animation?: 'pulse' | 'wave' | 'none'
}

const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ 
    className, 
    hasAvatar = false,
    hasImage = false,
    lines = 3,
    animation = 'pulse',
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-4 border border-secondary-200 rounded-lg space-y-4', className)}
        {...props}
      >
        {hasImage && (
          <Skeleton
            variant="rectangular"
            height={200}
            animation={animation}
            className="w-full"
          />
        )}
        
        <div className="space-y-3">
          {hasAvatar && (
            <div className="flex items-center space-x-3">
              <SkeletonAvatar animation={animation} />
              <div className="flex-1 space-y-2">
                <Skeleton
                  variant="text"
                  width="40%"
                  animation={animation}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  animation={animation}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Skeleton
              variant="text"
              width="90%"
              animation={animation}
            />
            {Array.from({ length: lines - 1 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                width={index === lines - 2 ? "70%" : "100%"}
                animation={animation}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
)

SkeletonCard.displayName = 'SkeletonCard'

export interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number
  columns?: number
  hasHeader?: boolean
  animation?: 'pulse' | 'wave' | 'none'
}

const SkeletonTable = forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ 
    className, 
    rows = 5,
    columns = 4,
    hasHeader = true,
    animation = 'pulse',
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('border border-secondary-200 rounded-lg overflow-hidden', className)}
        {...props}
      >
        <div className="w-full">
          {hasHeader && (
            <div className="bg-secondary-50 border-b border-secondary-200 p-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="text"
                    height={16}
                    animation={animation}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="divide-y divide-secondary-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="p-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton
                      key={colIndex}
                      variant="text"
                      height={16}
                      width={colIndex === 0 ? "80%" : colIndex === columns - 1 ? "60%" : "100%"}
                      animation={animation}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)

SkeletonTable.displayName = 'SkeletonTable'

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonCard, 
  SkeletonTable 
} 