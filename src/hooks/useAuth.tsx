'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'STAFF' | 'CUSTOMER'
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
    logout: () => Promise<void>
    register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000 // 1 minute before logout

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [showWarning, setShowWarning] = useState(false)
    const router = useRouter()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const clearTimeouts = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current)
            warningTimeoutRef.current = null
        }
    }, [])

    const logout = useCallback(async () => {
        clearTimeouts()
        setShowWarning(false)
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
        } catch (error) {
            console.error('Logout error:', error)
        }
        setUser(null)
        router.push('/login')
    }, [router, clearTimeouts])

    const resetInactivityTimer = useCallback(() => {
        if (!user) return

        clearTimeouts()
        setShowWarning(false)

        // Set warning timeout (4 minutes)
        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(true)
        }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT)

        // Set logout timeout (5 minutes)
        timeoutRef.current = setTimeout(() => {
            logout()
        }, INACTIVITY_TIMEOUT)
    }, [user, logout, clearTimeouts])

    const refreshUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me')
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                return { success: false, error: data.error || 'Login failed' }
            }

            setUser(data.user)
            return { success: true, user: data.user }
        } catch {
            return { success: false, error: 'Network error' }
        }
    }, [])

    const register = useCallback(async (data: { email: string; password: string; name: string; phone?: string }) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!res.ok) {
                return { success: false, error: result.error || 'Registration failed' }
            }

            setUser(result.user)
            return { success: true }
        } catch {
            return { success: false, error: 'Network error' }
        }
    }, [])

    // Initial load
    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    // Setup activity listeners for auto-logout
    useEffect(() => {
        if (!user) {
            clearTimeouts()
            return
        }

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

        const handleActivity = () => {
            resetInactivityTimer()
        }

        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true })
        })

        resetInactivityTimer()

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity)
            })
            clearTimeouts()
        }
    }, [user, resetInactivityTimer, clearTimeouts])

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
            {children}
            {showWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                            Session Timeout Warning
                        </h3>
                        <p className="mb-6 text-slate-600 dark:text-slate-400">
                            Anda akan logout dalam 1 menit karena tidak ada aktivitas. Klik tombol di bawah untuk tetap login.
                        </p>
                        <div className="flex gap-3">
                            <button
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                                onClick={() => {
                                    resetInactivityTimer()
                                }}
                            >
                                Tetap Login
                            </button>
                            <button
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
