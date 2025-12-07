'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar, Navbar } from '@/components/layout'
import { Skeleton } from '@/components/ui'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <div className="text-center">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto animate-pulse mb-4"
                        style={{ backgroundColor: 'var(--accent)' }}
                    >
                        <span className="text-white text-xl">⚡</span>
                    </div>
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div
            className="min-h-screen flex"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
