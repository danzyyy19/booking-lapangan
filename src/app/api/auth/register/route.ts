import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
    try {
        const { email, password, name, phone } = await request.json()

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, dan nama harus diisi' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password minimal 6 karakter' },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email sudah terdaftar' },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone: phone || null,
                role: 'CUSTOMER',
            },
        })

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        // Create response with user data
        const response = NextResponse.json({
            message: 'Registrasi berhasil',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        })

        // Set auth cookie via response headers
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
