
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Link2,
    Share2,
    CheckCircle,
    Clock,
    UserPlus,
    Copy,
    Search,
    ChevronRight,
    TrendingUp,
    AlertTriangle,
    Mail,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LeadBarChart } from '@/components/ui/charts';
import { NewLeadModal } from '@/components/dashboard/NewLeadModal';
import { CreateInvoiceModal } from '@/components/dashboard/CreateInvoiceModal';
import Link from 'next/link';
import { useRealtime } from '@/hooks/useRealtime';
import SupportWidget from '@/components/support/SupportWidget';

export default function CommissionerDashboard() {
    const { data: session } = useSession();
    const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeProjects: 0,
        pendingLeads: 0,
        totalRevenue: 0,
        recentLeads: [] as any[],
        referralCode: ''
    });
    const [commissionerId, setCommissionerId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Profile to get Commissioner ID
                const profileRes = await fetch('/api/profile');
                if (!profileRes.ok) throw new Error('Failed to fetch profile');
                const profileData = await profileRes.json();

                let commId = null;
                if (profileData.success && profileData.data.roleData?.id) {
                    commId = profileData.data.roleData.id;
                    setCommissionerId(commId);
                }

                // 2. Fetch Projects (Parallel)
                const [projectsRes, leadsRes, paymentsRes, teamRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/leads'),
                    fetch('/api/payments'),
                    fetch('/api/commissioner/team')
                ]);

                const projectsData = projectsRes.ok ? await projectsRes.json() : { success: false };
                const leadsData = leadsRes.ok ? await leadsRes.json() : { success: false };
                const paymentsData = paymentsRes.ok ? await paymentsRes.json() : { success: false };
                const teamData = teamRes.ok ? await teamRes.json() : { success: false, referralCode: '' };

                // Process Projects
                const activeProjects = (projectsData.success && Array.isArray(projectsData.data))
                    ? projectsData.data.filter((p: any) => p.status === 'active' || p.status === 'in_progress' || p.status === 'deployed').length
                    : 0;

                // Process Leads
                let myLeads = [];
                if (leadsData.success && Array.isArray(leadsData.data)) {
                    myLeads = leadsData.data.filter((l: any) =>
                        l.commissioner_id === commId || l.claimed_by === commId
                    );
                }
                const pendingLeads = myLeads.filter((l: any) => l.status === 'created' || l.status === 'claimed' || l.status === 'active').length;
                const recentLeads = myLeads.slice(0, 5);

                // Process Payments
                const totalRevenue = (paymentsData.success && Array.isArray(paymentsData.data))
                    ? paymentsData.data.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
                    : 0;

                setStats({
                    activeProjects,
                    pendingLeads,
                    totalRevenue,
                    recentLeads,
                    referralCode: teamData.referralCode || ''
                });

            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    // Real-time updates - refresh data when tables change
    const refreshDashboard = useCallback(() => {
        if (!commissionerId || !session) return;

        // Refetch leads
        fetch('/api/leads').then(res => res.json()).then(data => {
            if (data.success) {
                const myLeads = data.data.filter((l: any) =>
                    l.commissioner_id === commissionerId || l.claimed_by === commissionerId
                );
                const pendingLeads = myLeads.filter((l: any) =>
                    l.status === 'created' || l.status === 'claimed'
                ).length;
                const recentLeads = myLeads.slice(0, 5);

                setStats(prev => ({
                    ...prev,
                    pendingLeads,
                    recentLeads
                }));
            }
        });

        // Refetch projects
        fetch('/api/projects').then(res => res.json()).then(data => {
            if (data.success) {
                const activeProjects = data.data.filter((p: any) =>
                    p.status === 'active' || p.status === 'in_progress'
                ).length;
                setStats(prev => ({ ...prev, activeProjects }));
            }
        });

        // Refetch payments for revenue
        fetch('/api/payments').then(res => res.json()).then(data => {
            if (data.success) {
                const totalRevenue = data.data.reduce((sum: number, p: any) =>
                    sum + (Number(p.amount) || 0), 0
                );
                setStats(prev => ({ ...prev, totalRevenue }));
            }
        });
    }, [session]);

    // Subscribe to real-time changes
    useRealtime(
        { table: 'leads', event: '*', enabled: !!commissionerId },
        refreshDashboard
    );

    useRealtime(
        { table: 'projects', event: '*', enabled: !!commissionerId },
        refreshDashboard
    );

    useRealtime(
        { table: 'payments', event: '*', enabled: !!commissionerId },
        refreshDashboard
    );

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        Welcome, {session?.user?.name?.split(' ')[0] || 'Partner'}! 👋
                    </h2>
                    <p className="text-gray-500 mt-2 text-lg">Manage your digital agency pipeline and client relationships.</p>
                </div>
                <button
                    onClick={() => setIsInvoiceOpen(true)}
                    className="bg-indigo-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                    <Mail className="w-4 h-4" />
                    New Invoice
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-xl shadow-indigo-100/50 bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 opacity-50 blur-xl group-hover:scale-110 transition-transform"></div>
                    <div className="relative">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Active Projects</p>
                        <h3 className="text-4xl font-black text-gray-900">{stats.activeProjects}</h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                            <TrendingUp className="w-3 h-3" />
                            <span>Current Workload</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-2 border-yellow-100 shadow-none bg-yellow-50/30 relative">
                    {stats.pendingLeads > 0 && (
                        <div className="absolute top-3 right-3 animate-pulse">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                    )}
                    <p className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-1">Pending Leads</p>
                    <h3 className="text-4xl font-black text-gray-900">{stats.pendingLeads}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-yellow-700 bg-yellow-100 w-fit px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3" />
                        <span>Action Required</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-lg bg-indigo-600 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700"></div>
                    <div className="relative z-10">
                        <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h3 className="text-4xl font-black text-white">KES {stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-xs text-indigo-200 mt-4">Lifetime Earnings</p>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Fast Leads Action */}
                <Card className="lg:col-span-1 p-8 border-gray-100 shadow-xl shadow-indigo-100/20 max-h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">New Client Lead</h3>
                            <p className="text-xs text-gray-400 font-medium">Add a prospect manually</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Manually add a new client lead to your pipeline.
                            Or share your referral link to let them sign up themselves.
                        </p>

                        <button
                            onClick={() => setIsNewLeadOpen(true)}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                            <Mail className="w-4 h-4" />
                            Create New Lead
                        </button>

                        <Link href="/dashboard/commissioner/onboard">
                            <button
                                className="w-full py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-xl font-bold text-sm uppercase tracking-widest hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mt-3"
                            >
                                <UserPlus className="w-4 h-4" />
                                Onboard New Client
                            </button>
                        </Link>

                        {/* Referral Link */}
                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">My Referral Link</p>
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <code className="text-xs text-indigo-600 truncate flex-1">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/join?ref=${stats.referralCode || '...'}` : 'Loading...'}
                                </code>
                                <button
                                    onClick={() => {
                                        if (stats.referralCode) {
                                            navigator.clipboard.writeText(`${window.location.origin}/join?ref=${stats.referralCode}`);
                                            alert('Referral link copied!');
                                        }
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                    <Copy className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Leads & Clients Panel */}
                <Card className="lg:col-span-2 p-0 border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-400" />
                            Recent Leads
                        </h3>
                        <Link href="/dashboard/commissioner/leads">
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">
                                View Pipeline
                            </button>
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.recentLeads.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No active leads found. Start by creating one!
                            </div>
                        ) : (
                            stats.recentLeads.map((lead, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                            {lead.client_name ? lead.client_name[0] : '?'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{lead.client_name}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-1">{lead.project_summary}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${lead.status === 'created' ? 'bg-blue-100 text-blue-700' :
                                            lead.status === 'claimed' ? 'bg-indigo-100 text-indigo-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {lead.status}
                                        </span>
                                        <Link href={`/dashboard/commissioner/leads`}>
                                            <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-indigo-600">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Performance Chart with Context */}
            <Card className="p-8 border-none bg-white shadow-xl shadow-green-100/30 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-1">Direct Intake Velocity</h3>
                        <p className="text-xs text-gray-400 font-medium">Referral conversion performance over the last 7 days</p>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                        View Full Report <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
                <LeadBarChart />
            </Card>

            {/* New Lead Modal */}
            <NewLeadModal isOpen={isNewLeadOpen} onClose={() => setIsNewLeadOpen(false)} commissionerId={commissionerId} />

            {/* Invoice Modal */}
            <CreateInvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} />

            <SupportWidget />
        </div>
    );
}
