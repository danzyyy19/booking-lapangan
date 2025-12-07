import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(d)
}

export function formatTime(time: string): string {
    return time
}

export function parseTime(time: string): { hours: number; minutes: number } {
    const [hours, minutes] = time.split(':').map(Number)
    return { hours, minutes }
}

export function addHours(time: string, hours: number): string {
    const { hours: h, minutes: m } = parseTime(time)
    const totalMinutes = h * 60 + m + hours * 60
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMinutes = totalMinutes % 60
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

export function isTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
): boolean {
    const toMinutes = (time: string) => {
        const { hours, minutes } = parseTime(time)
        return hours * 60 + minutes
    }

    const s1 = toMinutes(start1)
    const e1 = toMinutes(end1)
    const s2 = toMinutes(start2)
    const e2 = toMinutes(end2)

    return s1 < e2 && e1 > s2
}

export function generateTimeSlots(
    openTime: string,
    closeTime: string,
    intervalMinutes: number = 60
): string[] {
    const slots: string[] = []
    const { hours: openH, minutes: openM } = parseTime(openTime)
    const { hours: closeH, minutes: closeM } = parseTime(closeTime)

    let currentMinutes = openH * 60 + openM
    const endMinutes = closeH * 60 + closeM

    while (currentMinutes < endMinutes) {
        const hours = Math.floor(currentMinutes / 60)
        const minutes = currentMinutes % 60
        slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
        currentMinutes += intervalMinutes
    }

    return slots
}

export function getBookingStatusColor(status: string): string {
    switch (status) {
        case 'PENDING':
            return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
        case 'CONFIRMED':
            return 'bg-green-500/20 text-green-500 border-green-500/30'
        case 'CANCELLED':
            return 'bg-red-500/20 text-red-500 border-red-500/30'
        case 'COMPLETED':
            return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
        default:
            return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
}

export function getPaymentStatusColor(status: string): string {
    switch (status) {
        case 'PENDING':
            return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
        case 'VERIFIED':
            return 'bg-green-500/20 text-green-500 border-green-500/30'
        case 'REJECTED':
            return 'bg-red-500/20 text-red-500 border-red-500/30'
        default:
            return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
}
