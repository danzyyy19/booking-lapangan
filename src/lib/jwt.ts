import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export interface JWTPayload {
    userId: string
    email: string
    role: 'ADMIN' | 'STAFF' | 'CUSTOMER'
    exp?: number
    iat?: number
}

export async function signToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): Promise<string> {
    const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(secret)

    return token
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload as unknown as JWTPayload
    } catch {
        return null
    }
}

export async function getSession(): Promise<JWTPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) return null

    return verifyToken(token)
}

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    })
}

export async function removeAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
}
