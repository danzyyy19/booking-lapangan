'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    Modal,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@/components/ui'
import { useToast } from '@/components/ui'
import {
    Plus,
    Pencil,
    Trash2,
    MapPin,
    Search,
    ToggleLeft,
    ToggleRight,
    Eye,
    Upload,
    ImageIcon,
    X,
    LayoutGrid,
    List,
    Clock
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
    images: { id: string; imageUrl: string }[]
}

const fieldTypes = [
    { value: 'futsal', label: 'Futsal' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'basket', label: 'Basket' },
    { value: 'tenis', label: 'Tenis' },
    { value: 'voli', label: 'Voli' },
]

export default function AdminFieldsPage() {
    const { addToast } = useToast()
    const [fields, setFields] = useState<Field[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingField, setEditingField] = useState<Field | null>(null)
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
        fetchFields()
    }, [])

    const fetchFields = async () => {
        try {
            const res = await fetch('/api/fields')
            const data = await res.json()
            setFields(data.fields || [])
        } catch (error) {
            console.error('Error fetching fields:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (field?: Field) => {
        setSelectedFile(null)
        setPreviewUrl('')

        if (field) {
            setEditingField(field)
            setFormData({
                name: field.name,
                type: field.type,
                size: field.size,
                description: field.description || '',
                benefits: field.benefits || '',
                pricePerHour: String(field.pricePerHour),
                openTime: field.openTime,
                closeTime: field.closeTime,
                imageUrl: field.images[0]?.imageUrl || '',
            })
            if (field.images[0]?.imageUrl) {
                setPreviewUrl(field.images[0].imageUrl)
            }
        } else {
            setEditingField(null)
            setFormData({
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
        }
        setModalOpen(true)
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

            const url = editingField
                ? `/api/fields/${editingField.id}`
                : '/api/fields'

            const res = await fetch(url, {
                method: editingField ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    pricePerHour: Number(formData.pricePerHour),
                    benefits: formData.benefits.split(',').map(b => b.trim()).filter(Boolean),
                    images: imageUrl ? [imageUrl] : [],
                }),
            })

            if (!res.ok) throw new Error('Gagal menyimpan')

            addToast('success', editingField ? 'Lapangan berhasil diperbarui' : 'Lapangan berhasil ditambahkan')
            setModalOpen(false)
            fetchFields()
        } catch (error) {
            addToast('error', 'Gagal menyimpan lapangan')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus lapangan ini?')) return

        try {
            const res = await fetch(`/api/fields/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Gagal menghapus')

            addToast('success', 'Lapangan berhasil dihapus')
            fetchFields()
        } catch (error) {
            addToast('error', 'Gagal menghapus lapangan')
        }
    }

    const handleToggleActive = async (field: Field) => {
        try {
            const res = await fetch(`/api/fields/${field.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !field.isActive }),
            })

            if (!res.ok) throw new Error('Gagal mengubah status')

            addToast('success', `Lapangan ${!field.isActive ? 'diaktifkan' : 'dinonaktifkan'}`)
            fetchFields()
        } catch (error) {
            addToast('error', 'Gagal mengubah status')
        }
    }

    const filteredFields = fields.filter((field) => {
        const matchSearch = field.name.toLowerCase().includes(search.toLowerCase())
        const matchType = typeFilter === 'all' || field.type === typeFilter
        return matchSearch && matchType
    })

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Kelola Lapangan
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Tambah, edit, atau hapus lapangan
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()} size="sm">
                    <Plus className="w-4 h-4" />
                    Tambah Lapangan
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex-1 relative w-full">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: 'var(--text-muted)' }}
                        />
                        <Input
                            placeholder="Cari lapangan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        options={[{ value: 'all', label: 'Semua Jenis' }, ...fieldTypes]}
                    />
                    {/* View Toggle */}
                    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-hover)]'}`}
                            style={{ color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)' }}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-hover)]'}`}
                            style={{ color: viewMode === 'list' ? 'white' : 'var(--text-secondary)' }}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)' }} />
                </div>
            ) : filteredFields.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p style={{ color: 'var(--text-muted)' }}>Tidak ada lapangan ditemukan</p>
                    </CardContent>
                </Card>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredFields.map((field) => (
                        <Card key={field.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                                {field.images[0] ? (
                                    <Image
                                        src={field.images[0].imageUrl}
                                        alt={field.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant={field.isActive ? 'success' : 'error'}>
                                        {field.isActive ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{field.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="info" className="text-xs">{field.type}</Badge>
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                                    <Clock className="w-3 h-3" />
                                    {field.openTime} - {field.closeTime}
                                </div>
                                <p className="text-sm font-bold mb-3" style={{ color: 'var(--accent)' }}>
                                    {formatCurrency(Number(field.pricePerHour))}/jam
                                </p>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleToggleActive(field)}
                                        className="flex-1 p-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                        style={{ color: field.isActive ? 'var(--success)' : 'var(--text-muted)' }}
                                    >
                                        {field.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    </button>
                                    <Link href={`/admin/fields/${field.id}`} className="flex-1">
                                        <button className="w-full p-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: 'var(--text-secondary)' }}>
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </Link>
                                    <Link href={`/admin/fields/${field.id}/edit`} className="flex-1">
                                        <button className="w-full p-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: 'var(--accent)' }}>
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(field.id)}
                                        className="flex-1 p-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                        style={{ color: 'var(--error)' }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* List View */
                <Card padding="none">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lapangan</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Ukuran</TableHead>
                                <TableHead>Harga/Jam</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFields.map((field) => (
                                <TableRow key={field.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-100">
                                                {field.images[0] ? (
                                                    <Image
                                                        src={field.images[0].imageUrl}
                                                        alt={field.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                                    {field.name}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {field.openTime} - {field.closeTime}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="info">{field.type}</Badge>
                                    </TableCell>
                                    <TableCell>{field.size}</TableCell>
                                    <TableCell>{formatCurrency(Number(field.pricePerHour))}</TableCell>
                                    <TableCell>
                                        <Badge variant={field.isActive ? 'success' : 'error'}>
                                            {field.isActive ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleToggleActive(field)}
                                                className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                                style={{ color: field.isActive ? 'var(--success)' : 'var(--text-muted)' }}
                                            >
                                                {field.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            </button>
                                            <Link href={`/admin/fields/${field.id}`}>
                                                <button className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: 'var(--text-secondary)' }}>
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <Link href={`/admin/fields/${field.id}/edit`}>
                                                <button className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: 'var(--accent)' }}>
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(field.id)}
                                                className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                                style={{ color: 'var(--error)' }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingField ? 'Edit Lapangan' : 'Tambah Lapangan'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Nama Lapangan"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Select
                            label="Jenis Lapangan"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={fieldTypes}
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Ukuran"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            placeholder="20x40m"
                            required
                        />
                        <Input
                            label="Harga per Jam"
                            type="number"
                            value={formData.pricePerHour}
                            onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
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
                        placeholder="Deskripsi lapangan..."
                    />

                    <Input
                        label="Benefits (pisahkan dengan koma)"
                        value={formData.benefits}
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        placeholder="AC, WiFi, Parkir gratis"
                    />

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            Gambar Lapangan
                        </label>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-6 py-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative">
                            <div className="text-center">
                                {previewUrl ? (
                                    <div className="relative">
                                        <div className="relative h-40 w-full mb-3">
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                width={300}
                                                height={200}
                                                className="rounded-lg object-contain mx-auto"
                                            />
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setSelectedFile(null)
                                                setPreviewUrl('')
                                                setFormData({ ...formData, imageUrl: '' })
                                            }}
                                        >
                                            Hapus
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="mx-auto h-10 w-10 text-gray-300" aria-hidden="true" />
                                        <div className="mt-3 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                                            <label
                                                htmlFor="field-image-upload"
                                                className="relative cursor-pointer rounded-md bg-transparent font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] focus-within:outline-none"
                                            >
                                                <span>Upload gambar</span>
                                                <input
                                                    id="field-image-upload"
                                                    name="field-image-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                            <p className="pl-1">atau drag and drop</p>
                                        </div>
                                        <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">PNG, JPG, JPEG up to 2MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            loading={saving}
                        >
                            {editingField ? 'Simpan Perubahan' : 'Tambah Lapangan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
