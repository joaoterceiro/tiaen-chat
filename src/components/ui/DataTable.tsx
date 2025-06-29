'use client'

import { HTMLAttributes, ReactNode, forwardRef, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface Column<T = any> {
  id: string
  header: ReactNode
  accessorKey?: keyof T
  cell?: (props: { row: T; value: any }) => ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T = any> extends HTMLAttributes<HTMLDivElement> {
  data: T[]
  columns: Column<T>[]
  sortable?: boolean
  selectable?: boolean
  selectedRows?: string[]
  onRowSelectionChange?: (selectedRows: string[]) => void
  onRowClick?: (row: T) => void
  getRowId?: (row: T, index: number) => string
  emptyMessage?: ReactNode
  loading?: boolean
  variant?: 'default' | 'striped' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  stickyHeader?: boolean
  maxHeight?: string
}

type SortDirection = 'asc' | 'desc' | null

const DataTable = forwardRef<HTMLDivElement, DataTableProps>(
  ({ 
    className,
    data,
    columns,
    sortable = false,
    selectable = false,
    selectedRows = [],
    onRowSelectionChange,
    onRowClick,
    getRowId = (_, index) => index.toString(),
    emptyMessage = 'No data available',
    loading = false,
    variant = 'default',
    size = 'md',
    stickyHeader = false,
    maxHeight,
    ...props 
  }, ref) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    
    const sortedData = useMemo(() => {
      if (!sortColumn || !sortDirection) return data
      
      return [...data].sort((a, b) => {
        const column = columns.find(col => col.id === sortColumn)
        if (!column?.accessorKey) return 0
        
        const aValue = a[column.accessorKey]
        const bValue = b[column.accessorKey]
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }, [data, sortColumn, sortDirection, columns])
    
    const handleSort = (columnId: string) => {
      if (!sortable) return
      
      const column = columns.find(col => col.id === columnId)
      if (!column?.sortable) return
      
      if (sortColumn === columnId) {
        setSortDirection(prev => 
          prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
        )
        if (sortDirection === 'desc') {
          setSortColumn(null)
        }
      } else {
        setSortColumn(columnId)
        setSortDirection('asc')
      }
    }
    
    const handleSelectAll = () => {
      if (!selectable || !onRowSelectionChange) return
      
      const allRowIds = data.map((row, index) => getRowId(row, index))
      const isAllSelected = allRowIds.every(id => selectedRows.includes(id))
      
      if (isAllSelected) {
        onRowSelectionChange([])
      } else {
        onRowSelectionChange(allRowIds)
      }
    }
    
    const handleRowSelect = (rowId: string) => {
      if (!selectable || !onRowSelectionChange) return
      
      if (selectedRows.includes(rowId)) {
        onRowSelectionChange(selectedRows.filter(id => id !== rowId))
      } else {
        onRowSelectionChange([...selectedRows, rowId])
      }
    }
    
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    }
    
    const cellPadding = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    }
    
    const variants = {
      default: 'border border-secondary-200',
      striped: 'border border-secondary-200',
      bordered: 'border-2 border-secondary-300',
    }

    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden rounded-lg', variants[variant], className)}
        {...props}
      >
        <div 
          className="overflow-auto"
          style={{ maxHeight }}
        >
          <table className={cn('w-full table-auto', sizes[size])}>
            <thead 
              className={cn(
                'bg-secondary-50 border-b border-secondary-200',
                stickyHeader && 'sticky top-0 z-10'
              )}
            >
              <tr>
                {selectable && (
                  <th className={cn('text-left font-medium text-secondary-900', cellPadding[size])}>
                    <input
                      type="checkbox"
                      checked={data.length > 0 && data.every((row, index) => 
                        selectedRows.includes(getRowId(row, index))
                      )}
                      onChange={handleSelectAll}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      'font-medium text-secondary-900',
                      cellPadding[size],
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && sortable && 'cursor-pointer hover:bg-secondary-100'
                    )}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && sortable && (
                        <div className="flex flex-col">
                          <svg
                            className={cn(
                              'h-3 w-3',
                              sortColumn === column.id && sortDirection === 'asc'
                                ? 'text-primary-600'
                                : 'text-secondary-400'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className={cn('text-center text-secondary-500', cellPadding[size])}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className={cn('text-center text-secondary-500', cellPadding[size])}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => {
                  const rowId = getRowId(row, index)
                  const isSelected = selectedRows.includes(rowId)
                  
                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        'border-b border-secondary-200 last:border-b-0 transition-colors',
                        variant === 'striped' && index % 2 === 1 && 'bg-secondary-50',
                        isSelected && 'bg-primary-50',
                        onRowClick && 'cursor-pointer hover:bg-secondary-50',
                        isSelected && onRowClick && 'hover:bg-primary-100'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className={cellPadding[size]}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelect(rowId)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                      )}
                      
                      {columns.map((column) => {
                        const value = column.accessorKey ? row[column.accessorKey] : undefined
                        const content = column.cell ? column.cell({ row, value }) : value
                        
                        return (
                          <td
                            key={column.id}
                            className={cn(
                              'text-secondary-900',
                              cellPadding[size],
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {content}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

DataTable.displayName = 'DataTable'

export { DataTable } 