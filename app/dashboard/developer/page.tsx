// Developer Dashboard
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { Briefcase, Upload, Clock, CheckCircle, AlertTriangle, Wallet, Activity, ArrowUpRight } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SupportWidget from '@/components/support/SupportWidget';
import { UniversalProjectModal } from '@/components/projects/UniversalProjectModal';
import { NotificationMenu } from '@/components/dashboard/NotificationMenu';

export default function DeveloperDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/developer/dashboard', { cache: 'no-store' });
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Error fetching developer dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchData();
        }
    }, [session]);

    // Real-time updates for developer dashboard
    const refreshDeveloperData = useCallback(() => {
        if (!session?.user) return;

        fetch('/api/developer/dashboard', { cache: 'no-store' })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    setData(result.data);
                }
            })
            .catch(error => console.error('Error refreshing developer data:', error));
    }, [session?.user]);

    // Subscribe to real-time changes
    useRealtime(
        { table: 'projects', event: '*', enabled: !!session?.user },
        refreshDeveloperData
    );

    useRealtime(
        { table: 'project_milestones', event: '*', enabled: !!session?.user },
        refreshDeveloperData
    );

    useRealtime(
        { table: 'payouts', event: '*', enabled: !!session?.user },
        refreshDeveloperData
    );

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-black/5 border-t-black dark:border-white/5 dark:border-t-white rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Syncing Workspace</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100">
                <p className="text-red-600 font-bold">Failed to initialize workspace data stream.</p>
            </div>
        );
    }

    const { profile, projects } = data;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-10 pb-12"
            >
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-black text-black dark:text-white tracking-tighter leading-none">
                            Workspace<span className="text-gray-400">.</span>KE
                        </h1>
                        <p className="text-gray-500 font-medium mt-4 max-w-lg">
                            Active session for <span className="text-black dark:text-white font-black underline decoration-2 decoration-[var(--accent)] underline-offset-4">{session?.user?.name}</span>.
                            Currently coordinating {projects.length} development nodes.
                        </p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <NotificationMenu />
                        <button className="px-6 py-3 bg-white dark:bg-black border border-[var(--border-color)] rounded-full text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition-all">
                            Availability: active
                        </button>
                        <button
                            onClick={() => setIsProjectModalOpen(true)}
                            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                        >
                            Propose Project
                        </button>
                    </div>
                </div>

                {/* Metrics Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Reliability Index', value: `${profile?.reliability_score || 100}%`, icon: Activity, color: 'black' },
                        { label: 'Active Pipeline', value: projects.length, icon: Briefcase, color: 'black' },
                        { label: 'Escrow Reserve', value: `KES ${Number(profile?.pending_balance || 0).toLocaleString()}`, icon: Clock, color: 'black' },
                        { label: 'Liquid Assets', value: `KES ${Number(profile?.available_balance || 0).toLocaleString()}`, icon: Wallet, color: 'black' },
                    ].map((metric, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="card-soft p-10 bg-white dark:bg-[#111] border-none shadow-none group"
                        >
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-app)] dark:bg-black flex items-center justify-center text-black dark:text-white">
                                    <metric.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{metric.label}</p>
                                    <p className="text-3xl font-black text-black dark:text-white tracking-tighter">
                                        {metric.value}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Projects Container */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-black dark:bg-white rounded-full" />
                            <h2 className="text-2xl font-black text-black dark:text-white tracking-tight uppercase tracking-widest text-sm">Deployment Pipeline</h2>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {projects.length === 0 ? (
                            <div className="p-20 text-center bg-white dark:bg-black rounded-[3rem] border border-[var(--border-color)]">
                                <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-8">No active nodes detected in pipeline</p>
                                <Link
                                    href="/dashboard/developer/job-board"
                                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 w-fit mx-auto group"
                                >
                                    Access Job Board
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Link>
                            </div>
                        ) : (
                            projects.map((project: any) => (
                                <motion.div
                                    key={project.id}
                                    whileHover={{ scale: 1.005 }}
                                    className="card-soft bg-white dark:bg-[#111] border-none shadow-none group overflow-hidden"
                                >
                                    <div className="p-10 md:p-14">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                                            <div className="flex-1 space-y-10">
                                                <div className="flex flex-wrap items-center gap-6">
                                                    <h3 className="text-3xl font-black text-black dark:text-white tracking-tighter">
                                                        {project.title}
                                                    </h3>
                                                    <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--bg-app)] dark:bg-black text-gray-500 border border-[var(--border-color)]">
                                                        {project.role} / Node
                                                    </span>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-10">
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Synchronization</p>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-3xl bg-[var(--bg-app)] dark:bg-black flex items-center justify-center">
                                                                <Activity className="w-5 h-5 text-black dark:text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-black dark:text-white">{project.active_milestone?.title || 'Stable'}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Active Phase</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Offset</p>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-3xl bg-[var(--bg-app)] dark:bg-black flex items-center justify-center">
                                                                <Clock className="w-5 h-5 text-amber-500" />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-black ${project.days_remaining < 3 ? 'text-red-600' : 'text-black dark:text-white'}`}>
                                                                    {project.days_remaining || '∞'} Days
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Until Deadline</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-4 pt-4">
                                                    <Link
                                                        href={`/dashboard/developer/projects/${project.id}`}
                                                        className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                                                    >
                                                        Access Node <ArrowUpRight className="w-4 h-4" />
                                                    </Link>
                                                    <button className="px-8 py-5 bg-[var(--bg-input)] rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all">
                                                        Telemetry
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="lg:w-64">
                                                <div className="p-8 bg-[var(--bg-app)] dark:bg-black rounded-[3rem] border border-[var(--border-color)]">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Saturation</p>
                                                    <div className="relative w-32 h-32 mx-auto">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-800" />
                                                            <motion.circle
                                                                cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="12"
                                                                className="text-black dark:text-white"
                                                                strokeDasharray={`${2 * Math.PI * 58}`}
                                                                initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
                                                                animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - (project.active_milestone?.percent_amount || 0) / 100) }}
                                                                strokeLinecap="round"
                                                                transition={{ duration: 2, ease: "easeOut" }}
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-2xl font-black text-black dark:text-white">{project.active_milestone?.percent_amount || 0}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )
                        }
                    </div>
                </motion.div>
            </motion.div>
            <UniversalProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                role="developer"
            />
            <SupportWidget />
        </>
    );
}
