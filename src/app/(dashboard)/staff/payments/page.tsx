'use client'

import { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    Button,
    Select,
    Modal,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Input
} from '@/components/ui'
import { useToast } from '@/components/ui'
import {
    CheckCircle,
    XCircle,
    Eye,
    CreditCard
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Payment {
    id: string
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
    proofImageUrl?: string
    notes?: string
    booking: {
        id: string
        bookingDate: string
        startTime: string
        totalPrice: number
        customer: { name: string; email: string }
        field: { name: string }
    }
    verifiedBy?: { name: string }
}

export default function StaffPaymentsPage() {
    const { addToast } = useToast()
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('PENDING')
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [verifyNotes, setVerifyNotes] = useState('')
    const [processing, setProcessing] = useState(false)

    useEffect(() => { fetchPayments() }, [filter])

    const fetchPayments = async () => {
        setLoading(true)
        try {
            const url = filter === 'all' ? '/api/payments' : `/api/payments?status=${filter}`
            const res = await fetch(url)
            const data = await res.json()
            setPayments(data.payments || [])
        } catch { console.error('Error') } finally { setLoading(false) }
    }

    const handleQuickVerify = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            const res = await fetch(`/api/payments/${paymentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (!res.ok) throw new Error()
            addToast('success', status === 'VERIFIED' ? 'Diverifikasi' : 'Ditolak')
            fetchPayments()
        } catch { addToast('error', 'Gagal') }
    }

    const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
        if (!selectedPayment) return
        setProcessing(true)
        try {
            const res = await fetch(`/api/payments/${selectedPayment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, notes: verifyNotes })
            })
            if (!res.ok) throw new Error()
            addToast('success', status === 'VERIFIED' ? 'Diverifikasi' : 'Ditolak')
            setSelectedPayment(null)
            setVerifyNotes('')
            fetchPayments()
        } catch { addToast('error', 'Gagal') } finally { setProcessing(false) }
    }

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'VERIFIED': return <Badge variant="success">Verified</Badge>
            case 'REJECTED': return <Badge variant="error">Ditolak</Badge>
            default: return <Badge variant="warning">Pending</Badge>
        }
    }

    const filterOptions = [
        { value: 'PENDING', label: 'Menunggu' },
        { value: 'VERIFIED', label: 'Terverifikasi' },
        { value: 'REJECTED', label: 'Ditolak' },
        { value: 'all', label: 'Semua' },
    ]

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Verifikasi Pembayaran</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Verifikasi bukti pembayaran customer</p>
                </div>
                <Select value={filter} onChange={(e) => setFilter(e.target.value)} options={filterOptions} />
            </div>

            {/* Stats - Responsive */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Menunggu', count: payments.filter(p => p.status === 'PENDING').length, color: 'var(--warning)' },
                    { label: 'Verified', count: payments.filter(p => p.status === 'VERIFIED').length, color: 'var(--success)' },
                    { label: 'Ditolak', count: payments.filter(p => p.status === 'REJECTED').length, color: 'var(--error)' },
                ].map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="text-center py-3">
                            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.count}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: 'var(--accent)' }} />
                    </div>
                ) : payments.length === 0 ? (
                    <Card><CardContent className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                        <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />Tidak ada data
                    </CardContent></Card>
                ) : (
                    payments.map((p) => (
                        <Card key={p.id}>
                            <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{p.booking.customer.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.booking.field.name}</p>
                                    </div>
                                    {getStatusBadge(p.status)}
                                </div>
                                <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    <span>{new Date(p.booking.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>{formatCurrency(p.booking.totalPrice)}</span>
                                </div>
                                <div className="flex gap-1 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    {p.proofImageUrl && (
                                        <Button size="sm" variant="secondary" onClick={() => window.open(p.proofImageUrl, '_blank')}>
                                            <Eye className="w-3 h-3" /> Bukti
                                        </Button>
                                    )}
                                    {p.status === 'PENDING' && p.proofImageUrl && (
                                        <>
                                            <Button size="sm" className="flex-1" onClick={() => handleQuickVerify(p.id, 'VERIFIED')}>
                                                <CheckCircle className="w-3 h-3" /> Verify
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleQuickVerify(p.id, 'REJECTED')}>
                                                <XCircle className="w-3 h-3" />
                                            </Button>
                                        </>
                                    )}
                                    {!p.proofImageUrl && p.status === 'PENDING' && (
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum upload</span>
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
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : payments.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Tidak ada data</TableCell></TableRow>
                            ) : (
                                payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            <p className="font-medium text-sm">{p.booking.customer.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.booking.field.name}</p>
                                        </TableCell>
                                        <TableCell>{new Date(p.booking.bookingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</TableCell>
                                        <TableCell className="font-medium" style={{ color: 'var(--accent)' }}>{formatCurrency(p.booking.totalPrice)}</TableCell>
                                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                {p.proofImageUrl && (
                                                    <Button size="sm" variant="secondary" onClick={() => window.open(p.proofImageUrl, '_blank')}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {p.status === 'PENDING' && p.proofImageUrl && (
                                                    <>
                                                        <Button size="sm" onClick={() => handleQuickVerify(p.id, 'VERIFIED')}>
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleQuickVerify(p.id, 'REJECTED')}>
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </>
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

            {/* Modal */}
            <Modal isOpen={!!selectedPayment} onClose={() => setSelectedPayment(null)} title="Verifikasi Pembayaran">
                {selectedPayment && (
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <p className="font-medium">{selectedPayment.booking.customer.name}</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{selectedPayment.booking.field.name}</p>
                            <p className="font-bold mt-2" style={{ color: 'var(--accent)' }}>{formatCurrency(selectedPayment.booking.totalPrice)}</p>
                        </div>
                        <Input label="Catatan" value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} placeholder="Catatan..." />
                        <div className="flex gap-2">
                            <Button variant="danger" className="flex-1" onClick={() => handleVerify('REJECTED')} loading={processing}>
                                <XCircle className="w-4 h-4" /> Tolak
                            </Button>
                            <Button className="flex-1" onClick={() => handleVerify('VERIFIED')} loading={processing}>
                                <CheckCircle className="w-4 h-4" /> Verifikasi
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
