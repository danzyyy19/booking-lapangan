import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get single booking
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request)
        if ('error' in authResult) return authResult.error

        const { user } = authResult
        const { id } = await params

        const booking = await prisma.booking.findUnique({
            where: { id },
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
                    include: {
                        images: true,
                    },
                },
                payment: {
                    include: {
                        verifiedBy: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking tidak ditemukan' },
                { status: 404 }
            )
        }

        // Customers can only view their own bookings
        if (user.role === 'CUSTOMER' && booking.customerId !== user.userId) {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 403 }
            )
        }

        return NextResponse.json({ booking })
    } catch (error) {
        console.error('Get booking error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// PUT - Update booking status (Admin/Staff) or cancel (Customer)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request)
        if ('error' in authResult) return authResult.error

        const { user } = authResult
        const { id } = await params
        const body = await request.json()
        const { status } = body

        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        })

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Booking tidak ditemukan' },
                { status: 404 }
            )
        }

        // Customers can only cancel their own bookings
        if (user.role === 'CUSTOMER') {
            if (existingBooking.customerId !== user.userId) {
                return NextResponse.json(
                    { error: 'Akses ditolak' },
                    { status: 403 }
                )
            }

            if (status !== 'CANCELLED') {
                return NextResponse.json(
                    { error: 'Anda hanya dapat membatalkan booking' },
                    { status: 400 }
                )
            }
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: { status },
            include: {
                field: true,
                payment: true,
            },
        })

        return NextResponse.json({
            message: 'Status booking berhasil diperbarui',
            booking,
        })
    } catch (error) {
        console.error('Update booking error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// DELETE - Delete booking (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request, ['ADMIN'])
        if ('error' in authResult) return authResult.error

        const { id } = await params

        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        })

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Booking tidak ditemukan' },
                { status: 404 }
            )
        }

        await prisma.booking.delete({
            where: { id },
        })

        return NextResponse.json({
            message: 'Booking berhasil dihapus',
        })
    } catch (error) {
        console.error('Delete booking error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
