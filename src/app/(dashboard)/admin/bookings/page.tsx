'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@/components/ui'
import { useToast } from '@/components/ui'
import {
    Search,
    Eye,
    XCircle,
    CheckCircle,
    Trash2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Booking {
    id: string
    bookingDate: string
    startTime: string
    endTime: string
    durationHours: number
    totalPrice: number
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    customer: { id: string; name: string; email: string }
    field: { id: string; name: string; type: string }
    payment?: { status: string }
}

const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'PENDING', label: 'Menunggu' },
    { value: 'CONFIRMED', label: 'Dikonfirmasi' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' },
]

export default function AdminBookingsPage() {
    const { addToast } = useToast()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchBookings()
    }, [statusFilter])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            let url = '/api/bookings'
            if (statusFilter !== 'all') url += `?status=${statusFilter}`
            const res = await fetch(url)
            const data = await res.json()
            setBookings(data.bookings || [])
        } catch {
            addToast('error', 'Gagal memuat data')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`Ubah status ke ${newStatus}?`)) return
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error()
            addToast('success', 'Status diperbarui')
            fetchBookings()
        } catch {
            addToast('error', 'Gagal update')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus permanen?')) return
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            addToast('success', 'Dihapus')
            fetchBookings()
        } catch {
            addToast('error', 'Gagal hapus')
        }
    }

    const filteredBookings = bookings.filter((b) => {
        const q = search.toLowerCase()
        return b.customer?.name?.toLowerCase().includes(q) || b.field?.name?.toLowerCase().includes(q) || b.id.includes(q)
    })

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'CONFIRMED': return <Badge variant="success">Dikonfirmasi</Badge>
            case 'COMPLETED': return <Badge variant="info">Selesai</Badge>
            case 'CANCELLED': return <Badge variant="error">Dibatalkan</Badge>
            default: return <Badge variant="warning">Menunggu</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Data Booking</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kelola semua pemesanan lapangan</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <Input placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} />
                    </div>
                </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: 'var(--accent)' }} />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <Card><CardContent className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Tidak ada booking</CardContent></Card>
                ) : (
                    filteredBookings.map((b) => (
                        <Card key={b.id}>
                            <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.customer?.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.field?.name}</p>
                                    </div>
                                    {getStatusBadge(b.status)}
                                </div>
                                <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    <span>{new Date(b.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                    <span>{b.startTime} - {b.endTime}</span>
                                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>{formatCurrency(b.totalPrice)}</span>
                                </div>
                                <div className="flex gap-1 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <Link href={`/admin/bookings/${b.id}`} className="flex-1">
                                        <Button size="sm" variant="secondary" className="w-full"><Eye className="w-3 h-3" /> Detail</Button>
                                    </Link>
                                    {b.status === 'PENDING' && (
                                        <>
                                            <Button size="sm" onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}><CheckCircle className="w-3 h-3" /></Button>
                                            <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}><XCircle className="w-3 h-3" /></Button>
                                        </>
                                    )}
                                    {b.status === 'CANCELLED' && (
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}><Trash2 className="w-3 h-3" /></Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table */}
            <Card padding="none" className="hidden sm:block">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Lapangan</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Tidak ada booking</TableCell></TableRow>
                            ) : (
                                filteredBookings.map((b) => (
                                    <TableRow key={b.id}>
                                        <TableCell>
                                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.customer?.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.customer?.email}</p>
                                        </TableCell>
                                        <TableCell>{b.field?.name}</TableCell>
                                        <TableCell>
                                            <p className="text-sm">{new Date(b.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.startTime} - {b.endTime}</p>
                                        </TableCell>
                                        <TableCell className="font-medium" style={{ color: 'var(--accent)' }}>{formatCurrency(b.totalPrice)}</TableCell>
                                        <TableCell>{getStatusBadge(b.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/admin/bookings/${b.id}`}>
                                                    <Button size="sm" variant="secondary"><Eye className="w-4 h-4" /></Button>
                                                </Link>
                                                {b.status === 'PENDING' && (
                                                    <>
                                                        <Button size="sm" onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}><CheckCircle className="w-4 h-4" /></Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}><XCircle className="w-4 h-4" /></Button>
                                                    </>
                                                )}
                                                {b.status === 'CANCELLED' && (
                                                    <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4" /></Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
