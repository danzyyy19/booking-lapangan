import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

const publicPaths = ['/', '/login', '/register', '/forgot-password']
const authPaths = ['/login', '/register', '/forgot-password']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('auth-token')?.value

    // Check if path is public
    const isPublicPath = publicPaths.some(path =>
        pathname === path || pathname.startsWith('/api/auth')
    )

    // Check if path is auth-only (login, register)
    const isAuthPath = authPaths.includes(pathname)

    // If no token and trying to access protected route
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If token exists, verify and handle redirects
    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret)
            const role = payload.role as string

            // If user is logged in and trying to access auth pages, redirect to dashboard
            if (isAuthPath) {
                return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url))
            }

            // Check role-based access
            if (pathname.startsWith('/admin') && role !== 'ADMIN') {
                return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url))
            }

            if (pathname.startsWith('/staff') && !['ADMIN', 'STAFF'].includes(role)) {
                return NextResponse.redirect(new URL(`/${role.toLowerCase()}`, request.url))
            }

            if (pathname.startsWith('/customer') && role !== 'CUSTOMER') {
                if (role === 'ADMIN') {
                    return NextResponse.redirect(new URL('/admin', request.url))
                }
                if (role === 'STAFF') {
                    return NextResponse.redirect(new URL('/staff', request.url))
                }
            }
        } catch {
            // Invalid token, remove it and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('auth-token')
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes) except auth
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|uploads|.*\\..*|public).*)',
    ],
}
