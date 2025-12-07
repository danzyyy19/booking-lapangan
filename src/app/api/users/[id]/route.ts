import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// PUT - Update user role (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request, ['ADMIN'])
        if ('error' in authResult) return authResult.error

        const { id } = await params
        const body = await request.json()
        const { role } = body

        if (!role || !['ADMIN', 'STAFF', 'CUSTOMER'].includes(role)) {
            return NextResponse.json(
                { error: 'Role tidak valid' },
                { status: 400 }
            )
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        })

        return NextResponse.json({
            message: 'Role user berhasil diperbarui',
            user
        })

    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// DELETE - Delete user (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await authenticate(request, ['ADMIN'])
        if ('error' in authResult) return authResult.error

        const { id } = await params
        const { user: adminUser } = authResult

        if (id === adminUser.userId) {
            return NextResponse.json(
                { error: 'Tidak dapat menghapus akun sendiri' },
                { status: 400 }
            )
        }

        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'User berhasil dihapus'
        })

    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
