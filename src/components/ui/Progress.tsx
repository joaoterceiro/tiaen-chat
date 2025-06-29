'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient'
  showValue?: boolean
  animated?: boolean
  striped?: boolean
  label?: string
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100,
    size = 'md',
    variant = 'default',
    showValue = false,
    animated = false,
    striped = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const baseStyles = 'w-full bg-secondary-200 rounded-full overflow-hidden'
    
    const sizes = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
      xl: 'h-4',
    }
    
    const variants = {
      default: 'bg-primary-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      gradient: 'bg-gradient-to-r from-primary-500 to-primary-600',
    }
    
    const stripedPattern = striped ? 'bg-stripes' : ''
    const animatedClass = animated ? 'animate-pulse' : ''

    return (
      <div className={cn('w-full', className)} {...props} ref={ref}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-2">
            {label && (
              <span className="text-sm font-medium text-secondary-700">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-sm text-secondary-500">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div
          className={cn(baseStyles, sizes[size])}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out rounded-full',
              variants[variant],
              stripedPattern,
              animatedClass
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

// Circular Progress Component
export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
  label?: string
}

const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100,
    size = 120,
    strokeWidth = 8,
    variant = 'default',
    showValue = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    const colors = {
      default: 'stroke-primary-500',
      success: 'stroke-success-500',
      warning: 'stroke-warning-500',
      error: 'stroke-error-500',
    }

    return (
      <div 
        className={cn('relative inline-flex items-center justify-center', className)} 
        {...props} 
        ref={ref}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-secondary-200"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn('transition-all duration-300 ease-out', colors[variant])}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {showValue && (
              <div className="text-lg font-semibold text-secondary-900">
                {Math.round(percentage)}%
              </div>
            )}
            {label && (
              <div className="text-xs text-secondary-500 mt-1">
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'

// Step Progress Component
export interface StepProgressProps extends HTMLAttributes<HTMLDivElement> {
  steps: Array<{
    id: string
    title: string
    description?: string
  }>
  currentStep: number
  variant?: 'default' | 'success' | 'warning' | 'error'
}

const StepProgress = forwardRef<HTMLDivElement, StepProgressProps>(
  ({ 
    className, 
    steps,
    currentStep,
    variant = 'default',
    ...props 
  }, ref) => {
    const colors = {
      default: {
        active: 'bg-primary-500 border-primary-500 text-white',
        completed: 'bg-primary-500 border-primary-500 text-white',
        pending: 'bg-white border-secondary-300 text-secondary-500',
        line: 'bg-primary-500',
      },
      success: {
        active: 'bg-success-500 border-success-500 text-white',
        completed: 'bg-success-500 border-success-500 text-white',
        pending: 'bg-white border-secondary-300 text-secondary-500',
        line: 'bg-success-500',
      },
      warning: {
        active: 'bg-warning-500 border-warning-500 text-white',
        completed: 'bg-warning-500 border-warning-500 text-white',
        pending: 'bg-white border-secondary-300 text-secondary-500',
        line: 'bg-warning-500',
      },
      error: {
        active: 'bg-error-500 border-error-500 text-white',
        completed: 'bg-error-500 border-error-500 text-white',
        pending: 'bg-white border-secondary-300 text-secondary-500',
        line: 'bg-error-500',
      },
    }

    return (
      <div className={cn('w-full', className)} {...props} ref={ref}>
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isActive = index === currentStep
            const isPending = index > currentStep
            
            let stepClasses = colors[variant].pending
            if (isCompleted) stepClasses = colors[variant].completed
            if (isActive) stepClasses = colors[variant].active

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors',
                      stepClasses
                    )}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  
                  <div className="mt-2 text-center">
                    <div className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-secondary-900' : 'text-secondary-500'
                    )}>
                      {step.title}
                    </div>
                    {step.description && (
                      <div className="text-xs text-secondary-400 mt-1">
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px mx-4 bg-secondary-200">
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        isCompleted ? colors[variant].line : 'bg-transparent'
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

StepProgress.displayName = 'StepProgress'

export { Progress, CircularProgress, StepProgress } 