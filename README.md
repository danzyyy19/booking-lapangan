# 🏟️ Danzyy Field - Sistem Booking Lapangan Online

Sistem informasi booking lapangan olahraga berbasis web yang memungkinkan pengguna melakukan reservasi secara online dengan fitur verifikasi pembayaran dan manajemen jadwal real-time.

## ✨ Fitur Utama

### 👤 Customer
- Lihat daftar lapangan dengan gambar dan harga
- Booking lapangan dengan pilihan tanggal dan jam
- Upload bukti pembayaran
- Lihat riwayat dan status booking
- Batalkan booking

### 👨‍💼 Staff
- Verifikasi pembayaran (Approve/Reject)
- Monitor jadwal lapangan harian
- Lihat daftar booking

### 🔑 Admin
- Kelola data lapangan (CRUD)
- Kelola data pengguna
- Lihat laporan pendapatan
- Akses penuh ke semua fitur

## 🛠️ Tech Stack

| Teknologi | Versi |
|-----------|-------|
| Next.js (App Router) | 16.0.7 |
| React | 19.2.0 |
| TypeScript | ^5 |
| Tailwind CSS | 3.4 |
| Prisma ORM | ^6.19.0 |
| MySQL | - |
| JWT (jose) | ^6.1.3 |
| Cloudinary | ^2.8.0 |

## 🚀 Instalasi

### Prasyarat
- Node.js v18+
- MySQL Server (XAMPP/Laragon)
- Git

### Langkah Instalasi

```bash
# Clone repository
git clone https://github.com/danzyyy19/booking-lapangan.git
cd booking-lapangan

# Install dependencies
npm install

# Konfigurasi environment
# Buat file .env dengan isi:
DATABASE_URL="mysql://root:@localhost:3306/danzyy_field"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Migrasi database
npm run db:push

# Seed data awal
npm run db:seed

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📋 Akun Default

Setelah menjalankan `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@danzyy.com | admin123 |
| Staff | staff@danzyy.com | staff123 |
| Customer | customer@danzyy.com | customer123 |

## 📁 Struktur Folder

```
src/
├── app/
│   ├── (auth)/           # Login & Register
│   ├── (dashboard)/      # Dashboard per Role
│   │   ├── admin/        # Halaman Admin
│   │   ├── staff/        # Halaman Staff
│   │   └── customer/     # Halaman Customer
│   └── api/              # REST API Routes
├── components/           # Komponen UI
├── hooks/                # Custom Hooks
├── lib/                  # Utilities
└── middleware.ts         # Route Protection
```

## 🧪 NPM Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Build production |
| `npm run start` | Production server |
| `npm run db:push` | Push schema ke database |
| `npm run db:seed` | Seed data awal |
| `npm run db:studio` | Prisma Studio GUI |

## 📄 Dokumentasi

Dokumentasi lengkap tersedia di folder `Dokumentasi/`:
- `DOKUMENTASI_LENGKAP.md` - Dokumentasi teknis lengkap
- `Picture/` - Screenshot aplikasi

## 📝 Fitur Keamanan

- Password di-hash menggunakan bcrypt
- Autentikasi menggunakan JWT
- Role-based access control (RBAC)
- Middleware protection untuk route

## 🎯 Validasi Booking

- Pencegahan double booking
- Validasi jam operasional lapangan
- Blokir booking jam yang sudah terlewat (untuk hari ini)
- Sinkronisasi status booking dan pembayaran

---

**Danzyy Field** © 2025 - Tugas Besar Pemrograman Web II
