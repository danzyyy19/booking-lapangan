'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    showCloseButton?: boolean
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true
}: ModalProps) {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-2xl',
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 animate-fade-in"
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative z-10 w-full mx-4 animate-scale-in',
                    sizes[size]
                )}
            >
                <div
                    className="rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div
                            className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                            style={{ borderBottom: '1px solid var(--border-color)' }}
                        >
                            {title && (
                                <h2
                                    className="text-base font-semibold"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Body - Scrollable */}
                    <div className="px-5 py-4 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
