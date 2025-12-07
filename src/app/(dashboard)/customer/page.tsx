'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { Calendar, Clock, MapPin, ArrowRight, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Booking {
    id: string
    field: { name: string }
    bookingDate: string
    startTime: string
    endTime: string
    totalPrice: number
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

export default function CustomerDashboard() {
    const { user } = useAuth()
    const [recentBookings, setRecentBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchBookings() }, [])

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/bookings?limit=5')
            const data = await res.json()
            setRecentBookings(data.bookings || [])
        } catch { console.error('Error') } finally { setLoading(false) }
    }

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'CONFIRMED': return <Badge variant="success">Dikonfirmasi</Badge>
            case 'PENDING': return <Badge variant="warning">Menunggu</Badge>
            case 'CANCELLED': return <Badge variant="error">Dibatalkan</Badge>
            case 'COMPLETED': return <Badge variant="info">Selesai</Badge>
            default: return <Badge>{s}</Badge>
        }
    }

    const quickActions = [
        { title: 'Booking', icon: <Calendar className="w-5 h-5" />, href: '/customer/book', color: 'var(--accent)' },
        { title: 'Jadwal', icon: <Clock className="w-5 h-5" />, href: '/customer/schedule', color: 'var(--success)' },
        { title: 'Riwayat', icon: <MapPin className="w-5 h-5" />, href: '/customer/my-bookings', color: '#8b5cf6' },
    ]

    return (
        <div className="space-y-4">
            {/* Welcome */}
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)' }}>
                <h1 className="text-lg font-bold text-white">Hai, {user?.name}! 👋</h1>
                <p className="text-white/80 text-sm">Siap bermain hari ini?</p>
                <Link href="/customer/book">
                    <Button size="sm" className="mt-3" style={{ backgroundColor: 'white', color: 'var(--accent)' }}>
                        Booking <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
                {quickActions.map((a) => (
                    <Link key={a.title} href={a.href}>
                        <Card className="h-full">
                            <CardContent className="p-3 flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${a.color}20`, color: a.color }}>
                                    {a.icon}
                                </div>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{a.title}</span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent Bookings */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Booking Terbaru</h2>
                        <Link href="/customer/my-bookings" className="text-xs" style={{ color: 'var(--accent)' }}>Semua</Link>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: 'var(--accent)' }} />
                        </div>
                    ) : recentBookings.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Belum ada booking</p>
                            <Link href="/customer/book"><Button size="sm" className="mt-2">Buat Booking</Button></Link>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                            {recentBookings.map((b) => (
                                <div key={b.id} className="p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.field.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(b.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {b.startTime}-{b.endTime}
                                            </p>
                                        </div>
                                        {getStatusBadge(b.status)}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>{formatCurrency(b.totalPrice)}</span>
                                        <Link href={`/customer/my-bookings/${b.id}`}>
                                            <Button size="sm" variant="secondary"><Eye className="w-3 h-3" /> Detail</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
