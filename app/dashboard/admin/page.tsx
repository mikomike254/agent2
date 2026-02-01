// Admin Dashboard
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { RevenueLineChart } from '@/components/ui/charts';
import { CheckCircle, AlertCircle, Shield, DollarSign, Eye, TrendingUp, Briefcase, Mail, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/card';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingProposals, setLoadingProposals] = useState(true);

    // Fetch data on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, propRes] = await Promise.all([
                    fetch('/api/admin/users/pending'),
                    fetch('/api/admin/proposals')
                ]);
                const userResult = await userRes.json();
                const propResult = await propRes.json();

                if (userResult.success) setPendingUsers(userResult.data);
                if (propResult.success) {
                    setProposals(propResult.data);
                }
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

    const handleVerifyPayment = async (paymentId: string) => {
        const response = await fetch(`/api/admin/payments/${paymentId}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                admin_id: (session?.user as any)?.id,
                notes: 'Payment verified manually'
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Payment verified and escrow created!');
            setSelectedPayment(null);
        }
    };

    const handleApproveUser = async (userId: string, action: 'approve' | 'reject') => {
        const response = await fetch(`/api/admin/users/${userId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                notes: action === 'approve' ? 'Approved by admin' : 'Rejected by admin'
            })
        });

        const result = await response.json();
        if (result.success) {
            alert(action === 'approve'
                ? 'User approved! They can now access their dashboard.'
                : 'User rejected.');

            // Remove user from list locally
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
                alert('Proposal approved! Project created and client profile initialized.');
                setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'approved' } : p));
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err) {
            console.error('Error approving proposal:', err);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Overview</h2>
                <p className="text-gray-500 mt-2">Welcome back. Here's what's happening today.</p>
            </div>

            {/* Stats Grid - Soft Cards */}
            <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending Verifications</p>
                            <h3 className="text-2xl font-bold text-gray-900">{pendingUsers.length + proposals.filter(p => p.status === 'pending_admin_approval').length}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 w-fit px-2 py-1 rounded-lg">
                        <span>Requires action</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Projects</p>
                            <h3 className="text-2xl font-bold text-gray-900">28</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                        <span>+12% this month</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#5347CE]/10 rounded-2xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-[#5347CE]" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Escrow Balance</p>
                            <h3 className="text-2xl font-bold text-gray-900">KES 2.1M</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#5347CE] bg-[#5347CE]/10 w-fit px-2 py-1 rounded-lg">
                        <span>Securely held</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900">KES 450K</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 w-fit px-2 py-1 rounded-lg">
                        <span>+8% vs last week</span>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Pending User Registrations */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h3 className="text-lg font-bold text-gray-900">New Registrations</h3>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                            {pendingUsers.length} Pending
                        </span>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading requests...</div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500">All caught up! No pending registrations.</p>
                            </div>
                        ) : (
                            pendingUsers.map((user) => (
                                <div key={user.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${user.role === 'commissioner' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                {user.name?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{user.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${user.role === 'commissioner' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-500 space-y-1">
                                                    <p>{user.email}</p>
                                                    <p>{user.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pl-16">
                                        <button
                                            onClick={() => handleApproveUser(user.id, 'approve')}
                                            className="px-4 py-2 bg-[#5347CE] text-white rounded-xl text-sm font-medium hover:bg-[#4539B4] hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleApproveUser(user.id, 'reject')}
                                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Inbound Proposals (Converted to Admin Dash) */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h3 className="text-lg font-bold text-gray-900">Inbound Proposals (Email)</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                            Take Over Request
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loadingProposals ? (
                            <div className="p-8 text-center text-gray-500">Loading proposals...</div>
                        ) : proposals.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 italic">No new proposals.</div>
                        ) : (
                            proposals.map((prop) => (
                                <div key={prop.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center font-bold text-green-600 shadow-sm">
                                                <Mail className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{prop.project_title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">From: {prop.commissioner?.user?.name || 'Commissioner'}</p>
                                                <div className="mt-3 space-y-1">
                                                    <p className="text-sm font-semibold text-gray-700">Client: {prop.client_name}</p>
                                                    <p className="text-xs text-gray-500">{prop.client_email}</p>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">{prop.project_description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${prop.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {prop.status}
                                            </span>
                                            <p className="text-lg font-bold text-[#5347CE] mt-2">
                                                {prop.budget ? `KES ${prop.budget}` : 'Quote Request'}
                                            </p>
                                        </div>
                                    </div>
                                    {prop.status !== 'approved' && (
                                        <div className="flex gap-3 pl-16">
                                            <button
                                                onClick={() => handleApproveProposal(prop.id)}
                                                className="px-4 py-2 bg-[#5347CE] text-white rounded-xl text-sm font-medium hover:bg-[#4539B4] transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve & Initialize Project
                                            </button>
                                            <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-all">
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Activity / Financial Ledger */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Financial Ledger Placeholder or actual data */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Ledger</h3>
                    <Card className="p-0 overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 1 ? 'bg-green-50 text-green-600' :
                                            i === 2 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {i === 1 ? <Shield className="w-5 h-5" /> : i === 2 ? <DollarSign className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{
                                                i === 1 ? 'Escrow Hold Created' :
                                                    i === 2 ? 'Funds Released' : 'Refund Issued'
                                            }</p>
                                            <p className="text-xs text-gray-500">Project #{1000 + i} • 2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${i === 1 ? 'text-green-600' :
                                            i === 2 ? 'text-blue-600' : 'text-red-600'
                                            }`}>
                                            {i === 3 ? '-' : '+'}KES {150 * i},000
                                        </p>
                                        <p className="text-xs text-gray-400">Completed</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Additional Stats or Activity */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-indigo-100 text-sm font-bold uppercase tracking-widest">Platform Growth</h3>
                                <p className="text-3xl font-black mt-1">+245%</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-indigo-300" />
                        </div>
                        <div className="h-24 w-full">
                            {/* Growth visualization placeholder */}
                            <div className="flex items-end gap-1 h-full">
                                {[30, 45, 25, 60, 80, 55, 90].map((h, i) => (
                                    <div key={i} className="flex-1 bg-white/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
