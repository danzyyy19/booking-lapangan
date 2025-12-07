'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

        const variants = {
            primary: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent',
            secondary: 'bg-transparent border border-border text-text-primary hover:bg-bg-hover focus:ring-accent',
            danger: 'bg-error text-white hover:opacity-90 focus:ring-error',
            ghost: 'bg-transparent text-text-primary hover:bg-bg-hover focus:ring-accent',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        }

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                style={{
                    backgroundColor: variant === 'primary' ? 'var(--accent)' :
                        variant === 'danger' ? 'var(--error)' :
                            variant === 'secondary' ? 'transparent' : 'transparent',
                    color: variant === 'primary' || variant === 'danger' ? 'white' : 'var(--text-primary)',
                    borderColor: variant === 'secondary' ? 'var(--border-color)' : 'transparent',
                }}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export { Button }
