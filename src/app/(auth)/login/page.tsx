'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/ui'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await login(email, password)
            if (result.success) {
                // Determine redirect path based on role or default to dashboard based on role
                let redirectPath = '/customer'
                if (result.user?.role === 'ADMIN') redirectPath = '/admin'
                else if (result.user?.role === 'STAFF') redirectPath = '/staff'

                router.push(redirectPath)
                router.refresh()
            } else {
                setError(result.error || 'Login gagal')
            }
        } catch (err) {
            setError('Terjadi kesalahan saat login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div
                className="w-full max-w-md p-8 rounded-2xl shadow-xl space-y-8"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                }}
            >
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg">
                            <Image
                                src="/logo.png"
                                alt="Danzyy Field"
                                width={64}
                                height={64}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Selamat Datang
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Masuk untuk melanjutkan ke Danzyy Field
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div
                            className="p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-shake"
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--error)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}
                        >
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium ml-1"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                }}
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--accent)'
                                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-color)'
                                    e.target.style.boxShadow = 'none'
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 pr-12"
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                    }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent)'
                                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-color)'
                                        e.target.style.boxShadow = 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
                        }}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Memproses...</span>
                            </div>
                        ) : (
                            'Masuk'
                        )}
                    </button>

                    <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Belum punya akun?{' '}
                        <Link
                            href="/register"
                            className="font-semibold hover:underline decoration-2 underline-offset-4"
                            style={{ color: 'var(--accent)' }}
                        >
                            Daftar sekarang
                        </Link>
                    </p>
                </form>
            </div>

            <p className="mt-8 text-xs text-center hidden md:block" style={{ color: 'var(--text-muted)' }}>
                &copy; {new Date().getFullYear()} Danzyy Field. Hak Cipta Dilindungi.
            </p>
        </div>
    )
}
