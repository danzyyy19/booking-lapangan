'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    useToast
} from '@/components/ui'
import {
    ArrowLeft,
    ImageIcon,
    Upload,
    Save
} from 'lucide-react'

const fieldTypes = [
    { value: 'futsal', label: 'Futsal' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'basket', label: 'Basket' },
    { value: 'tenis', label: 'Tenis' },
    { value: 'voli', label: 'Voli' },
]

export default function EditFieldPage() {
    const params = useParams()
    const router = useRouter()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        type: 'futsal',
        size: '',
        description: '',
        benefits: '',
        pricePerHour: '',
        openTime: '08:00',
        closeTime: '22:00',
        imageUrl: '',
    })

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
            const field = data.field

            // Parse benefits safely
            let benefitsStr = ''
            if (field.benefits) {
                try {
                    const parsed = JSON.parse(field.benefits)
                    benefitsStr = Array.isArray(parsed) ? parsed.join(', ') : field.benefits
                } catch {
                    benefitsStr = field.benefits
                }
            }

            setFormData({
                name: field.name,
                type: field.type,
                size: field.size,
                description: field.description || '',
                benefits: benefitsStr,
                pricePerHour: String(field.pricePerHour),
                openTime: field.openTime,
                closeTime: field.closeTime,
                imageUrl: field.images?.[0]?.imageUrl || '',
            })

            if (field.images?.[0]?.imageUrl) {
                setPreviewUrl(field.images[0].imageUrl)
            }
        } catch (error) {
            console.error('Error:', error)
            addToast('error', 'Gagal memuat data lapangan')
            router.push('/admin/fields')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            addToast('error', 'Ukuran file maksimal 2MB')
            return
        }

        if (!file.type.startsWith('image/')) {
            addToast('error', 'File harus berupa gambar')
            return
        }

        setSelectedFile(file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            let imageUrl = formData.imageUrl

            if (selectedFile) {
                const uploadFormData = new FormData()
                uploadFormData.append('file', selectedFile)

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                })

                if (!uploadRes.ok) throw new Error('Gagal upload gambar')
                const uploadData = await uploadRes.json()
                imageUrl = uploadData.url
            }

            const res = await fetch(`/api/fields/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    pricePerHour: Number(formData.pricePerHour),
                    benefits: formData.benefits.split(',').map(b => b.trim()).filter(Boolean),
                    images: imageUrl ? [imageUrl] : [],
                }),
            })

            if (!res.ok) throw new Error('Gagal menyimpan')

            addToast('success', 'Lapangan berhasil diperbarui')
            router.push('/admin/fields')
        } catch (error) {
            addToast('error', 'Gagal menyimpan lapangan')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)' }} />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/fields">
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Edit Lapangan</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formData.name}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {/* Image Preview */}
                        <div className="flex gap-4">
                            <div className="relative w-32 h-20 rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                    <Upload className="w-4 h-4" />
                                    Ganti Gambar
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Max 2MB, JPG/PNG</p>
                            </div>
                        </div>

                        {/* Form Fields - 2 Column */}
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Nama Lapangan"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Select
                                label="Jenis"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                options={fieldTypes}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Ukuran"
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                placeholder="20x40m"
                                required
                            />
                            <Input
                                label="Harga/Jam (Rp)"
                                type="number"
                                value={formData.pricePerHour}
                                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Jam Buka"
                                type="time"
                                value={formData.openTime}
                                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                            />
                            <Input
                                label="Jam Tutup"
                                type="time"
                                value={formData.closeTime}
                                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                            />
                        </div>

                        <Input
                            label="Deskripsi"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Deskripsi singkat lapangan..."
                        />

                        <Input
                            label="Fasilitas (pisah koma)"
                            value={formData.benefits}
                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                            placeholder="AC, WiFi, Parkir"
                        />
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                    <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
                        Batal
                    </Button>
                    <Button type="submit" loading={saving} className="flex-1">
                        <Save className="w-4 h-4" />
                        Simpan
                    </Button>
                </div>
            </form>
        </div>
    )
}
