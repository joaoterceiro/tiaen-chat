'use client'

import { HTMLAttributes, forwardRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error'
  duration?: number
  onClose?: () => void
  title?: string
  description?: string
  action?: React.ReactNode
  closable?: boolean
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    className, 
    variant = 'default',
    duration = 5000,
    onClose,
    title,
    description,
    action,
    closable = true,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true)

    const variants = {
      default: 'bg-white border-secondary-200 text-secondary-900',
      success: 'bg-success-50 border-success-200 text-success-900',
      warning: 'bg-warning-50 border-warning-200 text-warning-900',
      error: 'bg-error-50 border-error-200 text-error-900',
    }

    const iconVariants = {
      default: (
        <svg className="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      success: (
        <svg className="h-5 w-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      warning: (
        <svg className="h-5 w-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      error: (
        <svg className="h-5 w-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }

    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300) // Aguarda animação
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    const handleClose = () => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
          'animate-in slide-in-from-right-full fill-mode-forwards',
          !isVisible && 'animate-out slide-out-to-right-full fill-mode-forwards',
          variants[variant],
          className
        )}
        {...props}
      >
        {/* Ícone */}
        <div className="flex-shrink-0 mt-0.5">
          {iconVariants[variant]}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-medium mb-1">
              {title}
            </div>
          )}
          
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
          
          {children}
          
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>

        {/* Botão fechar */}
        {closable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Toast.displayName = 'Toast'

// Container para Toasts
export interface ToastContainerProps extends HTMLAttributes<HTMLDivElement> {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const ToastContainer = forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ className, position = 'top-right', ...props }, ref) => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col gap-2 pointer-events-none',
          positions[position],
          className
        )}
        {...props}
      />
    )
  }
)

ToastContainer.displayName = 'ToastContainer'

export { Toast, ToastContainer } 