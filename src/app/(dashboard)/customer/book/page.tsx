'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, Button, Input, Select, Badge } from '@/components/ui'
import { useToast } from '@/components/ui'
import {
    MapPin,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ImageIcon
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Field {
    id: string
    name: string
    type: string
    size: string
    pricePerHour: number
    openTime: string
    closeTime: string
    images: { imageUrl: string }[]
}

interface TimeSlot {
    time: string
    available: boolean
    isPast?: boolean
    booking?: {
        id: string
        status: string
    }
}

export default function BookingPage() {
    const router = useRouter()
    const { addToast } = useToast()

    const [fields, setFields] = useState<Field[]>([])
    const [selectedField, setSelectedField] = useState<Field | null>(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [duration, setDuration] = useState(1)
    const [notes, setNotes] = useState('')
    const [schedule, setSchedule] = useState<TimeSlot[]>([])
    const [conflict, setConflict] = useState<{ startTime: string; endTime: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingSchedule, setLoadingSchedule] = useState(false)

    // Set default date to today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        setSelectedDate(today)
    }, [])

    // Fetch fields
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch('/api/fields?active=true')
                const data = await res.json()
                setFields(data.fields || [])
            } catch (error) {
                console.error('Error fetching fields:', error)
            }
        }
        fetchFields()
    }, [])

    // Fetch schedule when field or date changes
    useEffect(() => {
        if (selectedField && selectedDate) {
            fetchSchedule()
        }
    }, [selectedField, selectedDate])

    // Check for conflicts when time or duration changes
    useEffect(() => {
        if (selectedTime && duration && schedule.length > 0) {
            checkConflict()
        }
    }, [selectedTime, duration, schedule])

    const fetchSchedule = async () => {
        if (!selectedField || !selectedDate) return

        setLoadingSchedule(true)
        try {
            const res = await fetch(`/api/schedule?fieldId=${selectedField.id}&date=${selectedDate}`)
            const data = await res.json()
            setSchedule(data.schedule || [])
        } catch (error) {
            console.error('Error fetching schedule:', error)
        } finally {
            setLoadingSchedule(false)
        }
    }

    const checkConflict = () => {
        if (!selectedTime || !duration) {
            setConflict(null)
            return
        }

        const [startHour, startMin] = selectedTime.split(':').map(Number)
        const startMinutes = startHour * 60 + startMin
        const endMinutes = startMinutes + duration * 60

        for (let i = 0; i < schedule.length; i++) {
            const slot = schedule[i]
            if (!slot.available && slot.booking) {
                const [slotHour, slotMin] = slot.time.split(':').map(Number)
                const slotMinutes = slotHour * 60 + slotMin

                if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
                    // Find the booking's full range
                    let bookingStart = slot.time
                    let bookingEnd = slot.time

                    // Look backwards for booking start
                    for (let j = i; j >= 0; j--) {
                        if (schedule[j].booking?.id === slot.booking?.id) {
                            bookingStart = schedule[j].time
                        } else break
                    }

                    // Look forwards for booking end
                    for (let j = i; j < schedule.length; j++) {
                        if (schedule[j].booking?.id === slot.booking?.id) {
                            bookingEnd = schedule[j].time
                        } else break
                    }

                    // Add 1 hour to end time
                    const [endH, endM] = bookingEnd.split(':').map(Number)
                    const endHour = endH + 1
                    bookingEnd = `${String(endHour).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

                    setConflict({ startTime: bookingStart, endTime: bookingEnd })
                    return
                }
            }
        }
        setConflict(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedField || !selectedDate || !selectedTime || !duration) {
            addToast('error', 'Mohon lengkapi semua field')
            return
        }

        if (conflict) {
            addToast('error', 'Terdapat konflik waktu, silakan pilih waktu lain')
            return
        }

        // Calculate end time and validate against closing time
        const [startH, startM] = selectedTime.split(':').map(Number)
        const endMinutes = (startH * 60 + startM) + (duration * 60)
        const endHour = Math.floor(endMinutes / 60)
        const endMin = endMinutes % 60
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

        if (endTime > selectedField.closeTime) {
            addToast('error', `Booking melebihi jam tutup (${selectedField.closeTime}). Kurangi durasi atau pilih waktu lebih awal.`)
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fieldId: selectedField.id,
                    bookingDate: selectedDate,
                    startTime: selectedTime,
                    durationHours: duration,
                    notes,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.conflict) {
                    setConflict(data.conflict)
                }
                throw new Error(data.error)
            }

            addToast('success', 'Booking berhasil dibuat!')
            router.push(`/customer/my-bookings`)
        } catch (error) {
            addToast('error', error instanceof Error ? error.message : 'Gagal membuat booking')
        } finally {
            setLoading(false)
        }
    }

    const totalPrice = selectedField ? Number(selectedField.pricePerHour) * duration : 0

    const durationOptions = [
        { value: '1', label: '1 Jam' },
        { value: '2', label: '2 Jam' },
        { value: '3', label: '3 Jam' },
        { value: '4', label: '4 Jam' },
        { value: '5', label: '5 Jam' },
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            {/* Header */}
            <div>
                <h1
                    className="text-xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Booking Lapangan
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Pilih lapangan dan waktu yang tersedia
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Booking Form */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Step 1: Select Field */}
                    <Card>
                        <CardContent className="p-4">
                            <h2
                                className="font-semibold mb-3 flex items-center gap-2"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                Pilih Lapangan
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {fields.map((field) => (
                                    <button
                                        key={field.id}
                                        onClick={() => {
                                            setSelectedField(field)
                                            setSelectedTime('')
                                            setConflict(null)
                                        }}
                                        className="relative group overflow-hidden rounded-xl text-left transition-all duration-200"
                                        style={{
                                            backgroundColor: selectedField?.id === field.id ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                                            border: `2px solid ${selectedField?.id === field.id ? 'var(--accent)' : 'var(--border-color)'}`,
                                        }}
                                    >
                                        <div className="relative h-32 w-full bg-gray-200">
                                            {field.images && field.images[0] ? (
                                                <Image
                                                    src={field.images[0].imageUrl}
                                                    alt={field.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                            {selectedField?.id === field.id && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <CheckCircle className="w-8 h-8 text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{field.name}</p>
                                            <p className="text-sm opacity-80" style={{ color: 'var(--text-secondary)' }}>
                                                {field.type} • {field.size}
                                            </p>
                                            <p className="text-sm font-bold mt-2" style={{ color: 'var(--accent)' }}>
                                                {formatCurrency(Number(field.pricePerHour))}/jam
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 2: Select Date & Time */}
                    {selectedField && (
                        <Card className="animate-fade-in-up">
                            <CardContent>
                                <h2
                                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    <Calendar className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                    Pilih Tanggal & Waktu
                                </h2>

                                <div className="space-y-4">
                                    <Input
                                        type="date"
                                        label="Tanggal"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value)
                                            setSelectedTime('')
                                            setConflict(null)
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                    />

                                    {/* Time Slots */}
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            Jam Mulai
                                        </label>
                                        {loadingSchedule ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)' }} />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                {schedule.map((slot) => (
                                                    <button
                                                        key={slot.time}
                                                        onClick={() => slot.available && setSelectedTime(slot.time)}
                                                        disabled={!slot.available}
                                                        className="py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                                                        style={{
                                                            backgroundColor: selectedTime === slot.time
                                                                ? 'var(--accent)'
                                                                : slot.available
                                                                    ? 'var(--bg-secondary)'
                                                                    : slot.isPast
                                                                        ? 'var(--bg-tertiary)'
                                                                        : 'var(--error)',
                                                            color: selectedTime === slot.time
                                                                ? 'white'
                                                                : slot.isPast
                                                                    ? 'var(--text-muted)'
                                                                    : !slot.available
                                                                        ? 'white'
                                                                        : 'var(--text-primary)',
                                                            opacity: !slot.available ? 0.6 : 1,
                                                            cursor: slot.available ? 'pointer' : 'not-allowed',
                                                        }}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 mt-3 text-xs flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }} />
                                                <span style={{ color: 'var(--text-muted)' }}>Tersedia</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', opacity: 0.6 }} />
                                                <span style={{ color: 'var(--text-muted)' }}>Terlewat</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--error)', opacity: 0.6 }} />
                                                <span style={{ color: 'var(--text-muted)' }}>Terboking</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Select
                                        label="Durasi"
                                        value={String(duration)}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        options={durationOptions}
                                    />

                                    {/* Conflict Warning */}
                                    {conflict && (
                                        <div
                                            className="p-4 rounded-xl flex items-start gap-3 animate-fade-in"
                                            style={{
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                            }}
                                        >
                                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
                                            <div>
                                                <p className="font-medium" style={{ color: 'var(--error)' }}>
                                                    Konflik Jadwal!
                                                </p>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    Waktu yang Anda pilih bertabrakan dengan booking yang sudah ada
                                                    ({conflict.startTime} - {conflict.endTime}). Silakan pilih waktu lain.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <Input
                                        label="Catatan (opsional)"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Contoh: Untuk turnamen internal"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20">
                        <CardContent>
                            <h2
                                className="text-lg font-semibold mb-4"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Ringkasan Booking
                            </h2>

                            {selectedField ? (
                                <div className="space-y-4">
                                    <div className="relative h-40 w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                                        {selectedField.images && selectedField.images[0] ? (
                                            <Image
                                                src={selectedField.images[0].imageUrl}
                                                alt={selectedField.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                                    >
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {selectedField.name}
                                        </p>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {selectedField.type} • {selectedField.size}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-secondary)' }}>Tanggal</span>
                                            <span style={{ color: 'var(--text-primary)' }}>
                                                {selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                }) : '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-secondary)' }}>Waktu</span>
                                            <span style={{ color: 'var(--text-primary)' }}>
                                                {selectedTime || '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-secondary)' }}>Durasi</span>
                                            <span style={{ color: 'var(--text-primary)' }}>
                                                {duration} Jam
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: 'var(--text-secondary)' }}>Harga per Jam</span>
                                            <span style={{ color: 'var(--text-primary)' }}>
                                                {formatCurrency(Number(selectedField.pricePerHour))}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="pt-4 mt-4"
                                        style={{ borderTop: '1px solid var(--border-color)' }}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                Total
                                            </span>
                                            <span className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
                                                {formatCurrency(totalPrice)}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSubmit}
                                        className="w-full"
                                        size="lg"
                                        loading={loading}
                                        disabled={!selectedTime || !!conflict}
                                    >
                                        {conflict ? 'Ada Konflik Jadwal' : 'Booking Sekarang'}
                                    </Button>

                                    {!conflict && selectedTime && (
                                        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                                            Setelah booking, Anda akan diarahkan untuk upload bukti pembayaran
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="text-center py-8"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Pilih lapangan terlebih dahulu</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
