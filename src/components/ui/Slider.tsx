'use client'

import { HTMLAttributes, forwardRef, useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
  showTicks?: boolean
  marks?: Array<{ value: number; label?: string }>
}

const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    className, 
    value,
    defaultValue = [50],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    orientation = 'horizontal',
    size = 'md',
    variant = 'default',
    showValue = false,
    showTicks = false,
    marks = [],
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const sliderRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const activeThumb = useRef<number>(-1)
    
    const currentValue = value !== undefined ? value : internalValue
    
    const setValue = (newValue: number[]) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }
    
    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100
    
    const getValueFromPosition = useCallback((clientX: number, clientY: number) => {
      if (!sliderRef.current) return min
      
      const rect = sliderRef.current.getBoundingClientRect()
      const isHorizontal = orientation === 'horizontal'
      
      const percentage = isHorizontal 
        ? (clientX - rect.left) / rect.width
        : 1 - (clientY - rect.top) / rect.height
      
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      
      return Math.max(min, Math.min(max, steppedValue))
    }, [min, max, step, orientation])
    
    const handleMouseDown = (event: React.MouseEvent, thumbIndex: number) => {
      if (disabled) return
      
      event.preventDefault()
      isDragging.current = true
      activeThumb.current = thumbIndex
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return
        
        const newValue = getValueFromPosition(e.clientX, e.clientY)
        const newValues = [...currentValue]
        newValues[activeThumb.current] = newValue
        
        // Ensure values don't cross over
        if (newValues.length > 1) {
          newValues.sort((a, b) => a - b)
        }
        
        setValue(newValues)
      }
      
      const handleMouseUp = () => {
        isDragging.current = false
        activeThumb.current = -1
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    const handleTrackClick = (event: React.MouseEvent) => {
      if (disabled || isDragging.current) return
      
      const newValue = getValueFromPosition(event.clientX, event.clientY)
      
      if (currentValue.length === 1) {
        setValue([newValue])
      } else {
        // Find closest thumb
        const distances = currentValue.map(val => Math.abs(val - newValue))
        const closestIndex = distances.indexOf(Math.min(...distances))
        const newValues = [...currentValue]
        newValues[closestIndex] = newValue
        newValues.sort((a, b) => a - b)
        setValue(newValues)
      }
    }
    
    const sizes = {
      sm: {
        track: orientation === 'horizontal' ? 'h-1' : 'w-1 h-32',
        thumb: 'h-4 w-4',
      },
      md: {
        track: orientation === 'horizontal' ? 'h-2' : 'w-2 h-40',
        thumb: 'h-5 w-5',
      },
      lg: {
        track: orientation === 'horizontal' ? 'h-3' : 'w-3 h-48',
        thumb: 'h-6 w-6',
      },
    }
    
    const variants = {
      default: 'bg-primary-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
    }

    return (
      <div 
        className={cn(
          'relative flex items-center',
          orientation === 'vertical' && 'flex-col h-48',
          className
        )} 
        {...props}
      >
        {/* Track */}
        <div
          ref={sliderRef}
          className={cn(
            'relative bg-secondary-200 rounded-full cursor-pointer',
            sizes[size].track,
            orientation === 'horizontal' ? 'flex-1' : 'flex-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={handleTrackClick}
        >
          {/* Progress */}
          {currentValue.length === 1 ? (
            <div
              className={cn(
                'absolute rounded-full transition-all',
                variants[variant],
                orientation === 'horizontal' 
                  ? `h-full left-0 top-0` 
                  : `w-full bottom-0 left-0`
              )}
              style={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${getPercentage(currentValue[0])}%`
              }}
            />
          ) : (
            <div
              className={cn(
                'absolute rounded-full transition-all',
                variants[variant],
                orientation === 'horizontal' 
                  ? `h-full top-0` 
                  : `w-full left-0`
              )}
              style={{
                [orientation === 'horizontal' ? 'left' : 'bottom']: `${getPercentage(Math.min(...currentValue))}%`,
                [orientation === 'horizontal' ? 'width' : 'height']: `${getPercentage(Math.max(...currentValue)) - getPercentage(Math.min(...currentValue))}%`
              }}
            />
          )}
          
          {/* Thumbs */}
          {currentValue.map((val, index) => (
            <div
              key={index}
              className={cn(
                'absolute bg-white border-2 rounded-full shadow-md cursor-grab active:cursor-grabbing transition-all transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
                sizes[size].thumb,
                disabled ? 'cursor-not-allowed' : 'cursor-grab',
                variant === 'default' ? 'border-primary-500 focus:ring-primary-500' :
                variant === 'success' ? 'border-success-500 focus:ring-success-500' :
                variant === 'warning' ? 'border-warning-500 focus:ring-warning-500' :
                'border-error-500 focus:ring-error-500'
              )}
              style={{
                [orientation === 'horizontal' ? 'left' : 'bottom']: `${getPercentage(val)}%`,
                [orientation === 'horizontal' ? 'top' : 'left']: '50%'
              }}
              onMouseDown={(e) => handleMouseDown(e, index)}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={val}
              aria-orientation={orientation}
              aria-disabled={disabled}
            />
          ))}
          
          {/* Marks */}
          {marks.map((mark) => (
            <div
              key={mark.value}
              className={cn(
                'absolute transform',
                orientation === 'horizontal' 
                  ? '-translate-x-1/2 top-full mt-1' 
                  : '-translate-y-1/2 left-full ml-1'
              )}
              style={{
                [orientation === 'horizontal' ? 'left' : 'bottom']: `${getPercentage(mark.value)}%`
              }}
            >
              <div className={cn(
                'w-1 h-1 bg-secondary-400 rounded-full',
                orientation === 'vertical' && 'w-1 h-1'
              )} />
              {mark.label && (
                <span className="text-xs text-secondary-500 mt-1 block text-center">
                  {mark.label}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Value Display */}
        {showValue && (
          <div className={cn(
            'text-sm font-medium text-secondary-700',
            orientation === 'horizontal' ? 'ml-3' : 'mt-3'
          )}>
            {currentValue.length === 1 
              ? currentValue[0] 
              : `${Math.min(...currentValue)} - ${Math.max(...currentValue)}`
            }
          </div>
        )}
      </div>
    )
  }
)

Slider.displayName = 'Slider'

export { Slider } 