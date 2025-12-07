import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

// GET - List all fields (public for viewing, filtered for active)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const active = searchParams.get('active')

        const where: Record<string, unknown> = {}

        if (type) {
            where.type = type
        }

        if (active !== null) {
            where.isActive = active === 'true'
        }

        const fields = await prisma.field.findMany({
            where,
            include: {
                images: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ fields })
    } catch (error) {
        console.error('Get fields error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// POST - Create a new field (Admin only)
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticate(request, ['ADMIN'])
        if ('error' in authResult) return authResult.error

        const body = await request.json()
        const {
            name,
            type,
            size,
            description,
            benefits,
            pricePerHour,
            openTime,
            closeTime,
            images
        } = body

        if (!name || !type || !size || !pricePerHour) {
            return NextResponse.json(
                { error: 'Nama, jenis, ukuran, dan harga per jam harus diisi' },
                { status: 400 }
            )
        }

        const field = await prisma.field.create({
            data: {
                name,
                type,
                size,
                description: description || null,
                benefits: benefits ? JSON.stringify(benefits) : null,
                pricePerHour,
                openTime: openTime || '08:00',
                closeTime: closeTime || '22:00',
                images: images?.length > 0 ? {
                    create: images.map((url: string, index: number) => ({
                        imageUrl: url,
                        order: index,
                    })),
                } : undefined,
            },
            include: {
                images: true,
            },
        })

        return NextResponse.json({
            message: 'Lapangan berhasil ditambahkan',
            field
        }, { status: 201 })
    } catch (error) {
        console.error('Create field error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
