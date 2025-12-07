'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Select, Badge } from '@/components/ui'
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin
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
    }
}

export default function SchedulePage() {
    const [fields, setFields] = useState<Field[]>([])
    const [selectedField, setSelectedField] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [schedule, setSchedule] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(false)

    // Fetch fields
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const res = await fetch('/api/fields?active=true')
                const data = await res.json()
                setFields(data.fields || [])
                if (data.fields?.length > 0) {
                    setSelectedField(data.fields[0].id)
                }
            } catch (error) {
                console.error('Error fetching fields:', error)
            }
        }
        fetchFields()
    }, [])

    // Fetch schedule when field or date changes
    useEffect(() => {
        if (selectedField) {
            fetchSchedule()
        }
    }, [selectedField, selectedDate])

    const fetchSchedule = async () => {
        if (!selectedField) return

        setLoading(true)
        try {
            const dateStr = selectedDate.toISOString().split('T')[0]
            const res = await fetch(`/api/schedule?fieldId=${selectedField}&date=${dateStr}`)
            const data = await res.json()
            setSchedule(data.schedule || [])
        } catch (error) {
            console.error('Error fetching schedule:', error)
        } finally {
            setLoading(false)
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Jadwal Lapangan
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Lihat ketersediaan jadwal lapangan
                    </p>
                </div>

                {/* Field Selector */}
                <div className="w-full sm:w-64">
                    <Select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        options={fields.map((f) => ({ value: f.id, label: f.name }))}
                    />
                </div>
            </div>

            {/* Date Navigation */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigateDate(-7)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <h2
                            className="text-lg font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h2>

                        <button
                            onClick={() => navigateDate(7)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 gap-2">
                        {getDaysOfWeek().map((day) => {
                            const isSelected = day.toDateString() === selectedDate.toDateString()
                            const isToday = day.toDateString() === new Date().toDateString()
                            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => !isPast && setSelectedDate(day)}
                                    disabled={isPast}
                                    className="py-3 px-2 rounded-xl text-center transition-all duration-200"
                                    style={{
                                        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                                        color: isSelected ? 'white' : isPast ? 'var(--text-muted)' : 'var(--text-primary)',
                                        opacity: isPast ? 0.5 : 1,
                                        cursor: isPast ? 'not-allowed' : 'pointer',
                                        border: isToday && !isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                                    }}
                                >
                                    <p className="text-xs opacity-70">
                                        {day.toLocaleDateString('id-ID', { weekday: 'short' })}
                                    </p>
                                    <p className="text-lg font-bold mt-1">
                                        {day.getDate()}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Field Info */}
            {selectedFieldData && (
                <Card>
                    <CardContent className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--accent-light)' }}
                        >
                            <MapPin className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="flex-1">
                            <h3
                                className="font-semibold"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {selectedFieldData.name}
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {selectedFieldData.type} • {formatCurrency(Number(selectedFieldData.pricePerHour))}/jam
                            </p>
                        </div>
                        <div className="text-right">
                            <p
                                className="text-sm"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Jam Operasional
                            </p>
                            <p
                                className="font-medium"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {selectedFieldData.openTime} - {selectedFieldData.closeTime}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Schedule Grid */}
            <Card>
                <CardContent>
                    <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Jadwal {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div
                                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                                style={{ borderColor: 'var(--accent)' }}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                                {schedule.map((slot) => (
                                    <div
                                        key={slot.time}
                                        className="p-3 rounded-xl text-center"
                                        style={{
                                            backgroundColor: slot.available ? 'var(--bg-secondary)' : 'rgba(239, 68, 68, 0.15)',
                                            border: `1px solid ${slot.available ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.3)'}`,
                                        }}
                                    >
                                        <p
                                            className="font-medium"
                                            style={{ color: slot.available ? 'var(--text-primary)' : 'var(--error)' }}
                                        >
                                            {slot.time}
                                        </p>
                                        <p
                                            className="text-xs mt-1"
                                            style={{ color: slot.available ? 'var(--success)' : 'var(--error)' }}
                                        >
                                            {slot.available ? 'Tersedia' : 'Terboking'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-6 mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                                    />
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Tersedia
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                    />
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Terboking
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
