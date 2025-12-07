'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    Card,
    CardContent,
    Button,
    Badge,
    Modal,
    Input,
    useToast
} from '@/components/ui'
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    CreditCard,
    Upload,
    Pencil,
    AlertCircle,
    CheckCircle,
    ImageIcon
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
    field: {
        id: string
        name: string
        type: string
        pricePerHour: number
        images: { imageUrl: string }[]
    }
    payment?: {
        id: string
        status: 'PENDING' | 'VERIFIED' | 'REJECTED'
        proofImageUrl?: string
        notes?: string
    }
}

export default function CustomerBookingDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToast } = useToast()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [loading, setLoading] = useState(true)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [uploading, setUploading] = useState(false)
    const [editForm, setEditForm] = useState({
        bookingDate: '',
        startTime: '',
        endTime: '',
        notes: ''
    })
    const [saving, setSaving] = useState(false)

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
            setEditForm({
                bookingDate: data.booking.bookingDate?.split('T')[0] || '',
                startTime: data.booking.startTime || '',
                endTime: data.booking.endTime || '',
                notes: data.booking.notes || ''
            })
        } catch (error) {
            console.error('Error:', error)
            addToast('error', 'Gagal memuat data booking')
            router.push('/customer/my-bookings')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 1024 * 1024) {
            addToast('error', 'Ukuran file maksimal 1MB')
            return
        }

        if (!file.type.startsWith('image/')) {
            addToast('error', 'File harus berupa gambar')
            return
        }

        setSelectedFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleUploadProof = async () => {
        if (!selectedFile) {
            addToast('error', 'Pilih file bukti pembayaran')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!uploadRes.ok) throw new Error('Gagal upload file')
            const uploadData = await uploadRes.json()

            const paymentRes = await fetch(`/api/payments/${booking?.payment?.id || booking?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proofImageUrl: uploadData.url
                })
            })

            if (!paymentRes.ok) throw new Error('Gagal menyimpan bukti')

            addToast('success', 'Bukti pembayaran berhasil diupload!')
            setUploadModalOpen(false)
            setSelectedFile(null)
            setPreviewUrl('')
            fetchBooking()
        } catch (error) {
            addToast('error', 'Gagal mengupload bukti pembayaran')
        } finally {
            setUploading(false)
        }
    }

    const handleEditSubmit = async () => {
        if (!booking) return

        setSaving(true)
        try {
            const res = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editForm,
                    status: 'PENDING' // Reset to pending for admin approval
                })
            })

            if (!res.ok) throw new Error('Gagal update booking')

            addToast('success', 'Permintaan perubahan booking dikirim. Menunggu persetujuan admin.')
            setEditModalOpen(false)
            fetchBooking()
        } catch (error) {
            addToast('error', 'Gagal mengubah booking')
        } finally {
            setSaving(false)
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

    const getPaymentBadge = (status?: string) => {
        switch (status) {
            case 'VERIFIED': return <Badge variant="success">Lunas</Badge>
            case 'REJECTED': return <Badge variant="error">Ditolak</Badge>
            default: return <Badge variant="warning">Belum Bayar</Badge>
        }
    }

    const canEdit = booking?.status === 'PENDING' && booking?.payment?.status !== 'VERIFIED'

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)' }} />
            </div>
        )
    }

    if (!booking) return null

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/customer/my-bookings">
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Detail Booking</h1>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{booking.id.slice(0, 8)}...</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    {canEdit && (
                        <Button size="sm" variant="secondary" onClick={() => setEditModalOpen(true)}>
                            <Pencil className="w-4 h-4" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
                {/* Left - Field Info */}
                <div className="md:col-span-2">
                    <Card className="overflow-hidden">
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                            {booking.field.images?.[0] ? (
                                <Image
                                    src={booking.field.images[0].imageUrl}
                                    alt={booking.field.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10 text-gray-300" />
                                </div>
                            )}
                        </div>
                        <CardContent className="p-3">
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{booking.field.name}</h3>
                            <Badge variant="info" className="mt-1">{booking.field.type}</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Right - Booking Details */}
                <div className="md:col-span-3 space-y-4">
                    {/* Schedule */}
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tanggal</p>
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {new Date(booking.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <Clock className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Waktu</p>
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {booking.startTime} - {booking.endTime} ({booking.durationHours} jam)
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                        <CreditCard className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Pembayaran</p>
                                        <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{formatCurrency(booking.totalPrice)}</p>
                                    </div>
                                </div>
                                {getPaymentBadge(booking.payment?.status)}
                            </div>

                            {booking.payment?.proofImageUrl ? (
                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Bukti Pembayaran:</p>
                                    <a href={booking.payment.proofImageUrl} target="_blank" rel="noopener noreferrer">
                                        <div className="relative aspect-video w-full max-w-xs rounded-lg overflow-hidden border hover:opacity-90 transition-opacity">
                                            <Image src={booking.payment.proofImageUrl} alt="Bukti Bayar" fill className="object-cover" />
                                        </div>
                                    </a>
                                    {booking.payment.notes && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{booking.payment.notes}</p>
                                    )}
                                </div>
                            ) : booking.payment?.status !== 'VERIFIED' && (
                                <Button className="w-full mt-3" onClick={() => setUploadModalOpen(true)}>
                                    <Upload className="w-4 h-4" />
                                    Upload Bukti Pembayaran
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {booking.notes && (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Catatan</p>
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{booking.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Bukti Pembayaran">
                <div className="space-y-4">
                    <div className="text-center p-4 border-2 border-dashed rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                        {previewUrl ? (
                            <div className="relative aspect-video w-full max-w-xs mx-auto rounded-lg overflow-hidden mb-3">
                                <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                            </div>
                        ) : (
                            <div className="py-6">
                                <Upload className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pilih gambar bukti transfer</p>
                            </div>
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                            <Upload className="w-4 h-4" />
                            {previewUrl ? 'Ganti Gambar' : 'Pilih Gambar'}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Max 1MB, JPG/PNG</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setUploadModalOpen(false)}>Batal</Button>
                        <Button className="flex-1" onClick={handleUploadProof} loading={uploading} disabled={!selectedFile}>Upload</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Booking">
                <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                Perubahan booking memerlukan persetujuan admin. Status booking akan menjadi "Menunggu" setelah diedit.
                            </p>
                        </div>
                    </div>
                    <Input
                        label="Tanggal Booking"
                        type="date"
                        value={editForm.bookingDate}
                        onChange={(e) => setEditForm({ ...editForm, bookingDate: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Jam Mulai"
                            type="time"
                            value={editForm.startTime}
                            onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                        />
                        <Input
                            label="Jam Selesai"
                            type="time"
                            value={editForm.endTime}
                            onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Catatan"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        placeholder="Catatan tambahan..."
                    />
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setEditModalOpen(false)}>Batal</Button>
                        <Button className="flex-1" onClick={handleEditSubmit} loading={saving}>Kirim Perubahan</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
