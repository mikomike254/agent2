'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { RevenueLineChart } from '@/components/ui/charts';
import {
    CheckCircle,
    AlertCircle,
    Shield,
    DollarSign,
    Eye,
    TrendingUp,
    Briefcase,
    Mail,
    Loader2,
    Search,
    Activity,
    Zap,
    Users,
    ArrowRight,
    Server,
    Scale
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRealtime } from '@/hooks/useRealtime';
import Link from 'next/link';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProposals, setLoadingProposals] = useState(true);
    const [stats, setStats] = useState<any>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch data on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, propRes, statsRes] = await Promise.all([
                    fetch('/api/admin/users/pending'),
                    fetch('/api/admin/proposals'),
                    fetch('/api/admin/metrics')
                ]);
                const userResult = await userRes.json();
                const propResult = await propRes.json();
                const statsResult = await statsRes.json();

                if (userResult.success) setPendingUsers(userResult.data);
                if (propResult.success) setProposals(propResult.data);
                if (statsResult.success) setStats(statsResult.stats);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
                setLoadingProposals(false);
            }
        };

        if (session?.user) {
            fetchData();
        }
    }, [session]);

    // Admin Search Handler
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            try {
                const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.results);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearching(false);
            }
        };

        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Close search on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Real-time updates
    const refreshAdminData = useCallback(() => {
        if (!session?.user) return;
        fetch('/api/admin/users/pending').then(res => res.json()).then(data => {
            if (data.success) setPendingUsers(data.data);
        });
        fetch('/api/admin/proposals').then(res => res.json()).then(data => {
            if (data.success) setProposals(data.data);
        });
        fetch('/api/admin/metrics').then(res => res.json()).then(data => {
            if (data.success) setStats(data.stats);
        });
    }, [session?.user]);

    useRealtime({ table: 'users', event: '*', enabled: !!session?.user }, refreshAdminData);
    useRealtime({ table: 'leads', event: '*', enabled: !!session?.user }, refreshAdminData);
    useRealtime({ table: 'payments', event: '*', enabled: !!session?.user }, refreshAdminData);

    const handleApproveUser = async (userId: string, action: 'approve' | 'reject') => {
        const response = await fetch(`/api/admin/users/${userId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, notes: action === 'approve' ? 'Approved by admin' : 'Rejected by admin' })
        });
        const result = await response.json();
        if (result.success) {
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    const handleApproveProposal = async (proposalId: string) => {
        if (!confirm('Approve this proposal and create a project?')) return;
        try {
            const response = await fetch(`/api/admin/proposals/${proposalId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();
            if (result.success) {
                setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'approved' } : p));
            }
        } catch (err) {
            console.error('Error approving proposal:', err);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header with Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Nexus <span className="text-[#5347CE]">Command</span></h2>
                    <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest">Platform Status: Optimal</span>
                    </div>
                </div>

                <div className="relative flex-1 max-w-2xl" ref={searchRef}>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5347CE] transition-colors" />
                        <input
                            type="text"
                            placeholder="Universal Search (Users, Projects, Leads, Payments...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent shadow-xl shadow-indigo-500/5 rounded-2xl focus:border-[#5347CE] outline-none transition-all placeholder:text-gray-400 font-medium"
                        />
                        {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-300" />}
                    </div>

                    {/* Search Results Dropdown */}
                    {searchQuery.length >= 2 && (
                        <Card className="absolute top-full left-0 right-0 mt-2 z-50 p-2 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            {searchResults.length === 0 && !searching ? (
                                <div className="p-8 text-center text-gray-400 italic">No records found in the Nexus.</div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {searchResults.map((item, idx) => (
                                        <Link
                                            key={`${item.type}-${item.id}-${idx}`}
                                            href={
                                                item.type === 'user' ? '/dashboard/admin/users' :
                                                    item.type === 'project' ? `/dashboard/admin/projects/${item.id}` :
                                                        item.type === 'lead' ? '/dashboard/admin/leads' :
                                                            '/dashboard/admin/payments'
                                            }
                                            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors rounded-xl"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'user' ? 'bg-purple-50 text-purple-600' :
                                                    item.type === 'project' ? 'bg-blue-50 text-blue-600' :
                                                        item.type === 'lead' ? 'bg-orange-50 text-orange-600' :
                                                            'bg-green-50 text-green-600'
                                                    }`}>
                                                    {item.type === 'user' ? <Users className="w-5 h-5" /> :
                                                        item.type === 'project' ? <Briefcase className="w-5 h-5" /> :
                                                            item.type === 'lead' ? <TrendingUp className="w-5 h-5" /> :
                                                                <DollarSign className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{item.name || item.title || item.reference}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.type} • {item.email || item.status || item.amount}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                    { label: 'Activity', icon: Activity, href: '/dashboard/admin/activity' },
                    { label: 'Conflicts', icon: AlertCircle, href: '/dashboard/admin/disputes' },
                    { label: 'Users', icon: Users, href: '/dashboard/admin/users' },
                    { label: 'Projects', icon: Briefcase, href: '/dashboard/admin/projects' },
                    { label: 'Ledger', icon: Shield, href: '/dashboard/admin/ledger' },
                    { label: 'Payments', icon: DollarSign, href: '/dashboard/admin/payments' },
                    { label: 'Support', icon: Mail, href: '/dashboard/admin/support' },
                ].map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="p-4 bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#5347CE] hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
                    >
                        <action.icon className="w-5 h-5 text-gray-400 group-hover:text-[#5347CE]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Platform Stats */}
            <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 border-l-4 border-rose-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                            <Scale className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Conflict Queue</p>
                            <h3 className="text-2xl font-black text-gray-900">{stats?.disputes?.open || 0}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-rose-600 font-bold uppercase tracking-tight">
                        <Link href="/dashboard/admin/disputes" className="hover:underline flex items-center gap-1">Arbitrate Now <ArrowRight className="w-3 h-3" /></Link>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-green-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Project Pulse</p>
                            <h3 className="text-2xl font-black text-gray-900">{stats?.projects?.active || 0} / {stats?.projects?.total || 0}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600 font-bold uppercase tracking-tight">
                        <span>Background Production Active</span>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-indigo-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Escrow Vault</p>
                            <h3 className="text-2xl font-black text-gray-900">KES {(stats?.revenue?.total || 0).toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold uppercase tracking-tight">
                        <span>Total Transaction Volume</span>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-purple-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Nodes</p>
                            <h3 className="text-2xl font-black text-gray-900">{stats?.users?.total || 0}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-600 font-bold uppercase tracking-tight">
                        <span>{stats?.users?.pending || 0} awaiting clearance</span>
                    </div>
                </Card>
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6 border-none shadow-xl shadow-indigo-500/5 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Financial Velocity</h3>
                            <p className="text-sm text-gray-500 font-medium">Escrow inflow & outflow over time</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#1f7a5a] bg-green-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3" /> +12.5%
                            </span>
                        </div>
                    </div>
                    <RevenueLineChart />
                </Card>

                <Card className="p-6 border-none shadow-xl shadow-indigo-500/5 bg-[#5347CE] text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-black uppercase tracking-tight mb-1">System Pulse</h3>
                        <p className="text-indigo-200 text-sm font-medium mb-6">Real-time node health</p>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                                    <span>Database Load</span>
                                    <span>24%</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-1.5">
                                    <div className="bg-emerald-400 h-1.5 rounded-full w-[24%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                                    <span>API Latency</span>
                                    <span>45ms</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-1.5">
                                    <div className="bg-emerald-400 h-1.5 rounded-full w-[15%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                                    <span>Active Workers</span>
                                    <span>{stats?.projects?.active || 3}</span>
                                </div>
                                <div className="w-full bg-black/20 rounded-full h-1.5">
                                    <div className="bg-white h-1.5 rounded-full w-[60%] animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                            <div className="text-center">
                                <p className="text-2xl font-black">{stats?.users?.total || 12}</p>
                                <p className="text-[10px] uppercase tracking-widest text-indigo-200">Nodes</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black">{stats?.disputes?.open || 0}</p>
                                <p className="text-[10px] uppercase tracking-widest text-indigo-200">Alerts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black">99.9%</p>
                                <p className="text-[10px] uppercase tracking-widest text-indigo-200">Uptime</p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract bg decoration */}
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Pending User Registrations */}
                <Card className="p-0 overflow-hidden border-none shadow-xl shadow-indigo-500/5">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-gray-400" />
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">New Entrants</h3>
                        </div>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {pendingUsers.length} PENDING
                        </span>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Scanning for new souls...</div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="p-12 text-center">
                                <CheckCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium italic">Nexus is currently stable. No pending entrants.</p>
                            </div>
                        ) : (
                            pendingUsers.map((user) => (
                                <div key={user.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${user.role === 'commissioner' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                {user.name?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{user.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${user.role === 'commissioner' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                        {user.role}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-500">
                                                    <p>{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveUser(user.id, 'approve')}
                                                className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleApproveUser(user.id, 'reject')}
                                                className="p-2 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-red-600 hover:border-red-100 transition-colors"
                                            >
                                                <AlertCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Proposals */}
                <Card className="p-0 overflow-hidden border-none shadow-xl shadow-indigo-500/5">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-gray-400" />
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Project Sparks</h3>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {loadingProposals ? (
                            <div className="p-8 text-center text-gray-500">Detecting project initiations...</div>
                        ) : proposals.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic">Static signals. No proposals detected.</div>
                        ) : (
                            proposals.map((prop) => (
                                <div key={prop.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-bold text-indigo-600">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{prop.project_title}</h4>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">CLIENT: {prop.client_name}</p>
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-2 font-medium">{prop.project_description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {prop.status !== 'approved' ? (
                                        <button
                                            onClick={() => handleApproveProposal(prop.id)}
                                            className="w-full mt-2 py-3 bg-[#5347CE] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            Initialize Production
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="mt-2 py-2 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
                                            Production Active
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
