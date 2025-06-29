'use client'

import { HTMLAttributes, forwardRef, useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'underlined'
  format?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
  minDate?: Date
  maxDate?: Date
  showToday?: boolean
}

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  ({ 
    className,
    value,
    defaultValue,
    onChange,
    placeholder = 'Select date',
    disabled = false,
    size = 'md',
    variant = 'default',
    format = 'dd/mm/yyyy',
    minDate,
    maxDate,
    showToday = true,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState<Date | undefined>(defaultValue)
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState<Date>(() => {
      // Usar uma data fixa inicial para evitar problemas de hidratação
      return value || defaultValue || new Date(2024, 0, 1)
    })
    const [today, setToday] = useState<Date>(() => new Date(2024, 0, 1))
    const containerRef = useRef<HTMLDivElement>(null)
    
    // Atualizar para a data atual após a hidratação
    useEffect(() => {
      const currentDate = new Date()
      setToday(currentDate)
      if (!value && !defaultValue) {
        setViewDate(currentDate)
      }
    }, [value, defaultValue])
    
    const currentValue = value !== undefined ? value : internalValue
    
    const setValue = (date: Date | undefined) => {
      if (value === undefined) {
        setInternalValue(date)
      }
      onChange?.(date)
    }
    
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      
      switch (format) {
        case 'mm/dd/yyyy':
          return `${month}/${day}/${year}`
        case 'yyyy-mm-dd':
          return `${year}-${month}-${day}`
        default:
          return `${day}/${month}/${year}`
      }
    }
    
    const isDateDisabled = (date: Date) => {
      if (minDate && date < minDate) return true
      if (maxDate && date > maxDate) return true
      return false
    }
    
    const generateCalendar = useMemo(() => {
      const year = viewDate.getFullYear()
      const month = viewDate.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const days = []
      const current = new Date(startDate)
      
      for (let i = 0; i < 42; i++) {
        days.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
      
      return days
    }, [viewDate])
    
    const handleDateSelect = (date: Date) => {
      if (isDateDisabled(date)) return
      setValue(date)
      setIsOpen(false)
    }
    
    const handleToday = () => {
      setValue(today)
      setViewDate(today)
      setIsOpen(false)
    }
    
    const navigateMonth = (direction: 'prev' | 'next') => {
      setViewDate(prev => {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else {
          newDate.setMonth(newDate.getMonth() + 1)
        }
        return newDate
      })
    }
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    }
    
    const variants = {
      default: 'border border-secondary-300 bg-white focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500',
      filled: 'border border-secondary-300 bg-secondary-50 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500',
      underlined: 'border-0 border-b border-secondary-300 bg-transparent rounded-none focus-within:border-primary-500',
    }
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div ref={containerRef} className={cn('relative', className)} {...props}>
        <div
          className={cn(
            'flex items-center justify-between rounded-md cursor-pointer transition-colors',
            sizes[size],
            variants[variant],
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={cn(
            'flex-1',
            !currentValue && 'text-secondary-500'
          )}>
            {currentValue ? formatDate(currentValue) : placeholder}
          </span>
          
          <svg
            className={cn(
              'h-4 w-4 text-secondary-400 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
          </svg>
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg p-4 min-w-80">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-secondary-100 rounded"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-sm font-medium">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h3>
              
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-secondary-100 rounded"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Calendar */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-xs font-medium text-secondary-500 text-center p-2">
                  {day}
                </div>
              ))}
              
              {generateCalendar.map((date, index) => {
                const isCurrentMonth = date.getMonth() === viewDate.getMonth()
                const isSelected = currentValue && 
                  date.getDate() === currentValue.getDate() &&
                  date.getMonth() === currentValue.getMonth() &&
                  date.getFullYear() === currentValue.getFullYear()
                const isToday = 
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                const isDisabled = isDateDisabled(date)
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    disabled={isDisabled}
                    className={cn(
                      'text-sm p-2 rounded hover:bg-secondary-100 transition-colors',
                      !isCurrentMonth && 'text-secondary-400',
                      isSelected && 'bg-primary-500 text-white hover:bg-primary-600',
                      isToday && !isSelected && 'bg-secondary-100 font-medium',
                      isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                    )}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
            
            {/* Footer */}
            {showToday && (
              <div className="border-t border-secondary-200 pt-3">
                <button
                  type="button"
                  onClick={handleToday}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Today
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export { DatePicker } 