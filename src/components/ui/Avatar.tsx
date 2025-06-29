'use client'

import React, { HTMLAttributes, forwardRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallback?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', fallback, status, ...props }, ref) => {
    const [imageError, setImageError] = useState(false)
    
    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
      '2xl': 'h-20 w-20 text-2xl',
    }

    const statusColors = {
      online: 'bg-success-500',
      offline: 'bg-secondary-400',
      away: 'bg-warning-500',
      busy: 'bg-error-500',
    }

    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
      '2xl': 'h-5 w-5',
    }

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <div className={cn('relative inline-flex', className)} ref={ref} {...props}>
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-secondary-100 text-secondary-600 font-medium overflow-hidden',
            sizes[size]
          )}
        >
          {src && !imageError ? (
            <Image
              src={src}
              alt={alt || 'Avatar'}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : fallback ? (
            <span>{getInitials(fallback)}</span>
          ) : (
            <svg
              className="h-1/2 w-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>
        
        {status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              statusColors[status],
              statusSizes[size]
            )}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

// Componente AvatarGroup para múltiplos avatares
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number
  spacing?: 'tight' | 'normal' | 'loose'
  children: React.ReactNode
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 5, spacing = 'normal', children, ...props }, ref) => {
    const spacingStyles = {
      tight: '-space-x-1',
      normal: '-space-x-2',
      loose: '-space-x-1',
    }

    const childrenArray = Array.isArray(children) ? children : [children]
    const visibleChildren = childrenArray.slice(0, max)
    const remainingCount = Math.max(0, childrenArray.length - max)

    return (
      <div
        className={cn('flex items-center', spacingStyles[spacing], className)}
        ref={ref}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div key={index} className="ring-2 ring-white rounded-full">
            {child}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="ring-2 ring-white rounded-full">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary-200 text-secondary-600 text-sm font-medium">
              +{remainingCount}
            </div>
          </div>
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup } 