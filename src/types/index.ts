import { Role, BookingStatus, PaymentStatus } from '@prisma/client'

export type { Role, BookingStatus, PaymentStatus }

export interface User {
    id: string
    email: string
    name: string
    phone: string | null
    role: Role
    createdAt: Date
    updatedAt: Date
}

export interface Field {
    id: string
    name: string
    type: string
    size: string
    description: string | null
    benefits: string | null
    pricePerHour: number
    openTime: string
    closeTime: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    images?: FieldImage[]
}

export interface FieldImage {
    id: string
    fieldId: string
    imageUrl: string
    order: number
}

export interface Booking {
    id: string
    customerId: string
    fieldId: string
    bookingDate: Date
    startTime: string
    durationHours: number
    endTime: string
    totalPrice: number
    status: BookingStatus
    notes: string | null
    createdAt: Date
    updatedAt: Date
    customer?: User
    field?: Field
    payment?: Payment
}

export interface Payment {
    id: string
    bookingId: string
    proofImageUrl: string | null
    status: PaymentStatus
    verifiedById: string | null
    notes: string | null
    createdAt: Date
    verifiedAt: Date | null
    booking?: Booking
    verifiedBy?: User
}

export interface TimeSlot {
    time: string
    available: boolean
    booking?: Booking
}

export interface ScheduleDay {
    date: Date
    slots: TimeSlot[]
}

export interface ApiResponse<T> {
    data?: T
    error?: string
    message?: string
}
