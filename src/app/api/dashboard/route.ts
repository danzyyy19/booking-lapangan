import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const month = searchParams.get('month')
        const year = searchParams.get('year') || new Date().getFullYear().toString()

        let dateFilter = {}

        if (month !== null && month !== 'all') {
            const startDate = new Date(parseInt(year), parseInt(month), 1)
            const endDate = new Date(parseInt(year), parseInt(month) + 1, 0)
            dateFilter = {
                bookingDate: {
                    gte: startDate,
                    lte: endDate
                }
            }
        } else if (year) {
            const startDate = new Date(parseInt(year), 0, 1)
            const endDate = new Date(parseInt(year), 11, 31)
            dateFilter = {
                bookingDate: {
                    gte: startDate,
                    lte: endDate
                }
            }
        }

        const [
            totalFields,
            totalUsers,
            totalBookings,
            pendingPayments,
            revenue,
            todayBookings,
            recentBookings
        ] = await Promise.all([
            prisma.field.count({ where: { isActive: true } }),
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma.booking.count({ where: dateFilter }),
            prisma.payment.count({ where: { status: 'PENDING' } }),
            prisma.booking.aggregate({
                _sum: { totalPrice: true },
                where: {
                    ...dateFilter,
                    status: { in: ['CONFIRMED', 'COMPLETED'] }
                }
            }),
            prisma.booking.count({
                where: {
                    bookingDate: new Date()
                }
            }),
            prisma.booking.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { name: true } },
                    field: { select: { name: true } }
                }
            })
        ])

        return NextResponse.json({
            stats: {
                totalFields,
                totalUsers,
                totalBookings,
                pendingPayments,
                revenue: Number(revenue._sum.totalPrice || 0),
                todayBookings
            },
            recentBookings: recentBookings.map(b => ({
                id: b.id,
                customer: b.customer.name,
                field: b.field.name,
                time: `${new Date(b.bookingDate).toLocaleDateString()} ${b.startTime}-${b.endTime}`,
                status: b.status
            }))
        })

    } catch (error) {
        console.error('Dashboard stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        )
    }
}
