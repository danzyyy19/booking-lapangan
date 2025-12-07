'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import {
    Calendar,
    CreditCard,
    CheckCircle,
    Eye,
    Check,
    X
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui'

interface Payment {
    id: string
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
    proofImageUrl?: string
    createdAt: string
    booking: {
        id: string
        totalPrice: number
        bookingDate: string
        field: { name: string }
        customer: { name: string }
    }
}

export default function StaffDashboard() {
    const { addToast } = useToast()
    const [stats, setStats] = useState({
        totalBookings: 0,
        confirmed: 0,
        pending: 0,
    })
    const [pendingPayments, setPendingPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const today = new Date()
            const [dashRes, payRes] = await Promise.all([
                fetch(`/api/dashboard?month=${today.getMonth()}&year=${today.getFullYear()}`),
                fetch('/api/payments?status=PENDING')
            ])
            const dashData = await dashRes.json()
            const payData = await payRes.json()

            // FIX: Access data from stats object
            setStats({
                totalBookings: dashData.stats?.totalBookings || 0,
                confirmed: dashData.stats?.pendingPayments || 0, // This is actually confirmed from API
                pending: pendingPayments.length,
            })
            setPendingPayments(payData.payments || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (paymentId: string) => {
        try {
            const res = await fetch(`/api/payments/${paymentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'VERIFIED' })
            })
            if (!res.ok) throw new Error()
            addToast('success', 'Pembayaran diverifikasi')
            fetchData()
        } catch {
            addToast('error', 'Gagal memverifikasi')
        }
    }

    const handleReject = async (paymentId: string) => {
        try {
            const res = await fetch(`/api/payments/${paymentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' })
            })
            if (!res.ok) throw new Error()
            addToast('success', 'Pembayaran ditolak')
            fetchData()
        } catch {
            addToast('error', 'Gagal menolak')
        }
    }

    const statCards = [
        {
            title: 'Booking Bulan Ini',
            value: stats.totalBookings,
            icon: <Calendar className="w-5 h-5" />,
            color: 'var(--accent)',
            bgColor: 'rgba(59, 130, 246, 0.15)',
        },
        {
            title: 'Menunggu Verifikasi',
            value: pendingPayments.length,
            icon: <CreditCard className="w-5 h-5" />,
            color: 'var(--warning)',
            bgColor: 'rgba(234, 179, 8, 0.15)',
        },
        {
            title: 'Dikonfirmasi',
            value: stats.confirmed,
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'var(--success)',
            bgColor: 'rgba(34, 197, 94, 0.15)',
        },
    ]

    return (
        <div className="space-y-4">
            {/* Stats - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-3 flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
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
                ))}
            </div>

            {/* Pending Payments */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            Pembayaran Menunggu Verifikasi
                        </h3>
                        <Link href="/staff/payments">
                            <Button size="sm" variant="secondary">Lihat Semua</Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: 'var(--accent)' }} />
                        </div>
                    ) : pendingPayments.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Tidak ada pembayaran pending</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="block sm:hidden divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                {pendingPayments.slice(0, 5).map((payment) => (
                                    <div key={payment.id} className="p-3 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                                    {payment.booking?.customer?.name || 'N/A'}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {payment.booking?.field?.name}
                                                </p>
                                            </div>
                                            <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>
                                                {formatCurrency(payment.booking?.totalPrice || 0)}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {payment.proofImageUrl && (
                                                <Button size="sm" variant="secondary" onClick={() => window.open(payment.proofImageUrl, '_blank')}>
                                                    <Eye className="w-3 h-3" /> Bukti
                                                </Button>
                                            )}
                                            {payment.proofImageUrl ? (
                                                <>
                                                    <Button size="sm" className="flex-1" onClick={() => handleVerify(payment.id)}>
                                                        <Check className="w-3 h-3" /> Verify
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleReject(payment.id)}>
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum upload bukti</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Lapangan</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingPayments.slice(0, 5).map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">{payment.booking?.customer?.name || 'N/A'}</TableCell>
                                                <TableCell>{payment.booking?.field?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {payment.booking?.bookingDate ? new Date(payment.booking.bookingDate).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    }) : '-'}
                                                </TableCell>
                                                <TableCell className="font-medium" style={{ color: 'var(--accent)' }}>
                                                    {formatCurrency(payment.booking?.totalPrice || 0)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {payment.proofImageUrl && (
                                                            <Button size="sm" variant="secondary" onClick={() => window.open(payment.proofImageUrl, '_blank')}>
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {payment.proofImageUrl ? (
                                                            <>
                                                                <Button size="sm" onClick={() => handleVerify(payment.id)}>
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                                <Button size="sm" variant="danger" onClick={() => handleReject(payment.id)}>
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum upload</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
