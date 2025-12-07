'use client'

import { cn } from '@/lib/utils'

interface BadgeProps {
    children: React.ReactNode
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
    className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: {
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--border-color)',
        },
        success: {
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: 'var(--success)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
        },
        warning: {
            backgroundColor: 'rgba(234, 179, 8, 0.15)',
            color: 'var(--warning)',
            borderColor: 'rgba(234, 179, 8, 0.3)',
        },
        error: {
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--error)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
        },
        info: {
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--accent)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
        },
    }

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                className
            )}
            style={variants[variant]}
        >
            {children}
        </span>
    )
}
