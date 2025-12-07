import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

// GET - List all users (Admin only)
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticate(request, ['ADMIN'])
        if ('error' in authResult) return authResult.error

        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')
        const search = searchParams.get('search')

        const where: any = {}

        if (role && role !== 'all') {
            where.role = role
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } }
            ]
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { bookings: true }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Get users error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
