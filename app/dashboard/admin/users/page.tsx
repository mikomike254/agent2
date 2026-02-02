'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Users,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Shield,
    Search,
    Filter,
    MoreVertical,
    UserCircle,
    Ban,
    ArrowUpCircle,
    CheckCircle,
    LogOut,
    Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRealtime } from '@/hooks/useRealtime';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            fetchUsers();
        }
    }, [session]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const result = await response.json();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Real-time integration
    const refreshUsers = useCallback(() => {
        fetchUsers();
    }, []);

    useRealtime(
        { table: 'users', event: '*', enabled: !!session },
        refreshUsers
    );

    const handleUserAction = async (userId: string, action: string, value: any) => {
        setProcessingAction(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, value })
            });
            const result = await response.json();
            if (result.success) {
                // Optimistic update or refresh
                fetchUsers();
            } else {
                alert(result.error || 'Action failed');
            }
        } catch (error) {
            console.error('Error performing user action:', error);
            alert('An error occurred');
        } finally {
            setProcessingAction(null);
        }
    };

    const handleImpersonate = async (userId: string) => {
        if (!confirm('Are you sure you want to impersonate this user?')) return;

        try {
            const response = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action: 'start' })
            });
            const result = await response.json();
            if (result.success) {
                // Refresh to trigger session update
                window.location.href = '/dashboard';
            } else {
                alert(result.error || 'Impersonation failed');
            }
        } catch (error) {
            console.error('Impersonation error:', error);
        }
    };

    const handleStopImpersonation = async () => {
        try {
            const response = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'stop' })
            });
            if (response.ok) {
                window.location.href = '/dashboard/admin/users';
            }
        } catch (error) {
            console.error('Error stopping impersonation:', error);
        }
    };

    const isImpersonating = (session as any)?.isImpersonating;

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            {isImpersonating && (
                <div className="p-4 bg-orange-600 text-white flex justify-between items-center rounded-2xl shadow-lg animate-pulse border-2 border-orange-400">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-widest text-xs">GOD MODE ACTIVE</span>
                        <span className="text-sm">Impersonating <b>{session?.user?.name}</b></span>
                    </div>
                    <button
                        onClick={handleStopImpersonation}
                        className="bg-white text-orange-600 px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Exit God Mode
                    </button>
                </div>
            )}

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nexus Command Center</h1>
                    <p className="text-gray-500 mt-2">Manage all registered platform members with absolute precision.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5347CE] focus:border-transparent outline-none w-64"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5347CE] outline-none bg-white font-medium"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="client">Client</option>
                        <option value="developer">Developer</option>
                        <option value="commissioner">Commissioner</option>
                    </select>
                </div>
            </div>

            <Card className="overflow-hidden border-gray-100 shadow-xl shadow-indigo-500/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/80 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Identity</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Authority</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Access</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Command</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-24"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No members detected in the Nexus.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={`group hover:bg-gray-50/80 transition-all ${user.status === 'banned' ? 'opacity-60 bg-red-50/10' : ''}`}>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'developer' ? 'bg-blue-100 text-blue-700' :
                                                            user.role === 'commissioner' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-green-100 text-green-700'
                                                    }`}>
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{user.name}</p>
                                                    <p className="text-sm text-gray-400 font-medium">{user.email}</p>
                                                    <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-tighter">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest w-fit ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'developer' ? 'bg-blue-100 text-blue-700' :
                                                            user.role === 'commissioner' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-green-100 text-green-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'set-role', user.role === 'admin' ? 'client' : 'admin')}
                                                        className="text-[9px] font-bold text-indigo-600 hover:underline"
                                                    >
                                                        {user.role === 'admin' ? 'DEMOTE' : 'MAKE ADMIN'}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'verify', !user.verified)}
                                                    className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${user.verified ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                                                        }`}
                                                >
                                                    {user.verified ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                                    <span className="text-xs font-bold uppercase tracking-tight">
                                                        {user.verified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                </button>
                                                <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${user.status === 'active' ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-indigo-600' : 'bg-red-600'}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{user.status}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleImpersonate(user.id)}
                                                    title="Impersonate User"
                                                    disabled={user.id === session?.user?.id || processingAction === user.id}
                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'set-status', user.status === 'active' ? 'banned' : 'active')}
                                                    title={user.status === 'active' ? 'Ban User' : 'Restore User'}
                                                    disabled={user.id === session?.user?.id || processingAction === user.id}
                                                    className={`p-2 rounded-xl transition-all ${user.status === 'active'
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                                            : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                                                        }`}
                                                >
                                                    <Ban className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
