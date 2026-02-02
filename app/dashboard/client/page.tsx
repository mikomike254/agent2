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
                    activeProjects: fetchedProjects.filter((p: any) => p.status === 'active' || p.status === 'in_progress' || p.status === 'deposit_pending' || p.status === 'deposit_verified' || p.status === 'lead').length,
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
            {/* 1. Header with Global Action */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100 border-4 border-white shrink-0 relative group">
                        <UserAvatar user={session?.user as any} size="xl" />
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-none">
                            Welcome, {userName}.
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg font-medium flex items-center gap-2">
                            Client HQ <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> {stats.activeProjects + stats.pendingProposals} Operational Nodes
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Plus className="w-4 h-4" /> Start New Project
                    </button>
                    <NotificationMenu />
                </div>
            </header>

            {/* 2. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-50 hover:border-indigo-100 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Briefcase className="w-16 h-16 text-indigo-600" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Deployments</span>
                                <h3 className="text-5xl font-black text-gray-900 mt-2">{stats.activeProjects}</h3>
                                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full">
                                    <ArrowUpRight className="w-3 h-3" /> Live Production
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-orange-50 hover:border-orange-100 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Clock className="w-16 h-16 text-orange-600" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Review</span>
                                <h3 className="text-5xl font-black text-gray-900 mt-2">{stats.pendingProposals}</h3>
                                <p className="mt-4 text-[10px] text-orange-600 font-black uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full w-fit">
                                    Attention Required
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-100/20 hover:shadow-indigo-100/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <CreditCard className="w-16 h-16 text-indigo-600" />
                            </div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Investment</span>
                                <h3 className="text-4xl font-black text-gray-900 mt-2">
                                    KES {(stats.totalInvested / 1000).toFixed(1)}k
                                </h3>
                                <button
                                    onClick={() => setShowTopUp(true)}
                                    className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
                                >
                                    + Top Up Balance
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Projects List */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-100/30 overflow-hidden">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Operational Nodes</h2>
                                <p className="text-sm text-gray-500 font-medium">Real-time status of your active productions</p>
                            </div>
                            <Link href="/dashboard/client/projects" className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors flex items-center gap-2">
                                Central Portfolio <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="p-8">
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
                                        .filter(p => p.status === 'active' || p.status === 'in_progress' || p.status === 'deposit_pending' || p.status === 'deposit_verified' || p.status === 'lead')
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
                                                    className="flex items-center gap-8 p-8 bg-white border border-gray-50 rounded-[2.5rem] hover:bg-gray-50 hover:border-indigo-200 transition-all group"
                                                >
                                                    <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
                                                        <Briefcase className="w-8 h-8 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{proj.title}</h3>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">{proj.status.replace('_', ' ')}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-gray-900 font-black text-xl tracking-tighter">{Math.round(progress)}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5 mt-2">
                                                            <div
                                                                className="bg-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                                                style={{ width: `${proj.status === 'lead' ? 5 : progress}%` }}
                                                            ></div>
                                                        </div>
                                                        {proj.status === 'lead' && (
                                                            <div className="mt-4 flex gap-4">
                                                                <Link
                                                                    href="/find-commissioner"
                                                                    className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                                                                >
                                                                    <Search className="w-3 h-3" /> Find Talent
                                                                </Link>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest self-center">Broadcasted to Network</p>
                                                            </div>
                                                        )}
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
                    <MeetingCalendar />

                    {/* MARKET PULSE - TOP TALENT */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-xl shadow-indigo-50/50">
                        <MarketPulse />
                    </div>

                    {/* REAL ACTIVTY FEED */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-xl shadow-indigo-50/50">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-black text-gray-900 text-xl tracking-tight uppercase">Live Activity</h2>
                            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                <MoreHorizontal className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-8">
                            {recentNotifications.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-8 italic font-medium">Clear operational signals.</div>
                            ) : (
                                recentNotifications.map((n) => (
                                    <div key={n.id} className="flex gap-5 group">
                                        <div className={`mt-2 w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-lg ${!n.read_at ? 'bg-indigo-600 shadow-indigo-200 animate-pulse' : 'bg-gray-200'}`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-700 font-bold leading-tight group-hover:text-indigo-600 transition-colors">{n.title}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
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

