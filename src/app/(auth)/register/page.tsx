'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { ThemeToggle } from '@/components/ui'
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { register } = useAuth()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok')
            return
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter')
            return
        }

        setLoading(true)

        const result = await register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
        })

        if (result.success) {
            router.push('/customer')
            router.refresh()
        } else {
            setError(result.error || 'Registrasi gagal')
        }

        setLoading(false)
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 py-8"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* Theme Toggle */}
            <div className="fixed top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Image
                        src="/logo.png"
                        alt="Danzyy Field Logo"
                        width={64}
                        height={64}
                        className="mx-auto mb-4 rounded-2xl"
                    />
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Daftar Akun
                    </h1>
                    <p
                        className="mt-2"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Buat akun untuk mulai booking lapangan
                    </p>
                </div>

                {/* Register Form */}
                <Card hover={false}>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div
                                    className="p-3 rounded-lg text-sm animate-fade-in"
                                    style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--error)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            <div className="relative">
                                <User
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Nama Lengkap"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                            </div>

                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                            </div>

                            <div className="relative">
                                <Phone
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <Input
                                    type="tel"
                                    name="phone"
                                    placeholder="Nomor Telepon (opsional)"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="pl-10"
                                />
                            </div>

                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                            </div>

                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{ color: 'var(--text-muted)' }}
                                />
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Konfirmasi Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="pl-10"
                                />
                            </div>

                            <p
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Dengan mendaftar, Anda menyetujui{' '}
                                <Link href="/terms" style={{ color: 'var(--accent)' }}>
                                    Syarat & Ketentuan
                                </Link>{' '}
                                dan{' '}
                                <Link href="/privacy" style={{ color: 'var(--accent)' }}>
                                    Kebijakan Privasi
                                </Link>
                            </p>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={loading}
                            >
                                Daftar
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Sudah punya akun?{' '}
                                <Link
                                    href="/login"
                                    className="font-medium"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    Masuk
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p
                    className="text-center text-xs mt-6"
                    style={{ color: 'var(--text-muted)' }}
                >
                    © 2024 Danzyy Field. All rights reserved.
                </p>
            </div>
        </div>
    )
}
