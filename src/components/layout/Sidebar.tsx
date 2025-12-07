'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
    Menu,
    X,
    Home,
    Calendar,
    Users,
    CreditCard,
    BarChart3,
    LogOut,
    MapPin,
    Clock,
    FileText,
    User
} from 'lucide-react'

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
}

const adminNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" /> },
    { label: 'Lapangan', href: '/admin/fields', icon: <MapPin className="w-5 h-5" /> },
    { label: 'Jadwal', href: '/admin/schedule', icon: <Clock className="w-5 h-5" /> },
    { label: 'Booking', href: '/admin/bookings', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Pembayaran', href: '/admin/payments', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Pengguna', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Laporan', href: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
]

const staffNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/staff', icon: <Home className="w-5 h-5" /> },
    { label: 'Jadwal', href: '/staff/schedule', icon: <Clock className="w-5 h-5" /> },
    { label: 'Booking', href: '/staff/bookings', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Pembayaran', href: '/staff/payments', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Laporan', href: '/staff/reports', icon: <BarChart3 className="w-5 h-5" /> },
]

const customerNavItems: NavItem[] = [
    { label: 'Beranda', href: '/customer', icon: <Home className="w-5 h-5" /> },
    { label: 'Booking Baru', href: '/customer/book', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Jadwal', href: '/customer/schedule', icon: <Clock className="w-5 h-5" /> },
    { label: 'Booking Saya', href: '/customer/my-bookings', icon: <FileText className="w-5 h-5" /> },
]

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const getNavItems = (): NavItem[] => {
        switch (user?.role) {
            case 'ADMIN':
                return adminNavItems
            case 'STAFF':
                return staffNavItems
            case 'CUSTOMER':
                return customerNavItems
            default:
                return []
        }
    }

    const navItems = getNavItems()

    const isActive = (href: string) => {
        if (href === `/${user?.role.toLowerCase()}`) {
            return pathname === href
        }
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Menu Button - Fixed position */}
            <button
                className="fixed top-4 left-4 z-50 p-2.5 rounded-xl lg:hidden shadow-lg"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                }}
                onClick={() => setMobileOpen(true)}
            >
                <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 min-h-screen flex flex-col
                    transition-all duration-300 ease-in-out
                    lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${collapsed ? 'w-[72px]' : 'w-56'}
                `}
                style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRight: '1px solid var(--border-color)',
                }}
            >
                {/* Header */}
                <div
                    className={`flex items-center h-14 px-3 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                    {!collapsed && (
                        <Link href="/" className="flex items-center gap-2">
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'var(--accent)' }}
                            >
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <span
                                className="font-bold text-base"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Danzyy Field
                            </span>
                        </Link>
                    )}

                    {collapsed && (
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'var(--accent)' }}
                        >
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                    )}

                    {/* Mobile Close */}
                    <button
                        className="p-1.5 rounded-lg lg:hidden hover:bg-[var(--bg-hover)] transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    {!collapsed && (
                        <button
                            className="p-1.5 rounded-lg hidden lg:flex items-center justify-center hover:bg-[var(--bg-hover)] transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                    {collapsed && (
                        <button
                            className="w-full p-2 rounded-lg mb-2 flex items-center justify-center hover:bg-[var(--bg-hover)] transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setCollapsed(false)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    transition-all duration-200 group
                                    ${collapsed ? 'justify-center px-2' : ''}
                                `}
                                style={{
                                    backgroundColor: active ? 'var(--accent)' : 'transparent',
                                    color: active ? 'white' : 'var(--text-secondary)',
                                    boxShadow: active ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                                }}
                                onClick={() => setMobileOpen(false)}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                                        e.currentTarget.style.color = 'var(--text-primary)'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                        e.currentTarget.style.color = 'var(--text-secondary)'
                                    }
                                }}
                            >
                                <span className={`flex-shrink-0 ${active ? '' : 'group-hover:scale-110'} transition-transform`}>
                                    {item.icon}
                                </span>
                                {!collapsed && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}
