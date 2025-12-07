import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Get single field
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        const field = await prisma.field.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!field) {
            return NextResponse.json(
                { error: 'Lapangan tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json({ field })
    } catch (error) {
        console.error('Get field error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// PUT - Update field (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request, ['ADMIN'])
        if ('error' in authResult) return authResult.error

        const { id } = await params
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
            isActive,
            images
        } = body

        const existingField = await prisma.field.findUnique({
            where: { id },
        })

        if (!existingField) {
            return NextResponse.json(
                { error: 'Lapangan tidak ditemukan' },
                { status: 404 }
            )
        }

        // Update field
        const field = await prisma.field.update({
            where: { id },
            data: {
                name: name ?? existingField.name,
                type: type ?? existingField.type,
                size: size ?? existingField.size,
                description: description !== undefined ? description : existingField.description,
                benefits: benefits !== undefined ? (benefits ? JSON.stringify(benefits) : null) : existingField.benefits,
                pricePerHour: pricePerHour ?? existingField.pricePerHour,
                openTime: openTime ?? existingField.openTime,
                closeTime: closeTime ?? existingField.closeTime,
                isActive: isActive !== undefined ? isActive : existingField.isActive,
            },
            include: {
                images: true,
            },
        })

        // Update images if provided
        if (images !== undefined) {
            // Delete existing images
            await prisma.fieldImage.deleteMany({
                where: { fieldId: id },
            })

            // Create new images
            if (images.length > 0) {
                await prisma.fieldImage.createMany({
                    data: images.map((url: string, index: number) => ({
                        fieldId: id,
                        imageUrl: url,
                        order: index,
                    })),
                })
            }
        }

        return NextResponse.json({
            message: 'Lapangan berhasil diperbarui',
            field
        })
    } catch (error) {
        console.error('Update field error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// DELETE - Delete field (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request, ['ADMIN'])
        if ('error' in authResult) return authResult.error

        const { id } = await params

        const existingField = await prisma.field.findUnique({
            where: { id },
        })

        if (!existingField) {
            return NextResponse.json(
                { error: 'Lapangan tidak ditemukan' },
                { status: 404 }
            )
        }

        await prisma.field.delete({
            where: { id },
        })

        return NextResponse.json({
            message: 'Lapangan berhasil dihapus'
        })
    } catch (error) {
        console.error('Delete field error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
