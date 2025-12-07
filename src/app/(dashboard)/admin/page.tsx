'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import {
    MapPin,
    Calendar,
    CreditCard,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Filter
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
    totalFields: number
    totalBookings: number
    pendingPayments: number
    totalUsers: number
    todayBookings: number
    revenue: number
}

interface RecentBooking {
    id: string
    customer: string
    field: string
    time: string
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalFields: 0,
        totalBookings: 0,
        pendingPayments: 0,
        totalUsers: 0,
        todayBookings: 0,
        revenue: 0,
    })
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)
            try {
                const year = new Date().getFullYear()
                const res = await fetch(`/api/dashboard?month=${selectedMonth}&year=${year}`)
                const data = await res.json()

                if (data.stats) setStats(data.stats)
                if (data.recentBookings) setRecentBookings(data.recentBookings)
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [selectedMonth])

    const statCards = [
        { title: 'Total Lapangan', value: stats.totalFields, icon: <MapPin className="w-5 h-5" />, color: 'var(--accent)', bgColor: 'rgba(59, 130, 246, 0.15)', href: '/admin/fields' },
        { title: 'Total Booking', value: stats.totalBookings, icon: <Calendar className="w-5 h-5" />, color: 'var(--success)', bgColor: 'rgba(34, 197, 94, 0.15)', href: '/admin/bookings' },
        { title: 'Pending Verifikasi', value: stats.pendingPayments, icon: <CreditCard className="w-5 h-5" />, color: 'var(--warning)', bgColor: 'rgba(234, 179, 8, 0.15)', href: '/admin/payments' },
        { title: 'Total Pengguna', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)', href: '/admin/users' },
    ]

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Overview</h2>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <select
                        className="px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {months.map((m, idx) => (
                            <option key={idx} value={idx}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Grid - Responsive */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="h-full">
                            <CardContent className="p-3 flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: stat.bgColor, color: stat.color }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.title}</p>
                                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {loading ? '...' : stat.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Revenue & Summary - Responsive */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Revenue Card */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Pendapatan Bulan Ini</h3>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total revenue dari booking aktif</p>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                                <TrendingUp className="w-3 h-3" style={{ color: 'var(--success)' }} />
                                <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>+12.5%</span>
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(stats.revenue)}
                        </p>
                    </CardContent>
                </Card>

                {/* Today Summary */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Ringkasan Hari Ini</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Booking Hari Ini</span>
                                </div>
                                <span className="font-bold" style={{ color: 'var(--accent)' }}>{stats.todayBookings}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Dikonfirmasi</span>
                                </div>
                                <span className="font-bold" style={{ color: 'var(--success)' }}>{stats.totalBookings - stats.pendingPayments}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Menunggu</span>
                                </div>
                                <span className="font-bold" style={{ color: 'var(--warning)' }}>{stats.pendingPayments}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Booking Terbaru</h3>
                        <Link href="/admin/bookings" className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                            Lihat Semua
                        </Link>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {recentBookings.length === 0 ? (
                            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Tidak ada data</div>
                        ) : (
                            recentBookings.map((b) => (
                                <div key={b.id} className="p-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.customer}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.field}</p>
                                        </div>
                                        <Badge variant={b.status === 'CONFIRMED' ? 'success' : 'warning'}>
                                            {b.status === 'CONFIRMED' ? 'OK' : 'Pending'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{b.time}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden sm:block p-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Lapangan</TableHead>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.map((b) => (
                                    <TableRow key={b.id}>
                                        <TableCell className="font-medium">{b.customer}</TableCell>
                                        <TableCell>{b.field}</TableCell>
                                        <TableCell>{b.time}</TableCell>
                                        <TableCell>
                                            <Badge variant={b.status === 'CONFIRMED' ? 'success' : 'warning'}>
                                                {b.status === 'CONFIRMED' ? 'Dikonfirmasi' : 'Menunggu'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
