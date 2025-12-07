import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTimeSlots } from '@/lib/utils'

// GET - Get available schedule for a field
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const fieldId = searchParams.get('fieldId')
        const date = searchParams.get('date')

        if (!fieldId || !date) {
            return NextResponse.json(
                { error: 'Field ID dan tanggal harus diisi' },
                { status: 400 }
            )
        }

        // Get field info
        const field = await prisma.field.findUnique({
            where: { id: fieldId },
        })

        if (!field) {
            return NextResponse.json(
                { error: 'Lapangan tidak ditemukan' },
                { status: 404 }
            )
        }

        // Get existing bookings for the date
        const bookings = await prisma.booking.findMany({
            where: {
                fieldId,
                bookingDate: new Date(date),
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                durationHours: true,
                status: true,
                customer: {
                    select: {
                        name: true,
                    },
                },
            },
        })

        // Generate time slots
        const allSlots = generateTimeSlots(field.openTime, field.closeTime)

        // Mark slots as available or booked
        const schedule = allSlots.map((time) => {
            const booking = bookings.find((b: typeof bookings[number]) => {
                const startMinutes = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1])
                const endMinutes = parseInt(b.endTime.split(':')[0]) * 60 + parseInt(b.endTime.split(':')[1])
                const slotMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])

                return slotMinutes >= startMinutes && slotMinutes < endMinutes
            })

            return {
                time,
                available: !booking,
                booking: booking ? {
                    id: booking.id,
                    status: booking.status,
                } : null,
            }
        })

        return NextResponse.json({
            field: {
                id: field.id,
                name: field.name,
                openTime: field.openTime,
                closeTime: field.closeTime,
                pricePerHour: field.pricePerHour,
            },
            date,
            schedule,
            bookings,
        })
    } catch (error) {
        console.error('Get schedule error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
