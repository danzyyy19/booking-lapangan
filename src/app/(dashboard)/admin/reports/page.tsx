'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Button, Input, Badge } from '@/components/ui'
import { Download, Printer, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Booking {
    id: string
    bookingDate: string
    startTime: string
    endTime: string
    totalPrice: number
    status: string
    field: { name: string }
    customer: { name: string }
}

export default function AdminReportsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(false)
    const [startDate, setStartDate] = useState(() => {
        const date = new Date()
        date.setDate(1)
        return date.toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

    useEffect(() => { fetchReport() }, [startDate, endDate])

    const fetchReport = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/bookings?startDate=${startDate}&endDate=${endDate}`)
            const data = await res.json()
            setBookings(data.bookings || [])
        } catch { console.error('Error') } finally { setLoading(false) }
    }

    const totalRevenue = bookings.filter(b => ['COMPLETED', 'CONFIRMED'].includes(b.status)).reduce((sum, b) => sum + Number(b.totalPrice), 0)
    const totalBookings = bookings.length
    const completedBookings = bookings.filter(b => ['COMPLETED', 'CONFIRMED'].includes(b.status)).length
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length

    const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

    const handleExportPDF = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return
        const html = `<!DOCTYPE html><html><head><title>Laporan - Danzyy Field</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px;color:#333}.header{display:flex;align-items:center;gap:15px;border-bottom:3px solid #3b82f6;padding-bottom:15px;margin-bottom:15px}.logo{width:50px;height:50px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;font-weight:bold}.company-info h1{font-size:20px;color:#1e40af}.company-info p{font-size:11px;color:#666}.report-title{text-align:center;margin:20px 0}.report-title h2{font-size:18px}.report-title p{font-size:11px;color:#666}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}.stat-card{padding:12px;border-radius:8px;text-align:center;background:#f5f5f5}.stat-card .value{font-size:20px;font-weight:bold}.stat-card .label{font-size:10px;color:#666}table{width:100%;border-collapse:collapse;font-size:11px}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}th{background:#f5f5f5}.text-right{text-align:right}.footer{margin-top:30px;padding-top:15px;border-top:1px solid #ddd;font-size:10px;color:#666}</style></head><body><div class="header"><div class="logo">DF</div><div class="company-info"><h1>Danzyy Field</h1><p>Jl. Olahraga No. 123</p></div></div><div class="report-title"><h2>LAPORAN TRANSAKSI</h2><p>Periode: ${formatDate(startDate)} - ${formatDate(endDate)}</p></div><div class="stats"><div class="stat-card"><div class="value" style="color:#166534">Rp ${totalRevenue.toLocaleString('id-ID')}</div><div class="label">Pendapatan</div></div><div class="stat-card"><div class="value" style="color:#1e40af">${totalBookings}</div><div class="label">Total</div></div><div class="stat-card"><div class="value" style="color:#4f46e5">${completedBookings}</div><div class="label">Selesai</div></div><div class="stat-card"><div class="value" style="color:#b91c1c">${cancelledBookings}</div><div class="label">Batal</div></div></div><table><thead><tr><th>No</th><th>Tanggal</th><th>Customer</th><th>Lapangan</th><th>Status</th><th class="text-right">Nominal</th></tr></thead><tbody>${bookings.map((b, i) => `<tr><td>${i + 1}</td><td>${formatDate(b.bookingDate)}</td><td>${b.customer?.name || 'N/A'}</td><td>${b.field?.name || 'N/A'}</td><td>${b.status}</td><td class="text-right">Rp ${Number(b.totalPrice).toLocaleString('id-ID')}</td></tr>`).join('')}</tbody></table><div class="footer">Dicetak: ${new Date().toLocaleString('id-ID')}</div></body></html>`
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => printWindow.print(), 250)
    }

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'COMPLETED': return <Badge variant="info">Selesai</Badge>
            case 'CONFIRMED': return <Badge variant="success">OK</Badge>
            case 'CANCELLED': return <Badge variant="error">Batal</Badge>
            default: return <Badge variant="warning">Pending</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Laporan</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ringkasan pendapatan dan booking</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4" /></Button>
                    <Button size="sm" onClick={handleExportPDF}><Download className="w-4 h-4" /> PDF</Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-3 flex flex-wrap gap-3">
                    <Input label="Dari" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <Input label="Sampai" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <Card style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    <CardContent className="p-3 text-white">
                        <p className="text-xs opacity-80">Pendapatan</p>
                        <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{totalBookings}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Selesai</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>{completedBookings}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Batal</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--error)' }}>{cancelledBookings}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-2">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: 'var(--accent)' }} />
                    </div>
                ) : bookings.length === 0 ? (
                    <Card><CardContent className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />Tidak ada data
                    </CardContent></Card>
                ) : (
                    bookings.map((b) => (
                        <Card key={b.id}>
                            <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{b.customer?.name || 'N/A'}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{b.field?.name}</p>
                                    </div>
                                    {getStatusBadge(b.status)}
                                </div>
                                <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                                    <span>{formatDate(b.bookingDate)}</span>
                                    <span className="font-semibold" style={{ color: 'var(--accent)' }}>{formatCurrency(b.totalPrice)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table */}
            <Card padding="none" className="hidden sm:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Tanggal</th>
                                <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Customer</th>
                                <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Lapangan</th>
                                <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                                <th className="text-right p-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Nominal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Tidak ada data</td></tr>
                            ) : (
                                bookings.map((b) => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td className="p-3 text-sm">{formatDate(b.bookingDate)}</td>
                                        <td className="p-3 text-sm font-medium">{b.customer?.name || 'N/A'}</td>
                                        <td className="p-3 text-sm">{b.field?.name}</td>
                                        <td className="p-3">{getStatusBadge(b.status)}</td>
                                        <td className="p-3 text-sm text-right font-medium" style={{ color: 'var(--accent)' }}>{formatCurrency(b.totalPrice)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
