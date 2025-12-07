'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
    Card,
    CardContent,
    Button,
    Badge,
    useToast
} from '@/components/ui'
import {
    ArrowLeft,
    Calendar,
    Clock,
    CreditCard,
    User,
    MapPin,
    CheckCircle,
    XCircle,
    Trash2,
    Mail,
    Phone
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
    notes?: string
    customer: {
        id: string
        name: string
        email: string
        phone?: string
    }
    field: {
        id: string
        name: string
        type: string
        pricePerHour: number
        images: { imageUrl: string }[]
    }
    payment?: {
        status: string
        proofImageUrl?: string
    }
}

export default function BookingDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToast } = useToast()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (params.id) {
            fetchBooking()
        }
    }, [params.id])

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/bookings/${params.id}`)
            if (!res.ok) throw new Error('Failed to fetch booking')
            const data = await res.json()
            setBooking(data.booking)
        } catch (error) {
            console.error('Error:', error)
            addToast('error', 'Gagal memuat data booking')
            router.push('/admin/bookings')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (newStatus: string) => {
        if (!booking || !confirm(`Ubah status menjadi ${newStatus}?`)) return

        setProcessing(true)
        try {
            const res = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) throw new Error('Gagal update status')

            addToast('success', 'Status berhasil diperbarui')
            fetchBooking()
        } catch (error) {
            addToast('error', 'Gagal mengubah status')
        } finally {
            setProcessing(false)
        }
    }

    const handleDelete = async () => {
        if (!booking || !confirm('Hapus booking ini permanen?Data tidak dapat dikembalikan.')) return

        setProcessing(true)
        try {
            const res = await fetch(`/api/bookings/${booking.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Gagal menghapus')

            addToast('success', 'Booking berhasil dihapus')
            router.push('/admin/bookings')
        } catch (error) {
            addToast('error', 'Gagal menghapus booking')
            setProcessing(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return <Badge variant="success">Dikonfirmasi</Badge>
            case 'COMPLETED': return <Badge variant="info">Selesai</Badge>
            case 'CANCELLED': return <Badge variant="error">Dibatalkan</Badge>
            default: return <Badge variant="warning">Menunggu</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)' }} />
            </div>
        )
    }

    if (!booking) return null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/bookings">
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                            Detail Booking
                            {getStatusBadge(booking.status)}
                        </h1>
                        <p className="font-mono text-sm mt-1" style={{ color: 'var(--text-muted)' }}>ID: {booking.id}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {booking.status === 'PENDING' && (
                        <>
                            <Button
                                variant="danger"
                                onClick={() => handleUpdateStatus('CANCELLED')}
                                loading={processing}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Batalkan
                            </Button>
                            <Button
                                onClick={() => handleUpdateStatus('CONFIRMED')}
                                loading={processing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Konfirmasi
                            </Button>
                        </>
                    )}
                    {(booking.status === 'CONFIRMED' || booking.status === 'CANCELLED') && (
                        <Button
                            variant="danger"
                            onClick={() => handleDelete()}
                            loading={processing}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Informasi Customer</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Nama Lengkap</p>
                                    <p className="font-medium text-lg">{booking.customer.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium">{booking.customer.email}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Nomor Telepon</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="font-medium">{booking.customer.phone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Detail Jadwal</h3>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <p className="text-sm text-gray-500 mb-1">Tanggal Booking</p>
                                    <p className="text-xl font-bold text-primary">
                                        {new Date(booking.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <p className="text-sm text-gray-500 mb-1">Waktu Main</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        <p className="text-xl font-bold text-primary">
                                            {booking.startTime} - {booking.endTime}
                                        </p>
                                        <span className="text-sm text-gray-500">({booking.durationHours} Jam)</span>
                                    </div>
                                </div>
                            </div>

                            {booking.notes && (
                                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800 rounded-xl">
                                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-500 mb-1">Catatan Tambahan:</p>
                                    <p className="text-yellow-800 dark:text-yellow-200">{booking.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Field Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Lapangan</h3>
                            </div>

                            {booking.field.images?.[0] && (
                                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                                    <img
                                        src={booking.field.images[0].imageUrl}
                                        alt={booking.field.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}

                            <h4 className="font-bold text-lg mb-1">{booking.field.name}</h4>
                            <Badge variant="info" className="mb-4">{booking.field.type}</Badge>

                            <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Harga per Jam</span>
                                <span className="font-medium">{formatCurrency(Number(booking.field.pricePerHour))}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Pembayaran</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Total Tagihan</span>
                                    <span className="text-xl font-bold text-primary">{formatCurrency(booking.totalPrice)}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Status Bayar</span>
                                    <Badge variant={
                                        booking.payment?.status === 'VERIFIED' ? 'success' :
                                            booking.payment?.status === 'REJECTED' ? 'error' : 'warning'
                                    }>
                                        {booking.payment?.status === 'VERIFIED' ? 'Lunas' :
                                            booking.payment?.status === 'REJECTED' ? 'Ditolak' : 'Belum Lunas'}
                                    </Badge>
                                </div>

                                {booking.payment?.proofImageUrl && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500 mb-2">Bukti Pembayaran:</p>
                                        <a
                                            href={booking.payment.proofImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block relative aspect-[4/3] rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
                                        >
                                            <img
                                                src={booking.payment.proofImageUrl}
                                                alt="Bukti Bayar"
                                                className="object-cover w-full h-full"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
