'use client'

import { HTMLAttributes, ReactNode, forwardRef, useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface ComboBoxOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

export interface ComboBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: ComboBoxOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: ReactNode
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'underlined'
  filterable?: boolean
  clearable?: boolean
  loading?: boolean
  maxHeight?: string
}

const ComboBox = forwardRef<HTMLDivElement, ComboBoxProps>(
  ({ 
    className,
    options,
    value,
    defaultValue = '',
    onChange,
    onSearch,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No options found',
    disabled = false,
    size = 'md',
    variant = 'default',
    filterable = true,
    clearable = false,
    loading = false,
    maxHeight = '200px',
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    
    const currentValue = value !== undefined ? value : internalValue
    
    const setValue = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    }
    
    const filteredOptions = useMemo(() => {
      if (!filterable || !searchQuery) return options
      
      return options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }, [options, searchQuery, filterable])
    
    const groupedOptions = useMemo(() => {
      const groups: Record<string, ComboBoxOption[]> = {}
      
      filteredOptions.forEach(option => {
        const group = option.group || 'default'
        if (!groups[group]) {
          groups[group] = []
        }
        groups[group].push(option)
      })
      
      return groups
    }, [filteredOptions])
    
    const selectedOption = options.find(option => option.value === currentValue)
    
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setSearchQuery('')
          setHighlightedIndex(-1)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    
    useEffect(() => {
      if (onSearch) {
        onSearch(searchQuery)
      }
    }, [searchQuery, onSearch])
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)
      setHighlightedIndex(-1)
      if (!isOpen) setIsOpen(true)
    }
    
    const handleOptionSelect = (option: ComboBoxOption) => {
      if (option.disabled) return
      
      setValue(option.value)
      setIsOpen(false)
      setSearchQuery('')
      setHighlightedIndex(-1)
    }
    
    const handleClear = () => {
      setValue('')
      setSearchQuery('')
      setIsOpen(false)
      setHighlightedIndex(-1)
      inputRef.current?.focus()
    }
    
    const handleKeyDown = (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
          } else {
            setHighlightedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            )
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          if (isOpen) {
            setHighlightedIndex(prev => 
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            )
          }
          break
        case 'Enter':
          event.preventDefault()
          if (isOpen && highlightedIndex >= 0) {
            handleOptionSelect(filteredOptions[highlightedIndex])
          } else if (!isOpen) {
            setIsOpen(true)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSearchQuery('')
          setHighlightedIndex(-1)
          break
      }
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

    return (
      <div 
        ref={containerRef} 
        className={cn('relative', className)} 
        {...props}
      >
        <div
          className={cn(
            'flex items-center rounded-md transition-colors',
            sizes[size],
            variants[variant],
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={isOpen && filterable ? searchQuery : selectedOption?.label || ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => !disabled && setIsOpen(true)}
            placeholder={isOpen && filterable ? searchPlaceholder : placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none placeholder:text-secondary-500"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? 'combobox-listbox' : undefined}
            aria-autocomplete="list"
          />
          
          <div className="flex items-center gap-1">
            {clearable && currentValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-secondary-100 rounded"
                tabIndex={-1}
              >
                <svg className="h-4 w-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-secondary-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg
                className={cn(
                  'h-4 w-4 text-secondary-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-secondary-200 rounded-md shadow-lg">
            <ul
              ref={listRef}
              id="combobox-listbox"
              className="py-1 overflow-auto"
              style={{ maxHeight }}
              role="listbox"
            >
              {loading ? (
                <li className="px-3 py-2 text-sm text-secondary-500 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </div>
                </li>
              ) : filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-secondary-500 text-center">
                  {emptyMessage}
                </li>
              ) : (
                Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                  <div key={groupName}>
                    {groupName !== 'default' && (
                      <div className="px-3 py-1 text-xs font-medium text-secondary-500 bg-secondary-50 border-b border-secondary-100">
                        {groupName}
                      </div>
                    )}
                    {groupOptions.map((option, index) => {
                      const globalIndex = filteredOptions.indexOf(option)
                      const isHighlighted = globalIndex === highlightedIndex
                      const isSelected = option.value === currentValue
                      
                      return (
                        <li
                          key={option.value}
                          className={cn(
                            'px-3 py-2 text-sm cursor-pointer transition-colors',
                            isHighlighted && 'bg-secondary-100',
                            isSelected && 'bg-primary-50 text-primary-600 font-medium',
                            option.disabled && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => handleOptionSelect(option)}
                          role="option"
                          aria-selected={isSelected}
                        >
                          {option.label}
                        </li>
                      )
                    })}
                  </div>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    )
  }
)

ComboBox.displayName = 'ComboBox'

export { ComboBox } 