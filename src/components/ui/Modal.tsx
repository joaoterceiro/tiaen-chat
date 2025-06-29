'use client'

import { HTMLAttributes, forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    className, 
    open, 
    onClose, 
    size = 'md', 
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    children, 
    ...props 
  }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null)

    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4',
    }

    // Fechar modal com ESC
    useEffect(() => {
      if (!closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, onClose, closeOnEscape])

    // Gerenciar foco
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
        modalRef.current?.focus()
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [open])

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose()
      }
    }

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleOverlayClick}
        />
        
        {/* Modal */}
        <div
          ref={modalRef}
          className={cn(
            'relative z-50 w-full bg-white rounded-xl shadow-2xl transition-all',
            'focus:outline-none',
            sizes[size],
            className
          )}
          tabIndex={-1}
          {...props}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-lg p-1 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {children}
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

// Sub-componentes do Modal
const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2 p-6 pb-4', className)}
      {...props}
    />
  )
)
ModalHeader.displayName = 'ModalHeader'

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-xl font-semibold leading-none tracking-tight text-secondary-900', className)}
      {...props}
    />
  )
)
ModalTitle.displayName = 'ModalTitle'

const ModalDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-secondary-600', className)}
      {...props}
    />
  )
)
ModalDescription.displayName = 'ModalDescription'

const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4', className)}
      {...props}
    />
  )
)
ModalContent.displayName = 'ModalContent'

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-3 p-6 pt-4 border-t border-secondary-200', className)}
      {...props}
    />
  )
)
ModalFooter.displayName = 'ModalFooter'

const ModalTrigger = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}>(
  ({ className, asChild = false, children, ...props }, ref) => {
    if (asChild) {
      return children as React.ReactElement
    }

    return (
      <button
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
ModalTrigger.displayName = 'ModalTrigger'

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, ModalTrigger } 