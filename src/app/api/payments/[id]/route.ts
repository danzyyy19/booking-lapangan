import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get single payment
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request)
        if ('error' in authResult) return authResult.error

        const { user } = authResult
        const { id } = await params

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                booking: {
                    include: {
                        customer: true,
                        field: true,
                    },
                },
                verifiedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        if (!payment) {
            return NextResponse.json(
                { error: 'Pembayaran tidak ditemukan' },
                { status: 404 }
            )
        }

        // Customers can only view their own payments
        if (user.role === 'CUSTOMER' && payment.booking.customerId !== user.userId) {
            return NextResponse.json(
                { error: 'Akses ditolak' },
                { status: 403 }
            )
        }

        return NextResponse.json({ payment })
    } catch (error) {
        console.error('Get payment error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// PUT - Update payment (upload proof or verify)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request)
        if ('error' in authResult) return authResult.error

        const { user } = authResult
        const { id } = await params
        const body = await request.json()
        const { proofImageUrl, status, notes } = body

        const existingPayment = await prisma.payment.findUnique({
            where: { id },
            include: {
                booking: true,
            },
        })

        if (!existingPayment) {
            return NextResponse.json(
                { error: 'Pembayaran tidak ditemukan' },
                { status: 404 }
            )
        }

        // Customers can only upload proof for their own payments
        if (user.role === 'CUSTOMER') {
            if (existingPayment.booking.customerId !== user.userId) {
                return NextResponse.json(
                    { error: 'Akses ditolak' },
                    { status: 403 }
                )
            }

            // Customer can only upload proof
            if (status) {
                return NextResponse.json(
                    { error: 'Anda tidak dapat mengubah status pembayaran' },
                    { status: 400 }
                )
            }

            const payment = await prisma.payment.update({
                where: { id },
                data: {
                    proofImageUrl,
                },
            })

            return NextResponse.json({
                message: 'Bukti pembayaran berhasil diupload',
                payment,
            })
        }

        // Admin/Staff can verify payment
        if (['ADMIN', 'STAFF'].includes(user.role)) {
            const updateData: Record<string, unknown> = {}

            if (status) {
                updateData.status = status
                updateData.verifiedById = user.userId
                updateData.verifiedAt = new Date()
            }

            if (notes !== undefined) {
                updateData.notes = notes
            }

            const payment = await prisma.payment.update({
                where: { id },
                data: updateData,
            })

            // If payment is verified, update booking status to CONFIRMED
            if (status === 'VERIFIED') {
                await prisma.booking.update({
                    where: { id: existingPayment.bookingId },
                    data: { status: 'CONFIRMED' },
                })
            }

            // If payment is rejected, update booking status to CANCELLED
            if (status === 'REJECTED') {
                await prisma.booking.update({
                    where: { id: existingPayment.bookingId },
                    data: { status: 'CANCELLED' },
                })
            }

            return NextResponse.json({
                message: 'Status pembayaran berhasil diperbarui',
                payment,
            })
        }

        return NextResponse.json(
            { error: 'Akses ditolak' },
            { status: 403 }
        )
    } catch (error) {
        console.error('Update payment error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
