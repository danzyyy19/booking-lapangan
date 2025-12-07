import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create Admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@danzyy.com' },
        update: {},
        create: {
            email: 'admin@danzyy.com',
            password: adminPassword,
            name: 'Admin Danzyy',
            phone: '081234567890',
            role: 'ADMIN',
        },
    })
    console.log('✅ Admin user created:', admin.email)

    // Create Staff user
    const staffPassword = await bcrypt.hash('staff123', 10)
    const staff = await prisma.user.upsert({
        where: { email: 'staff@danzyy.com' },
        update: {},
        create: {
            email: 'staff@danzyy.com',
            password: staffPassword,
            name: 'Staff Danzyy',
            phone: '081234567891',
            role: 'STAFF',
        },
    })
    console.log('✅ Staff user created:', staff.email)

    // Create Customer user
    const customerPassword = await bcrypt.hash('customer123', 10)
    const customer = await prisma.user.upsert({
        where: { email: 'customer@danzyy.com' },
        update: {},
        create: {
            email: 'customer@danzyy.com',
            password: customerPassword,
            name: 'Customer Demo',
            phone: '081234567892',
            role: 'CUSTOMER',
        },
    })
    console.log('✅ Customer user created:', customer.email)

    // Delete existing fields first to avoid duplicates
    await prisma.field.deleteMany({})
    console.log('🗑️ Cleared existing fields')

    // Create Fields
    const fieldsData = [
        {
            name: 'Lapangan Futsal A',
            type: 'futsal',
            size: '25x15m',
            description: 'Lapangan futsal indoor dengan lantai vinyl berkualitas tinggi.',
            benefits: 'AC, WiFi Gratis, Parkir Luas, Toilet Bersih, Ruang Ganti',
            pricePerHour: 150000,
            openTime: '08:00',
            closeTime: '23:00',
        },
        {
            name: 'Lapangan Futsal B',
            type: 'futsal',
            size: '25x15m',
            description: 'Lapangan futsal indoor standar internasional.',
            benefits: 'AC, WiFi Gratis, Parkir Luas, Toilet Bersih',
            pricePerHour: 175000,
            openTime: '08:00',
            closeTime: '23:00',
        },
        {
            name: 'Lapangan Badminton 1',
            type: 'badminton',
            size: '13.4x6.1m',
            description: 'Lapangan badminton indoor dengan lantai kayu profesional.',
            benefits: 'AC, Pencahayaan LED, Raket Tersedia',
            pricePerHour: 75000,
            openTime: '07:00',
            closeTime: '22:00',
        },
        {
            name: 'Lapangan Badminton 2',
            type: 'badminton',
            size: '13.4x6.1m',
            description: 'Lapangan badminton indoor standar BWF.',
            benefits: 'AC, Pencahayaan LED, Loker',
            pricePerHour: 75000,
            openTime: '07:00',
            closeTime: '22:00',
        },
        {
            name: 'Lapangan Basket',
            type: 'basket',
            size: '28x15m',
            description: 'Lapangan basket outdoor dengan ring standar FIBA.',
            benefits: 'Pencahayaan Malam, Parkir Luas, Kantin',
            pricePerHour: 200000,
            openTime: '06:00',
            closeTime: '22:00',
        },
        {
            name: 'Lapangan Tenis',
            type: 'tenis',
            size: '23.77x10.97m',
            description: 'Lapangan tenis dengan permukaan hard court.',
            benefits: 'Pencahayaan LED, Raket Tersedia',
            pricePerHour: 100000,
            openTime: '06:00',
            closeTime: '21:00',
        },
        {
            name: 'Lapangan Voli',
            type: 'voli',
            size: '18x9m',
            description: 'Lapangan voli outdoor dengan pasir pantai.',
            benefits: 'Pencahayaan Malam, Bola Tersedia',
            pricePerHour: 80000,
            openTime: '07:00',
            closeTime: '21:00',
        },
    ]

    for (const fieldData of fieldsData) {
        const field = await prisma.field.create({
            data: {
                name: fieldData.name,
                type: fieldData.type,
                size: fieldData.size,
                description: fieldData.description,
                benefits: fieldData.benefits,
                pricePerHour: fieldData.pricePerHour,
                openTime: fieldData.openTime,
                closeTime: fieldData.closeTime,
                isActive: true,
            },
        })
        console.log('✅ Field created:', field.name)
    }

    console.log('')
    console.log('🎉 Database seed completed!')
    console.log('')
    console.log('📋 Login credentials:')
    console.log('   Admin: admin@danzyy.com / admin123')
    console.log('   Staff: staff@danzyy.com / staff123')
    console.log('   Customer: customer@danzyy.com / customer123')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
