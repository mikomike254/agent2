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
    Settings,
    LayoutGrid,
    ArrowUpRight,
    MoreHorizontal,
    Bell,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { useRealtime } from '@/hooks/useRealtime';
import { TopUpModal } from '@/components/projects/TopUpModal';
import MeetingCalendar from '@/components/dashboard/MeetingCalendar';
import SupportWidget from '@/components/support/SupportWidget';
import UserAvatar from '@/components/UserAvatar';
import { UniversalProjectModal } from '@/components/projects/UniversalProjectModal';
import { NotificationMenu } from '@/components/dashboard/NotificationMenu';
import MarketPulse from '@/components/dashboard/MarketPulse';
import { formatDistanceToNow } from 'date-fns';

export default function ClientDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        activeProjects: 0,
        pendingProposals: 0,
        proposedProjects: [] as any[],
        totalInvested: 0,
        teamMembers: 0,
    });
    const [projects, setProjects] = useState<any[]>([]);
    const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [projectsRes, paymentsRes, notifRes] = await Promise.all([
                fetch('/api/projects', { cache: 'no-store' }),
                fetch('/api/payments', { cache: 'no-store' }),
                fetch('/api/notifications', { cache: 'no-store' })
            ]);

            const projectsData = await projectsRes.json();
            const paymentsData = await paymentsRes.json();
            const notifData = await notifRes.json();

            if (projectsData.success) {
                const fetchedProjects = projectsData.data || [];
                setProjects(fetchedProjects);
                setStats(prev => ({
                    ...prev,
                    activeProjects: fetchedProjects.filter((p: any) => p.status === 'active' || p.status === 'in_progress' || p.status === 'deposit_pending' || p.status === 'deposit_verified').length,
                    pendingProposals: fetchedProjects.filter((p: any) => p.status === 'proposed').length,
                    proposedProjects: fetchedProjects.filter((p: any) => p.status === 'proposed'),
                    teamMembers: fetchedProjects.reduce((acc: number, p: any) =>
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

            if (notifData.success) {
                setRecentNotifications(notifData.notifications?.slice(0, 5) || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    const refreshClientData = useCallback(() => {
        if (!session) return;
        fetchDashboardData();
    }, [session]);

    useRealtime({ table: 'projects', event: '*', enabled: !!session }, refreshClientData);
    useRealtime({ table: 'payments', event: '*', enabled: !!session }, refreshClientData);
    useRealtime({ table: 'notifications', event: '*', enabled: !!session }, refreshClientData);

    const userName = (session?.user as any)?.name?.split(' ')[0] || 'there';

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 fade-in">
            {/* 1. Glass Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border-4 border-white/10 shrink-0 relative group">
                        <div className="absolute inset-0 bg-indigo-500/20 group-hover:bg-transparent transition-colors z-10"></div>
                        <UserAvatar user={session?.user as any} size="xl" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                            Welcome, {userName}.
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg font-medium flex items-center gap-2">
                            Dashboard Hub <span className="w-1 h-1 bg-gray-600 rounded-full"></span> {stats.pendingProposals} Actions Pending
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all w-full md:w-64"
                        />
                    </div>
                    <NotificationMenu />
                </div>
            </header>

            {/* 2. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#0F0F12] p-6 rounded-[2rem] border border-white/5 shadow-xl shadow-black/20 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Briefcase className="w-12 h-12 text-white" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Projects</span>
                                <h3 className="text-4xl font-black text-white mt-2">{stats.activeProjects}</h3>
                                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 w-fit px-2 py-1 rounded-lg">
                                    <ArrowUpRight className="w-3 h-3" /> Production Active
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0F0F12] p-6 rounded-[2rem] border border-white/5 shadow-xl shadow-black/20 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Clock className="w-12 h-12 text-orange-500" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pending Review</span>
                                <h3 className="text-4xl font-black text-white mt-2">{stats.pendingProposals}</h3>
                                <p className="mt-4 text-[10px] text-gray-400 font-medium">
                                    Requires your attention
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 rounded-[2rem] border border-white/10 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CreditCard className="w-12 h-12 text-white" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Total Investment</span>
                                <h3 className="text-3xl font-black text-white mt-2">
                                    KES {(stats.totalInvested / 1000).toFixed(1)}k
                                </h3>
                                <button
                                    onClick={() => setShowTopUp(true)}
                                    className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white uppercase tracking-widest border border-white/10 transition-colors"
                                >
                                    + Top Up Balance
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Projects List */}
                    <div className="bg-[#0F0F12]/50 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Active Deployments</h2>
                                <p className="text-sm text-gray-500">Live project status tracking</p>
                            </div>
                            <Link href="/dashboard/client/projects" className="text-xs font-bold text-indigo-400 hover:text-white uppercase tracking-widest transition-colors">
                                View Portfolio <ChevronRight className="w-3 h-3 inline ml-1" />
                            </Link>
                        </div>
                        <div className="p-4">
                            {stats.activeProjects === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <LayoutGrid className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <p className="text-gray-400 font-medium">No active projects commanded.</p>
                                    <button
                                        onClick={() => setIsProjectModalOpen(true)}
                                        className="text-sm text-indigo-400 font-bold mt-4 hover:text-white transition-colors uppercase tracking-widest"
                                    >
                                        Initiate New Project
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {projects
                                        .filter(p => p.status === 'active' || p.status === 'in_progress' || p.status === 'deposit_pending' || p.status === 'deposit_verified')
                                        .slice(0, 3)
                                        .map((proj) => {
                                            // Calculate progress based on milestones
                                            const totalMilestones = proj.milestones?.length || 0;
                                            const completedMilestones = proj.milestones?.filter((m: any) => m.status === 'completed').length || 0;
                                            const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

                                            return (
                                                <Link
                                                    key={proj.id}
                                                    href={`/dashboard/client/projects/${proj.id}`}
                                                    className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group"
                                                >
                                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                                                        <Briefcase className="w-6 h-6 text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-white font-bold truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{proj.title}</h3>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Status: {proj.status.replace('_', ' ')}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-white font-black text-sm">{Math.round(progress)}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}

                                    {stats.activeProjects > 3 && (
                                        <Link href="/dashboard/client/projects" className="block text-center py-2 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                                            + {stats.activeProjects - 3} More Deployments
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Proposals */}
                    {(stats as any).proposedProjects?.length > 0 && (
                        <div className="bg-[#0F0F12]/50 backdrop-blur-md rounded-[2.5rem] border border-indigo-500/20 shadow-2xl shadow-indigo-900/10 overflow-hidden">
                            <div className="p-8 border-b border-white/5 bg-indigo-500/5 flex justify-between items-center">
                                <h2 className="text-xl font-black text-white flex items-center gap-3">
                                    <Plus className="w-6 h-6 text-indigo-400" />
                                    Incoming Proposals
                                </h2>
                                <span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Action Required</span>
                            </div>
                            <div className="p-6 space-y-4">
                                {(stats as any).proposedProjects?.map((proj: any) => (
                                    <div key={proj.id} className="p-6 border border-white/10 bg-white/[0.02] rounded-[2rem] hover:bg-white/[0.04] hover:border-indigo-500/50 transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-bold text-white text-xl group-hover:text-indigo-400 transition-colors">{proj.title}</h3>
                                                <p className="text-sm text-gray-500 font-medium mt-1">Service: {proj.proposed_service || 'Development'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-white leading-none">KES {(proj.total_value || 0).toLocaleString()}</span>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Est. Budget</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-8 line-clamp-2 leading-relaxed">{proj.description}</p>
                                        <div className="flex gap-4">
                                            <Link
                                                href={`/dashboard/client/projects/${proj.id}`}
                                                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl text-center font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                Review Terms & Accept
                                            </Link>
                                            <button className="px-8 py-4 bg-white/5 border border-white/10 text-gray-400 rounded-xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-8">
                    <div className="bg-[#0F0F12] rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <MeetingCalendar />
                    </div>

                    {/* MARKET PULSE - TOP TALENT */}
                    <div className="bg-[#0F0F12] rounded-[2.5rem] border border-white/5 p-8 shadow-xl">
                        <MarketPulse />
                    </div>

                    {/* REAL ACTIVTY FEED */}
                    <div className="bg-[#0F0F12] rounded-[2.5rem] border border-white/5 p-8 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-white text-lg">Live Activity</h2>
                            <button className="text-gray-500 hover:text-white transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            {recentNotifications.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm py-4">No recent activity.</div>
                            ) : (
                                recentNotifications.map((n) => (
                                    <div key={n.id} className="flex gap-4 group">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)] ${!n.read_at ? 'bg-indigo-500 shadow-indigo-500/50' : 'bg-gray-600'}`}></div>
                                        <div>
                                            <p className="text-sm text-gray-200 font-medium leading-snug group-hover:text-indigo-300 transition-colors">{n.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <TopUpModal open={showTopUp} onOpenChange={setShowTopUp} />
            <UniversalProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                role="client"
            />
            <SupportWidget />
        </div>
    );
}

