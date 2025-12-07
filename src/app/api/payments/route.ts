import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

// GET - List payments
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticate(request, ['ADMIN', 'STAFF'])
        if ('error' in authResult) return authResult.error

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        const where: Record<string, unknown> = {}
        if (status) where.status = status

        const payments = await prisma.payment.findMany({
            where,
            include: {
                booking: {
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
                            },
                        },
                    },
                },
                verifiedBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ payments })
    } catch (error) {
        console.error('Get payments error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
