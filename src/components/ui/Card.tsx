'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    style?: React.CSSProperties
}

export function Card({ children, className, hover = true, padding = 'md' }: CardProps) {
    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
    }

    return (
        <div
            className={cn(
                'rounded-xl transition-all duration-300',
                hover && 'hover:shadow-lg hover:-translate-y-0.5',
                paddings[padding],
                className
            )}
            style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow)',
            }}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: ReactNode
    className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div
            className={cn('pb-4 mb-4', className)}
            style={{ borderBottom: '1px solid var(--border-color)' }}
        >
            {children}
        </div>
    )
}

interface CardTitleProps {
    children: ReactNode
    className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3
            className={cn('text-lg font-semibold', className)}
            style={{ color: 'var(--text-primary)' }}
        >
            {children}
        </h3>
    )
}

interface CardDescriptionProps {
    children: ReactNode
    className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p
            className={cn('text-sm mt-1', className)}
            style={{ color: 'var(--text-secondary)' }}
        >
            {children}
        </p>
    )
}

interface CardContentProps {
    children: ReactNode
    className?: string
    style?: React.CSSProperties
}

export function CardContent({ children, className, style }: CardContentProps) {
    return (
        <div className={className} style={style}>
            {children}
        </div>
    )
}

interface CardFooterProps {
    children: ReactNode
    className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div
            className={cn('pt-4 mt-4 flex items-center gap-2', className)}
            style={{ borderTop: '1px solid var(--border-color)' }}
        >
            {children}
        </div>
    )
}
