'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    message: string
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (type: ToastType, message: string, duration?: number) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (type: ToastType, message: string, duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { id, type, message, duration }])
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

function ToastContainer({
    toasts,
    removeToast
}: {
    toasts: Toast[]
    removeToast: (id: string) => void
}) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                setIsExiting(true)
                setTimeout(onClose, 300)
            }, toast.duration)

            return () => clearTimeout(timer)
        }
    }, [toast.duration, onClose])

    const icons = {
        success: <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />,
        error: <XCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />,
        warning: <AlertCircle className="w-5 h-5" style={{ color: 'var(--warning)' }} />,
        info: <Info className="w-5 h-5" style={{ color: 'var(--accent)' }} />,
    }

    const borderColors = {
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--accent)',
    }

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-4 rounded-xl shadow-lg',
                isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
            )}
            style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderLeft: `4px solid ${borderColors[toast.type]}`,
            }}
        >
            {icons[toast.type]}
            <p
                className="flex-1 text-sm"
                style={{ color: 'var(--text-primary)' }}
            >
                {toast.message}
            </p>
            <button
                onClick={() => {
                    setIsExiting(true)
                    setTimeout(onClose, 300)
                }}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                }}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
