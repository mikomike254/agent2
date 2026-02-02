
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
import { UniversalProjectModal } from '@/components/projects/UniversalProjectModal';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRealtime } from '@/hooks/useRealtime';
import SupportWidget from '@/components/support/SupportWidget';
import { NotificationMenu } from '@/components/dashboard/NotificationMenu';

export default function CommissionerDashboard() {
    const { data: session } = useSession();
    const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

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
                const profileRes = await fetch('/api/profile', { cache: 'no-store' });
                if (!profileRes.ok) throw new Error('Failed to fetch profile');
                const profileData = await profileRes.json();

                let commId = null;
                if (profileData.success && profileData.data.roleData?.id) {
                    commId = profileData.data.roleData.id;
                    setCommissionerId(commId);
                }

                // 2. Fetch Projects (Parallel)
                const [projectsRes, leadsRes, paymentsRes, teamRes] = await Promise.all([
                    fetch('/api/projects', { cache: 'no-store' }),
                    fetch('/api/leads', { cache: 'no-store' }),
                    fetch('/api/payments', { cache: 'no-store' }),
                    fetch('/api/commissioner/team', { cache: 'no-store' })
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
        fetch('/api/leads', { cache: 'no-store' }).then(res => res.json()).then(data => {
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
        fetch('/api/projects', { cache: 'no-store' }).then(res => res.json()).then(data => {
            if (data.success) {
                const activeProjects = data.data.filter((p: any) =>
                    p.status === 'active' || p.status === 'in_progress'
                ).length;
                setStats(prev => ({ ...prev, activeProjects }));
            }
        });

        // Refetch payments for revenue
        fetch('/api/payments', { cache: 'no-store' }).then(res => res.json()).then(data => {
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
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-black/5 border-t-black dark:border-white/5 dark:border-t-white rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Syncing Partner Node</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
                <div>
                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                        Partner<span className="text-gray-400">.</span>KE
                    </h2>
                    <p className="text-gray-500 font-medium mt-4 text-lg">
                        Welcome, <span className="text-black dark:text-white font-black">{session?.user?.name?.split(' ')[0] || 'Partner'}</span>. Managing your premium agency pipeline.
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <NotificationMenu />
                    <button
                        onClick={() => setIsInvoiceOpen(true)}
                        className="bg-white dark:bg-black text-black dark:text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border border-[var(--border-color)]"
                    >
                        <Mail className="w-4 h-4" />
                        Invoicing
                    </button>
                    <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Launch Project
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="card-soft p-12 bg-white dark:bg-[#111] border-none shadow-none relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Active Projects</p>
                        <h3 className="text-6xl font-black text-black dark:text-white tracking-tighter">{stats.activeProjects}</h3>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/10 w-fit px-4 py-1.5 rounded-full uppercase tracking-tighter">
                            <TrendingUp className="w-3 h-3" />
                            <span>Current Scale</span>
                        </div>
                    </div>
                </Card>

                <Card className="card-soft p-12 bg-white dark:bg-[#111] border-none shadow-none relative overflow-hidden group">
                    {stats.pendingLeads > 0 && (
                        <div className="absolute top-8 right-8 animate-pulse">
                            <div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full shadow-[0_0_15px_var(--accent)]"></div>
                        </div>
                    )}
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Pending Response</p>
                    <h3 className="text-6xl font-black text-black dark:text-white tracking-tighter">{stats.pendingLeads}</h3>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/10 w-fit px-4 py-1.5 rounded-full uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        <span>Action Required</span>
                    </div>
                </Card>

                <Card className="card-soft p-12 bg-black dark:bg-white text-white dark:text-black border-none shadow-none relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Gross Revenue</p>
                        <h3 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                            <span className="text-lg font-bold opacity-40 mr-2">KES</span>
                            {stats.totalRevenue.toLocaleString()}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-6 uppercase font-black tracking-[0.2em]">Verified Earnings</p>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Fast Leads Action */}
                <Card className="lg:col-span-1 p-12 card-soft bg-white dark:bg-[#111] border-none shadow-none">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-black dark:text-white tracking-tight">Expand</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">New Integration</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => setIsNewLeadOpen(true)}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                            <Mail className="w-4 h-4" />
                            Create Lead
                        </button>

                        <Link href="/dashboard/commissioner/onboard" className="block">
                            <button
                                className="w-full py-5 bg-[var(--bg-input)] dark:bg-black rounded-full font-black text-[10px] text-gray-500 hover:text-black dark:hover:text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border border-[var(--border-color)]"
                            >
                                <UserPlus className="w-4 h-4" />
                                Onboard Client
                            </button>
                        </Link>

                        {/* Referral Link */}
                        <div className="pt-8 border-t border-[var(--border-color)] mt-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Referral Node Link</p>
                            <div className="flex items-center gap-3 bg-[var(--bg-app)] dark:bg-black p-4 rounded-3xl border border-[var(--border-color)]">
                                <code className="text-[10px] font-bold text-black dark:text-white truncate flex-1">
                                    {stats.referralCode || 'NODE-SYNCING...'}
                                </code>
                                <button
                                    onClick={() => {
                                        if (stats.referralCode) {
                                            navigator.clipboard.writeText(`${window.location.origin}/join?ref=${stats.referralCode}`);
                                            alert('Link Copied');
                                        }
                                    }}
                                    className="p-2 hover:bg-black hover:text-white rounded-xl transition-all"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Leads & Clients Panel */}
                <Card className="lg:col-span-2 p-0 rounded-[3rem] bg-white dark:bg-[#111] border-none shadow-none overflow-hidden">
                    <div className="p-10 border-b border-[var(--border-color)] flex justify-between items-center px-12">
                        <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-widest text-sm flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-black dark:bg-white rounded-full" />
                            Active Pipeline
                        </h3>
                        <Link href="/dashboard/commissioner/leads">
                            <button className="text-[10px] font-black text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-[0.2em] transition-all">
                                View Full
                            </button>
                        </Link>
                    </div>
                    <div className="divide-y divide-[var(--border-color)] px-6">
                        {stats.recentLeads.length === 0 ? (
                            <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                Pipeline currently empty.
                            </div>
                        ) : (
                            stats.recentLeads.map((lead, i) => (
                                <div key={i} className="p-8 flex items-center justify-between hover:bg-[var(--bg-app)] dark:hover:bg-black rounded-[2rem] transition-all group my-2">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-3xl bg-[var(--bg-app)] dark:bg-black flex items-center justify-center text-black dark:text-white font-black text-lg border border-[var(--border-color)] group-hover:bg-black group-hover:text-white transition-all">
                                            {lead.client_name ? lead.client_name[0] : '?'}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-black dark:text-white tracking-tight text-lg">{lead.client_name}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1">{lead.project_summary || 'No summary provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${lead.status === 'created' ? 'bg-black text-white' :
                                            'bg-[var(--bg-app)] dark:bg-black text-gray-500 border-[var(--border-color)]'}`}>
                                            {lead.status}
                                        </span>
                                        <Link href={`/dashboard/commissioner/leads`}>
                                            <button className="w-10 h-10 flex items-center justify-center rounded-2xl border border-[var(--border-color)] hover:bg-black hover:text-white transition-all">
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
            <Card className="p-12 border-none bg-white dark:bg-[#111] rounded-[3rem] shadow-none overflow-hidden relative group">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-widest mb-1">Velocity Index</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Referral conversion performance / 7D Window</p>
                    </div>
                    <button className="text-[10px] font-black text-gray-400 hover:text-black dark:hover:text-white transition-all uppercase tracking-[0.2em]">
                        Detailed Metrics
                    </button>
                </div>
                <div className="h-[300px]">
                    <LeadBarChart />
                </div>
            </Card>

            {/* New Lead Modal */}
            <NewLeadModal isOpen={isNewLeadOpen} onClose={() => setIsNewLeadOpen(false)} commissionerId={commissionerId} />

            {/* Project Modal */}
            <UniversalProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                role="commissioner"
            />

            {/* Invoice Modal */}
            <CreateInvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} />

            <SupportWidget />
        </div>
    );
}
