'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, Badge, Button, Select, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { useToast } from '@/components/ui'
import {
    Calendar,
    Upload,
    Eye,
    X
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Booking {
    id: string
    field: { id: string; name: string; type: string }
    bookingDate: string
    startTime: string
    endTime: string
    durationHours: number
    totalPrice: number
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    payment?: {
        id: string
        status: 'PENDING' | 'VERIFIED' | 'REJECTED'
        proofImageUrl?: string
        notes?: string
    }
}

export default function MyBookingsPage() {
    const { addToast } = useToast()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [uploadModal, setUploadModal] = useState<Booking | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/bookings')
            const data = await res.json()
            setBookings(data.bookings || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 1024 * 1024) {
            addToast('error', 'Max 1MB')
            return
        }
        if (!file.type.startsWith('image/')) {
            addToast('error', 'Harus gambar')
            return
        }
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setPreviewUrl(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleUploadProof = async () => {
        if (!uploadModal || !selectedFile) return
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
            if (!uploadRes.ok) throw new Error()
            const uploadData = await uploadRes.json()

            const payRes = await fetch(`/api/payments/${uploadModal.payment?.id || uploadModal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proofImageUrl: uploadData.url })
            })
            if (!payRes.ok) throw new Error()
            addToast('success', 'Bukti berhasil diupload!')
            setUploadModal(null)
            setSelectedFile(null)
            setPreviewUrl('')
            fetchBookings()
        } catch {
            addToast('error', 'Gagal upload')
        } finally {
            setUploading(false)
        }
    }

    const handleCancelBooking = async (id: string) => {
        if (!confirm('Batalkan booking?')) return
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CANCELLED' })
            })
            if (!res.ok) throw new Error()
            addToast('success', 'Booking dibatalkan')
            fetchBookings()
        } catch {
            addToast('error', 'Gagal')
        }
    }

    const filteredBookings = bookings.filter((b) => {
        if (filter === 'all') return true
        return b.status === filter
    })

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'CONFIRMED': return <Badge variant="success">Konfirmasi</Badge>
            case 'COMPLETED': return <Badge variant="info">Selesai</Badge>
            case 'CANCELLED': return <Badge variant="error">Batal</Badge>
            default: return <Badge variant="warning">Menunggu</Badge>
        }
    }

    const getPaymentBadge = (s?: string) => {
        switch (s) {
            case 'VERIFIED': return <Badge variant="success">Lunas</Badge>
            case 'REJECTED': return <Badge variant="error">Ditolak</Badge>
            default: return <Badge variant="warning">Belum</Badge>
        }
    }

    const filterOptions = [
        { value: 'all', label: 'Semua' },
        { value: 'PENDING', label: 'Menunggu' },
        { value: 'CONFIRMED', label: 'Konfirmasi' },
        { value: 'COMPLETED', label: 'Selesai' },
        { value: 'CANCELLED', label: 'Batal' },
    ]

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Booking Saya</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Riwayat pemesanan</p>
                </div>
                <div className="flex gap-2">
                    <Select value={filter} onChange={(e) => setFilter(e.target.value)} options={filterOptions} />
                    <Link href="/customer/book">
                        <Button size="sm">+ Booking</Button>
                    </Link>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: 'var(--accent)' }} />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>Tidak ada booking</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredBookings.map((booking) => (
                        <Card key={booking.id}>
                            <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{booking.field.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{booking.field.type}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {getStatusBadge(booking.status)}
                                        {getPaymentBadge(booking.payment?.status)}
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    <span>{new Date(booking.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                    <span>{booking.startTime} - {booking.endTime}</span>
                                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>{formatCurrency(booking.totalPrice)}</span>
                                </div>
                                <div className="flex gap-1 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <Link href={`/customer/my-bookings/${booking.id}`} className="flex-1">
                                        <Button size="sm" variant="secondary" className="w-full">
                                            <Eye className="w-3 h-3" /> Detail
                                        </Button>
                                    </Link>
                                    {booking.status === 'PENDING' && booking.payment?.status === 'PENDING' && !booking.payment.proofImageUrl && (
                                        <Button size="sm" onClick={() => setUploadModal(booking)}>
                                            <Upload className="w-3 h-3" />
                                        </Button>
                                    )}
                                    {booking.status === 'PENDING' && (
                                        <Button size="sm" variant="danger" onClick={() => handleCancelBooking(booking.id)}>
                                            <X className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <Card padding="none" className="hidden sm:block">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lapangan</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Bayar</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                                        Tidak ada booking
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.field.name}</TableCell>
                                        <TableCell>{new Date(booking.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</TableCell>
                                        <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                                        <TableCell className="font-semibold" style={{ color: 'var(--accent)' }}>{formatCurrency(booking.totalPrice)}</TableCell>
                                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                        <TableCell>{getPaymentBadge(booking.payment?.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/customer/my-bookings/${booking.id}`}>
                                                    <Button size="sm" variant="secondary"><Eye className="w-4 h-4" /></Button>
                                                </Link>
                                                {booking.status === 'PENDING' && booking.payment?.status === 'PENDING' && !booking.payment.proofImageUrl && (
                                                    <Button size="sm" onClick={() => setUploadModal(booking)}><Upload className="w-4 h-4" /></Button>
                                                )}
                                                {booking.status === 'PENDING' && (
                                                    <Button size="sm" variant="danger" onClick={() => handleCancelBooking(booking.id)}><X className="w-4 h-4" /></Button>
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

            {/* Upload Modal */}
            <Modal isOpen={!!uploadModal} onClose={() => setUploadModal(null)} title="Upload Bukti">
                <div className="space-y-4">
                    <div className="text-center p-4 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                        {previewUrl ? (
                            <div className="relative aspect-video w-full max-w-xs mx-auto rounded-lg overflow-hidden mb-3">
                                <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                            </div>
                        ) : (
                            <div className="py-6">
                                <Upload className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pilih gambar</p>
                            </div>
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                            <Upload className="w-4 h-4" />
                            {previewUrl ? 'Ganti' : 'Pilih'}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Max 1MB</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setUploadModal(null)}>Batal</Button>
                        <Button className="flex-1" onClick={handleUploadProof} loading={uploading} disabled={!selectedFile}>Upload</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
