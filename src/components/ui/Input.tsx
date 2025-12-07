'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={cn(
                        'w-full px-3.5 py-2.5 text-sm rounded-lg transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        error ? 'border-error focus:ring-error/30' : 'focus:ring-accent/30',
                        className
                    )}
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: error ? 'var(--error)' : 'var(--border-color)',
                    }}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm" style={{ color: 'var(--error)' }}>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
