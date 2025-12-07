'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

export function Skeleton({
    className,
    variant = 'text',
    width,
    height,
}: SkeletonProps) {
    const variants = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    }

    return (
        <div
            className={cn(
                'animate-pulse',
                variants[variant],
                className
            )}
            style={{
                backgroundColor: 'var(--bg-secondary)',
                width: width,
                height: height || (variant === 'text' ? '1em' : undefined),
            }}
        />
    )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-color)' }}
        >
            {/* Header */}
            <div
                className="flex gap-4 p-4"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="flex gap-4 p-4"
                    style={{ borderTop: '1px solid var(--border-color)' }}
                >
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div
            className="rounded-xl p-5"
            style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
            }}
        >
            <Skeleton className="h-40 w-full mb-4" variant="rectangular" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16" variant="rectangular" />
                <Skeleton className="h-6 w-20" variant="rectangular" />
            </div>
        </div>
    )
}
