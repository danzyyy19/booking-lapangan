import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Logout berhasil' })

        // Delete auth cookie via response headers
        response.cookies.delete('auth-token')

        return response
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
