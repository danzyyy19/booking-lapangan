'use client'

import { useState, useEffect } from 'react'
import {
    Card,
    CardContent,
    Button,
    Input,
    Select,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Modal
} from '@/components/ui'
import { useToast } from '@/components/ui'
import { Search, User, Shield, Trash2 } from 'lucide-react'

interface UserData {
    id: string
    name: string
    email: string
    phone?: string
    role: 'ADMIN' | 'STAFF' | 'CUSTOMER'
    createdAt: string
    _count: { bookings: number }
}

const roleOptions = [
    { value: 'all', label: 'Semua Role' },
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'STAFF', label: 'Staff' },
    { value: 'ADMIN', label: 'Admin' },
]

export default function AdminUsersPage() {
    const { addToast } = useToast()
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [processing, setProcessing] = useState(false)

    useEffect(() => { fetchUsers() }, [roleFilter])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            let url = '/api/users'
            if (roleFilter !== 'all') url += `?role=${roleFilter}`
            const res = await fetch(url)
            const data = await res.json()
            setUsers(data.users || [])
        } catch { addToast('error', 'Gagal memuat') } finally { setLoading(false) }
    }

    const handleChangeRole = async (newRole: string) => {
        if (!selectedUser) return
        setProcessing(true)
        try {
            const res = await fetch(`/api/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            if (!res.ok) throw new Error()
            addToast('success', `Role diubah ke ${newRole}`)
            setIsEditModalOpen(false)
            fetchUsers()
        } catch { addToast('error', 'Gagal') } finally { setProcessing(false) }
    }

    const handleDelete = async (user: UserData) => {
        if (!confirm(`Hapus ${user.name}?`)) return
        try {
            const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            addToast('success', 'Dihapus')
            fetchUsers()
        } catch { addToast('error', 'Gagal hapus') }
    }

    const filteredUsers = users.filter((u) => {
        const q = search.toLowerCase()
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN': return <Badge variant="error">Admin</Badge>
            case 'STAFF': return <Badge variant="warning">Staff</Badge>
            default: return <Badge variant="info">Customer</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Kelola Pengguna</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Daftar semua pengguna</p>
            </div>

            <Card>
                <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <Input placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} options={roleOptions} />
                    </div>
                </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto" style={{ borderColor: 'var(--accent)' }} />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <Card><CardContent className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Tidak ada user</CardContent></Card>
                ) : (
                    filteredUsers.map((u) => (
                        <Card key={u.id}>
                            <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                            <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                                        </div>
                                    </div>
                                    {getRoleBadge(u.role)}
                                </div>
                                <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <span>{u._count.bookings} booking</span>
                                    <span>{new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex gap-1 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => { setSelectedUser(u); setIsEditModalOpen(true) }}>
                                        <Shield className="w-3 h-3" /> Role
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table */}
            <Card padding="none" className="hidden sm:block">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Booking</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Tidak ada user</TableCell></TableRow>
                            ) : (
                                filteredUsers.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <p className="font-medium text-sm">{u.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                                        <TableCell>{u._count.bookings}</TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="secondary" onClick={() => { setSelectedUser(u); setIsEditModalOpen(true) }}>
                                                    <Shield className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Role">
                {selectedUser && (
                    <div className="space-y-3">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ubah role untuk <strong>{selectedUser.name}</strong></p>
                        {['CUSTOMER', 'STAFF', 'ADMIN'].map((role) => (
                            <button
                                key={role}
                                className="w-full p-3 text-left rounded-lg border"
                                style={{
                                    borderColor: selectedUser.role === role ? 'var(--accent)' : 'var(--border-color)',
                                    backgroundColor: selectedUser.role === role ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: 'var(--text-primary)'
                                }}
                                onClick={() => handleChangeRole(role)}
                                disabled={processing}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    )
}
