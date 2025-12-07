'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    Card,
    CardContent,
    Button,
    Badge,
    useToast
} from '@/components/ui'
import {
    ArrowLeft,
    Upload,
    Trash2,
    MapPin,
    Clock,
    DollarSign,
    ImageIcon,
    Pencil
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Field {
    id: string
    name: string
    type: string
    size: string
    description?: string
    benefits?: string
    pricePerHour: number
    openTime: string
    closeTime: string
    isActive: boolean
    images: { id: string; imageUrl: string; order: number }[]
}

export default function FieldDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToast } = useToast()
    const [field, setField] = useState<Field | null>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    useEffect(() => {
        if (params.id) {
            fetchField()
        }
    }, [params.id])

    const fetchField = async () => {
        try {
            const res = await fetch(`/api/fields/${params.id}`)
            if (!res.ok) throw new Error('Failed to fetch field')
            const data = await res.json()
            setField(data.field)
            if (data.field?.images?.[0]?.imageUrl) {
                setSelectedImage(data.field.images[0].imageUrl)
            }
        } catch (error) {
            console.error('Error:', error)
            addToast('error', 'Gagal memuat data lapangan')
            router.push('/admin/fields')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const newImageUrls: string[] = []

        try {
            const currentImages = field?.images.map(img => img.imageUrl) || []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (file.size > 2 * 1024 * 1024) {
                    addToast('error', `File ${file.name} terlalu besar (>2MB)`)
                    continue
                }

                const formData = new FormData()
                formData.append('file', file)

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) throw new Error(`Gagal upload ${file.name}`)
                const data = await res.json()
                newImageUrls.push(data.url)
            }

            if (newImageUrls.length > 0) {
                const updatedImages = [...currentImages, ...newImageUrls]
                const updateRes = await fetch(`/api/fields/${params.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ images: updatedImages })
                })

                if (!updateRes.ok) throw new Error('Gagal update lapangan')
                addToast('success', 'Gambar berhasil ditambahkan')
                fetchField()
            }

        } catch (error) {
            console.error('Upload error:', error)
            addToast('error', 'Gagal mengupload gambar')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const handleDeleteImage = async (imageUrlToDelete: string) => {
        if (!confirm('Hapus gambar ini?')) return

        try {
            const currentImages = field?.images.map(img => img.imageUrl) || []
            const updatedImages = currentImages.filter(url => url !== imageUrlToDelete)

            const res = await fetch(`/api/fields/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: updatedImages })
            })

            if (!res.ok) throw new Error('Gagal menghapus gambar')

            addToast('success', 'Gambar berhasil dihapus')
            fetchField()
        } catch (error) {
            addToast('error', 'Gagal menghapus gambar')
        }
    }

    const parseBenefits = (benefits: string | undefined): string[] => {
        if (!benefits) return []
        try {
            const parsed = JSON.parse(benefits)
            return Array.isArray(parsed) ? parsed : [parsed]
        } catch {
            return benefits.split(',').map(b => b.trim()).filter(Boolean)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)' }} />
            </div>
        )
    }

    if (!field) return null

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/fields">
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {field.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="info">{field.type}</Badge>
                            <Badge variant={field.isActive ? 'success' : 'error'}>
                                {field.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                        </div>
                    </div>
                </div>
                <Link href={`/admin/fields/${field.id}/edit`}>
                    <Button size="sm">
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            <div className="grid lg:grid-cols-5 gap-4">
                {/* Gallery - Left Side */}
                <div className="lg:col-span-3">
                    <Card className="overflow-hidden">
                        {/* Main Image */}
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                            {selectedImage ? (
                                <Image
                                    src={selectedImage}
                                    alt={field.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-16 h-16 text-gray-300" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <CardContent className="p-3">
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {field.images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(img.imageUrl)}
                                        className={`relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === img.imageUrl ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <Image
                                            src={img.imageUrl}
                                            alt=""
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.imageUrl) }}
                                            className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <Trash2 className="w-3 h-3 text-white" />
                                        </button>
                                    </button>
                                ))}

                                {/* Add Image */}
                                <label className="w-16 h-12 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-[var(--accent)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex-shrink-0">
                                    <Upload className={`w-4 h-4 ${uploading ? 'animate-pulse' : ''}`} style={{ color: 'var(--text-muted)' }} />
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info - Right Side */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Price Card */}
                    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <CardContent className="p-4">
                            <p className="text-sm opacity-80">Harga per Jam</p>
                            <p className="text-2xl font-bold">{formatCurrency(Number(field.pricePerHour))}</p>
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ukuran</p>
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{field.size}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <Clock className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Jam Operasional</p>
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{field.openTime} - {field.closeTime}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    {field.description && (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Deskripsi</p>
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{field.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Benefits */}
                    {field.benefits && (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Fasilitas</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {parseBenefits(field.benefits).map((benefit, idx) => (
                                        <Badge key={idx} variant="default" className="text-xs">
                                            {benefit}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
