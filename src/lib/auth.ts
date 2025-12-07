import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './jwt'

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER'

export interface AuthenticatedRequest extends NextRequest {
    user: JWTPayload
}

export async function authenticate(
    request: NextRequest,
    allowedRoles?: Role[]
): Promise<{ user: JWTPayload } | { error: NextResponse }> {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
        return {
            error: NextResponse.json(
                { error: 'Unauthorized: No token provided' },
                { status: 401 }
            ),
        }
    }

    const payload = await verifyToken(token)

    if (!payload) {
        return {
            error: NextResponse.json(
                { error: 'Unauthorized: Invalid token' },
                { status: 401 }
            ),
        }
    }

    if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return {
            error: NextResponse.json(
                { error: 'Forbidden: Insufficient permissions' },
                { status: 403 }
            ),
        }
    }

    return { user: payload }
}

export function isAdmin(role: Role): boolean {
    return role === 'ADMIN'
}

export function isStaff(role: Role): boolean {
    return role === 'STAFF' || role === 'ADMIN'
}

export function isCustomer(role: Role): boolean {
    return role === 'CUSTOMER'
}
