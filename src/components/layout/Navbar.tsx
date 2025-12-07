'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { User, LogOut } from 'lucide-react'

export function Navbar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getPageTitle = () => {
        const segments = pathname.split('/').filter(Boolean)
        if (segments.length === 0) return 'Beranda'

        const lastSegment = segments[segments.length - 1]
        const titles: Record<string, string> = {
            'admin': 'Dashboard Admin',
            'staff': 'Dashboard Staff',
            'customer': 'Beranda',
            'fields': 'Kelola Lapangan',
            'bookings': 'Kelola Booking',
            'payments': 'Verifikasi Pembayaran',
            'users': 'Kelola Pengguna',
            'reports': 'Laporan',
            'book': 'Booking Baru',
            'schedule': 'Jadwal Lapangan',
            'my-bookings': 'Booking Saya',
        }

        return titles[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    }

    return (
        <header
            className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
            }}
        >
            {/* Left - Page Title */}
            <div className="flex items-center gap-4 ml-12 lg:ml-0">
                <h1
                    className="text-lg font-bold tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle - Visible on all devices */}
                <ThemeToggle />

                {/* User Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-4 focus:outline-none"
                        style={{ borderLeft: '1px solid var(--border-color)' }}
                    >
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{user?.role?.toLowerCase()}</p>
                        </div>
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)'
                            }}
                        >
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </button>

                    {isProfileOpen && (
                        <div
                            className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                            }}
                        >
                            <div className="px-4 py-3 border-b lg:hidden" style={{ borderColor: 'var(--border-color)' }}>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                            </div>

                            <div className="p-1">
                                <button
                                    onClick={logout}
                                    className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
