import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'
import { addHours, isTimeOverlap } from '@/lib/utils'

// GET - List bookings
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticate(request)
        if ('error' in authResult) return authResult.error

        const { user } = authResult
        const { searchParams } = new URL(request.url)

        const fieldId = searchParams.get('fieldId')
        const status = searchParams.get('status')
        const date = searchParams.get('date')
        const customerId = searchParams.get('customerId')

        const where: Record<string, unknown> = {}

        // Customers can only see their own bookings
        if (user.role === 'CUSTOMER') {
            where.customerId = user.userId
        } else if (customerId) {
            where.customerId = customerId
        }

        if (fieldId) where.fieldId = fieldId
        if (status) where.status = status

        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        if (startDate && endDate) {
            where.bookingDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        } else if (date) {
            where.bookingDate = new Date(date)
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                field: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        pricePerHour: true,
                    },
                },
                payment: true,
            },
            orderBy: [
                { bookingDate: 'desc' },
                { startTime: 'asc' },
            ],
        })

        return NextResponse.json({ bookings })
    } catch (error) {
        console.error('Get bookings error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticate(request)
        if ('error' in authResult) return authResult.error

        const { user } = authResult
        const body = await request.json()
        const { fieldId, bookingDate, startTime, durationHours, notes } = body

        // Validate required fields
        if (!fieldId || !bookingDate || !startTime || !durationHours) {
            return NextResponse.json(
                { error: 'Lapangan, tanggal, waktu mulai, dan durasi harus diisi' },
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

        if (!field.isActive) {
            return NextResponse.json(
                { error: 'Lapangan sedang tidak aktif' },
                { status: 400 }
            )
        }

        // Calculate end time
        const endTime = addHours(startTime, durationHours)

        // Validate time is within operating hours
        if (startTime < field.openTime || endTime > field.closeTime) {
            return NextResponse.json(
                { error: `Waktu booking harus dalam jam operasional (${field.openTime} - ${field.closeTime})` },
                { status: 400 }
            )
        }

        // Check for booking conflicts
        const existingBookings = await prisma.booking.findMany({
            where: {
                fieldId,
                bookingDate: new Date(bookingDate),
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
        })

        for (const existing of existingBookings) {
            if (isTimeOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
                return NextResponse.json(
                    {
                        error: `Waktu bentrok dengan booking yang sudah ada (${existing.startTime} - ${existing.endTime})`,
                        conflict: {
                            startTime: existing.startTime,
                            endTime: existing.endTime,
                        }
                    },
                    { status: 409 }
                )
            }
        }

        // Calculate total price
        const totalPrice = Number(field.pricePerHour) * durationHours

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                customerId: user.userId,
                fieldId,
                bookingDate: new Date(bookingDate),
                startTime,
                durationHours,
                endTime,
                totalPrice,
                notes: notes || null,
            },
            include: {
                field: true,
                payment: true,
            },
        })

        // Create payment record
        await prisma.payment.create({
            data: {
                bookingId: booking.id,
            },
        })

        return NextResponse.json({
            message: 'Booking berhasil dibuat',
            booking,
        }, { status: 201 })
    } catch (error) {
        console.error('Create booking error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
