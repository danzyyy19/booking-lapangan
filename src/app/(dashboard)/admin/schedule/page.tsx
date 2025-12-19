'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, Select, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Eye,
    Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Field {
    id: string
    name: string
    type: string
    pricePerHour: number
    openTime: string
    closeTime: string
}

interface TimeSlot {
    time: string
    available: boolean
    booking?: {
        id: string
        status: string
        user?: { name: string }
        startTime: string
        endTime: string
    }
}

interface Booking {
    id: string
    bookingDate: string
    startTime: string
    endTime: string
    status: string
    customer: { name: string }
    field: { name: string }
    totalPrice: number
}

export default function AdminSchedulePage() {
    const [fields, setFields] = useState<Field[]>([])
    const [selectedField, setSelectedField] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [schedule, setSchedule] = useState<TimeSlot[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch('/api/fields')
                const data = await res.json()
                setFields(data.fields || [])
                if (data.fields?.length > 0) {
                    setSelectedField(data.fields[0].id)
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }
        fetchFields()
    }, [])

    useEffect(() => {
        if (selectedField) {
            // Clear previous data immediately to prevent showing stale bookings
            setBookings([])
            setSchedule([])
            fetchSchedule()
            fetchBookings()
        }
    }, [selectedField, selectedDate])

    const fetchSchedule = async () => {
        setLoading(true)
        try {
            const dateStr = selectedDate.toISOString().split('T')[0]
            const res = await fetch(`/api/schedule?fieldId=${selectedField}&date=${dateStr}`)
            const data = await res.json()
            setSchedule(data.schedule || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchBookings = async () => {
        try {
            const dateStr = selectedDate.toISOString().split('T')[0]
            const res = await fetch(`/api/bookings?fieldId=${selectedField}&startDate=${dateStr}&endDate=${dateStr}`)
            const data = await res.json()
            setBookings(data.bookings || [])
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + days)
        setSelectedDate(newDate)
    }

    const getDaysOfWeek = () => {
        const days = []
        const start = new Date(selectedDate)
        start.setDate(start.getDate() - start.getDay())
        for (let i = 0; i < 7; i++) {
            const day = new Date(start)
            day.setDate(day.getDate() + i)
            days.push(day)
        }
        return days
    }

    const selectedFieldData = fields.find(f => f.id === selectedField)
    const bookedSlots = schedule.filter(s => !s.available && s.booking).length  // Only slots with actual bookings
    const availableSlots = schedule.filter(s => s.available).length

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Monitor Jadwal
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Pantau ketersediaan dan booking lapangan
                    </p>
                </div>
                <div className="w-full sm:w-56">
                    <Select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        options={fields.map((f) => ({ value: f.id, label: f.name }))}
                    />
                </div>
            </div>

            {/* Date Navigation */}
            <Card>
                <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => navigateDate(-7)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => navigateDate(7)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysOfWeek().map((day) => {
                            const isSelected = day.toDateString() === selectedDate.toDateString()
                            const isToday = day.toDateString() === new Date().toDateString()
                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className="py-2 px-1 rounded-lg text-center transition-all"
                                    style={{
                                        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                                        color: isSelected ? 'white' : 'var(--text-primary)',
                                        border: isToday && !isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                                    }}
                                >
                                    <p className="text-xs opacity-70">{day.toLocaleDateString('id-ID', { weekday: 'short' })}</p>
                                    <p className="text-lg font-bold">{day.getDate()}</p>
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Left - Stats & Schedule Grid */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card>
                            <CardContent className="p-3 text-center">
                                <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{availableSlots}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tersedia</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3 text-center">
                                <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>{bookedSlots}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Terboking</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3 text-center">
                                <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{bookings.length}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Booking</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Schedule Grid */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                                Jadwal {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </h3>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {schedule.map((slot) => (
                                        <div
                                            key={slot.time}
                                            className="p-2 rounded-lg text-center text-sm"
                                            style={{
                                                backgroundColor: slot.available ? 'var(--bg-secondary)' : 'rgba(239, 68, 68, 0.15)',
                                                border: `1px solid ${slot.available ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.3)'}`,
                                            }}
                                        >
                                            <p className="font-medium" style={{ color: slot.available ? 'var(--text-primary)' : 'var(--error)' }}>
                                                {slot.time}
                                            </p>
                                            <p className="text-xs" style={{ color: slot.available ? 'var(--success)' : 'var(--error)' }}>
                                                {slot.available ? '✓' : '✗'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right - Bookings List */}
                <div className="space-y-4">
                    {selectedFieldData && (
                        <Card>
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-light)' }}>
                                    <MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{selectedFieldData.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedFieldData.openTime} - {selectedFieldData.closeTime}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="p-0">
                            <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Booking Hari Ini</h3>
                            </div>
                            {bookings.length === 0 ? (
                                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Tidak ada booking</p>
                                </div>
                            ) : (
                                <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                    {bookings.map((booking) => (
                                        <div key={booking.id} className="p-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{booking.customer?.name || 'N/A'}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    {booking.startTime} - {booking.endTime}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={
                                                    booking.status === 'CONFIRMED' ? 'success' :
                                                        booking.status === 'COMPLETED' ? 'info' :
                                                            booking.status === 'CANCELLED' ? 'error' : 'warning'
                                                }>
                                                    {booking.status === 'PENDING' ? 'P' : booking.status === 'CONFIRMED' ? 'C' : booking.status.charAt(0)}
                                                </Badge>
                                                <Link href={`/admin/bookings/${booking.id}`}>
                                                    <Button size="sm" variant="secondary">
                                                        <Eye className="w-3 h-3" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
