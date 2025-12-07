'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle, Button } from '@/components/ui'
import {
  Calendar,
  CreditCard,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Booking Mudah',
      description: 'Pilih lapangan, tanggal, dan waktu dengan mudah melalui sistem kami yang user-friendly.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-time Schedule',
      description: 'Lihat ketersediaan jadwal lapangan secara real-time. Tidak perlu telepon untuk cek jadwal.',
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Pembayaran Fleksibel',
      description: 'Upload bukti pembayaran dengan mudah. Verifikasi cepat oleh tim kami.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Aman & Terpercaya',
      description: 'Data Anda aman bersama kami. Sistem booking yang sudah dipercaya banyak pengguna.',
    },
  ]

  const fieldTypes = [
    { name: 'Futsal', icon: '⚽', count: '5 Lapangan' },
    { name: 'Badminton', icon: '🏸', count: '8 Lapangan' },
    { name: 'Basket', icon: '🏀', count: '3 Lapangan' },
    { name: 'Tenis', icon: '🎾', count: '4 Lapangan' },
    { name: 'Voli', icon: '🏐', count: '2 Lapangan' },
  ]

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Danzyy Field Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span
                className="font-bold text-xl"
                style={{ color: 'var(--text-primary)' }}
              >
                Danzyy Field
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {!loading && (
                user ? (
                  <Link href={`/${user.role.toLowerCase()}`}>
                    <Button>
                      Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost">Masuk</Button>
                    </Link>
                    <Link href="/register" className="hidden sm:block">
                      <Button>Daftar</Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Booking Lapangan
              <span
                className="block mt-2"
                style={{ color: 'var(--accent)' }}
              >
                Lebih Mudah
              </span>
            </h1>
            <p
              className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Platform booking lapangan olahraga terlengkap. Futsal, badminton, basket, dan banyak lagi.
              Cek jadwal, booking, dan bayar - semua dalam satu aplikasi.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Mulai Booking
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/customer/schedule">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                  Lihat Jadwal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Field Types */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {fieldTypes.map((type, index) => (
              <div
                key={type.name}
                className="p-6 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in-up"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <span className="text-4xl">{type.icon}</span>
                <h3
                  className="mt-3 font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {type.name}
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {type.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Kenapa Pilih Danzyy Field?
            </h2>
            <p
              className="mt-4 text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Kami menyediakan pengalaman booking lapangan yang mudah, cepat, dan terpercaya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="py-20 px-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Cara Booking
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Pilih Lapangan', desc: 'Browse dan pilih lapangan sesuai kebutuhan Anda' },
              { step: '2', title: 'Pilih Jadwal', desc: 'Tentukan tanggal dan jam yang tersedia' },
              { step: '3', title: 'Konfirmasi & Bayar', desc: 'Upload bukti bayar dan tunggu konfirmasi' },
            ].map((item, index) => (
              <div key={item.step} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  {item.step}
                </div>
                <h3
                  className="mt-6 text-xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="p-12 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #4f46e5 100%)',
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Siap untuk Bermain?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
              Daftar sekarang dan dapatkan akses ke semua lapangan kami. Booking pertama Anda hanya dalam hitungan menit!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8"
                  style={{
                    backgroundColor: 'white',
                    color: 'var(--accent)',
                  }}
                >
                  Daftar Gratis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 px-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Danzyy Field Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span
                className="font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Danzyy Field
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              © 2026 Danzyy Field. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
