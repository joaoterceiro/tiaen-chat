'use client'

import React, { HTMLAttributes, ReactNode, forwardRef, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
  delayDuration?: number
  skipDelayDuration?: number
  disabled?: boolean
  variant?: 'default' | 'dark' | 'light' | 'error' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  arrow?: boolean
  children: ReactNode
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ 
    className,
    content,
    side = 'top',
    align = 'center',
    sideOffset = 4,
    alignOffset = 0,
    delayDuration = 700,
    skipDelayDuration = 300,
    disabled = false,
    variant = 'default',
    size = 'md',
    arrow = true,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const triggerRef = useRef<HTMLDivElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout>()
    const skipTimeoutRef = useRef<NodeJS.Timeout>()
    
    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current)
      }
    }, [])
    
    const calculatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return
      
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      
      let x = 0
      let y = 0
      
      // Calculate base position
      switch (side) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
          y = triggerRect.top - tooltipRect.height - sideOffset
          break
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
          y = triggerRect.bottom + sideOffset
          break
        case 'left':
          x = triggerRect.left - tooltipRect.width - sideOffset
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
          break
        case 'right':
          x = triggerRect.right + sideOffset
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
          break
      }
      
      // Apply alignment offset
      if (side === 'top' || side === 'bottom') {
        if (align === 'start') x = triggerRect.left + alignOffset
        if (align === 'end') x = triggerRect.right - tooltipRect.width - alignOffset
      } else {
        if (align === 'start') y = triggerRect.top + alignOffset
        if (align === 'end') y = triggerRect.bottom - tooltipRect.height - alignOffset
      }
      
      // Keep tooltip within viewport
      x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8))
      y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8))
      
      setPosition({ x, y })
    }
    
    const showTooltip = () => {
      if (disabled) return
      
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current)
        setIsVisible(true)
        setTimeout(calculatePosition, 0)
      } else {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(true)
          setTimeout(calculatePosition, 0)
        }, delayDuration)
      }
    }
    
    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      setIsVisible(false)
      
      skipTimeoutRef.current = setTimeout(() => {
        skipTimeoutRef.current = undefined
      }, skipDelayDuration)
    }
    
    const variants = {
      default: 'bg-secondary-900 text-white border-secondary-800',
      dark: 'bg-black text-white border-gray-800',
      light: 'bg-white text-secondary-900 border-secondary-200 shadow-lg',
      error: 'bg-error-500 text-white border-error-600',
      warning: 'bg-warning-500 text-white border-warning-600',
      success: 'bg-success-500 text-white border-success-600',
    }
    
    const sizes = {
      sm: 'px-2 py-1 text-xs max-w-xs',
      md: 'px-3 py-2 text-sm max-w-sm',
      lg: 'px-4 py-3 text-base max-w-md',
    }
    
    const getArrowStyles = () => {
      const arrowSize = size === 'sm' ? 4 : size === 'md' ? 5 : 6
      const arrowColor = variant === 'light' ? 'white' : 
                        variant === 'dark' ? 'black' :
                        variant === 'error' ? '#ef4444' :
                        variant === 'warning' ? '#f59e0b' :
                        variant === 'success' ? '#10b981' :
                        '#1f2937'
      
      switch (side) {
        case 'top':
          return {
            bottom: -arrowSize,
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid transparent`,
            borderTop: `${arrowSize}px solid ${arrowColor}`,
          }
        case 'bottom':
          return {
            top: -arrowSize,
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid ${arrowColor}`,
          }
        case 'left':
          return {
            right: -arrowSize,
            top: '50%',
            transform: 'translateY(-50%)',
            borderTop: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid transparent`,
            borderLeft: `${arrowSize}px solid ${arrowColor}`,
          }
        case 'right':
          return {
            left: -arrowSize,
            top: '50%',
            transform: 'translateY(-50%)',
            borderTop: `${arrowSize}px solid transparent`,
            borderBottom: `${arrowSize}px solid transparent`,
            borderRight: `${arrowSize}px solid ${arrowColor}`,
          }
        default:
          return {}
      }
    }

    return (
      <>
        <div
          ref={triggerRef}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
          className="inline-block"
        >
          {children}
        </div>
        
        {isVisible && !disabled && (
          <div
            ref={tooltipRef}
            className={cn(
              'fixed z-50 rounded-md border pointer-events-none',
              'animate-in fade-in-0 zoom-in-95',
              variants[variant],
              sizes[size],
              className
            )}
            style={{
              left: position.x,
              top: position.y,
            }}
            role="tooltip"
            {...props}
          >
            {content}
            
            {arrow && (
              <div
                className="absolute"
                style={getArrowStyles()}
              />
            )}
          </div>
        )}
      </>
    )
  }
)

Tooltip.displayName = 'Tooltip'

export { Tooltip } 