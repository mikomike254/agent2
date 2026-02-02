'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    Briefcase,
    Clock,
    CreditCard,
    Plus,
    Search,
    ChevronRight,
    Bell,
    Settings,
    LayoutGrid,
    ArrowUpRight,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { useRealtime } from '@/hooks/useRealtime';
import { TopUpModal } from '@/components/projects/TopUpModal';
import MeetingCalendar from '@/components/dashboard/MeetingCalendar';
import SupportWidget from '@/components/support/SupportWidget';

// Mock Data for "Recommended Talent" (until API is fully linked)
const RECOMMENDED_TALENT = [
    { id: '1', name: 'Sarah K.', role: 'UI/UX Designer', rating: 4.9, rate: '2500/hr', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100' },
    { id: '2', name: 'James O.', role: 'React Developer', rating: 5.0, rate: '3000/hr', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' },
    { id: '3', name: 'Anita M.', role: 'Mobile Dev', rating: 4.8, rate: '2800/hr', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100' },
];

export default function ClientDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        activeProjects: 0,
        pendingProposals: 0,
        proposedProjects: [] as any[],
        totalInvested: 0,
        teamMembers: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [projectsRes, paymentsRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/payments'),
                ]);

                const projectsData = await projectsRes.json();
                const paymentsData = await paymentsRes.json();

                if (projectsData.success) {
                    const projects = projectsData.data || [];
                    setStats(prev => ({
                        ...prev,
                        activeProjects: projects.filter((p: any) => p.status === 'active' || p.status === 'in_progress' || p.status === 'deposit_pending').length,
                        pendingProposals: projects.filter((p: any) => p.status === 'proposed').length,
                        proposedProjects: projects.filter((p: any) => p.status === 'proposed'),
                        teamMembers: projects.reduce((acc: number, p: any) =>
                            acc + (p.team_members?.length || 0), 0
                        ),
                    }));
                }

                if (paymentsData.success) {
                    const payments = paymentsData.data || [];
                    const total = payments
                        .filter((p: any) => p.status === 'verified' || p.status === 'released')
                        .reduce((acc: number, p: any) => acc + Number(p.amount), 0);
                    setStats(prev => ({ ...prev, totalInvested: total }));
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    const refreshClientData = useCallback(() => {
        if (!session) return;
        // Re-fetch logic (simplified for brevity, mirroring useEffect)
        const fetchDashboardData = async () => {
            try {
                const [projectsRes, paymentsRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/payments'),
                ]);
                const projectsData = await projectsRes.json();
                const paymentsData = await paymentsRes.json();
                if (projectsData.success) {
                    const projects = projectsData.data || [];
                    setStats(prev => ({
                        ...prev,
                        activeProjects: projects.filter((p: any) => p.status === 'active' || p.status === 'in_progress' || p.status === 'deposit_pending').length,
                        pendingProposals: projects.filter((p: any) => p.status === 'proposed').length,
                        proposedProjects: projects.filter((p: any) => p.status === 'proposed'),
                        teamMembers: projects.reduce((acc: number, p: any) =>
                            acc + (p.team_members?.length || 0), 0
                        ),
                    }));
                }
                if (paymentsData.success) {
                    const payments = paymentsData.data || [];
                    const total = payments
                        .filter((p: any) => p.status === 'verified' || p.status === 'released')
                        .reduce((acc: number, p: any) => acc + Number(p.amount), 0);
                    setStats(prev => ({ ...prev, totalInvested: total }));
                }
            } catch (error) { console.error(error) }
        };
        fetchDashboardData();
    }, [session]);

    useRealtime({ table: 'projects', event: '*', enabled: !!session }, refreshClientData);
    useRealtime({ table: 'payments', event: '*', enabled: !!session }, refreshClientData);

    const userName = (session?.user as any)?.name?.split(' ')[0] || 'there';

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* 1. Shopeers Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight leading-none">
                        Welcome back, {userName}! 👋
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 text-lg">You have {stats.pendingProposals} project proposals waiting for your review.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-white border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-input)] transition-colors text-[var(--text-secondary)]">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-input)] transition-colors text-[var(--text-secondary)] relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>
            </header>

            {/* 2. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-soft transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> 12%
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[var(--text-secondary)] text-sm font-medium">Active Projects</span>
                                <h3 className="text-3xl font-bold text-[var(--text-primary)]">{stats.activeProjects}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-soft transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                                    Pending
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[var(--text-secondary)] text-sm font-medium">Proposals</span>
                                <h3 className="text-3xl font-bold text-[var(--text-primary)]">{stats.pendingProposals}</h3>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-soft transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={() => setShowTopUp(true)}
                                    className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                                >
                                    + Top Up
                                </button>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[var(--text-secondary)] text-sm font-medium">Total Invested</span>
                                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                                    KES {(stats.totalInvested / 1000).toFixed(1)}k
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Active Projects List (Widget) */}
                    <div className="bg-white rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Your Projects</h2>
                            <Link href="/dashboard/client/projects" className="text-sm font-semibold text-[var(--primary)] hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="p-2">
                            {stats.activeProjects === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LayoutGrid className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-[var(--text-secondary)] font-medium">No active projects yet.</p>
                                    <Link href="/dashboard/client/new-project" className="text-sm text-[var(--primary)] font-bold mt-2 block">
                                        Start one today
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {[1, 2].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-app)] rounded-2xl transition-colors cursor-pointer group">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg group-hover:scale-110 transition-transform">
                                                E
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-[var(--text-primary)]">E-Commerce Platform</h3>
                                                <p className="text-xs text-[var(--text-secondary)]">Milestone 2: Frontend Implementation</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-[var(--text-primary)] mb-1">65%</div>
                                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)]" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* New Section: Project Proposals */}
                    <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-50/50 overflow-hidden">
                        <div className="p-6 border-b border-indigo-50 bg-indigo-50/30 flex justify-between items-center">
                            <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Project Proposals
                            </h2>
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">Action Needed</span>
                        </div>
                        <div className="p-4">
                            {/* Filter projects with status 'proposed' */}
                            {loading ? (
                                <div className="p-8 text-center text-gray-400">Loading proposals...</div>
                            ) : (
                                <div className="space-y-4">
                                    {(stats as any).proposedProjects?.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 italic">No new proposals.</div>
                                    ) : (
                                        (stats as any).proposedProjects?.map((proj: any) => (
                                            <div key={proj.id} className="p-5 border-2 border-dashed border-indigo-100 rounded-[2rem] hover:border-indigo-300 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-black text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{proj.title}</h3>
                                                        <p className="text-sm text-gray-400 font-medium">Proposed Service: {proj.proposed_service || 'Development'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-black text-gray-900 leading-none">KES {(proj.total_value || 0).toLocaleString()}</span>
                                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Estim. Budget</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{proj.description}</p>
                                                <div className="flex gap-3">
                                                    <Link
                                                        href={`/dashboard/client/projects/${proj.id}`}
                                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-center font-bold text-sm hover:bg-black transition-all shadow-lg shadow-indigo-200"
                                                    >
                                                        Review & Accept
                                                    </Link>
                                                    <button className="px-5 py-3 border border-gray-100 text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-8">
                    {/* Discovery Teaser Widget */}

                    {/* Meeting Scheduler Widget */}
                    <MeetingCalendar />

                    {/* Quick Activity */}
                    <div className="bg-white rounded-3xl border border-[var(--border-color)] p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-[var(--text-primary)]">Activity</h2>
                            <button className="text-[var(--text-secondary)] hover:text-[var(--primary)]">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-[var(--text-primary)] font-medium">Project "Mobile App" approved</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Today, 9:41 AM</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 bg-gray-300 rounded-full flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-[var(--text-primary)] font-medium">New invoice #1023 created</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Yesterday, 4:20 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TopUpModal open={showTopUp} onOpenChange={setShowTopUp} />
            <SupportWidget />
        </div>
    );
}

