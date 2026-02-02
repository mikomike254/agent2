'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Users, DollarSign, Calendar, CheckCircle, Clock, MessageSquare, Loader2, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRealtime } from '@/hooks/useRealtime';
import { useCallback } from 'react';
import Link from 'next/link';
import ProjectFileManager from '@/components/projects/ProjectFileManager';
import ProjectChat from '@/components/dashboard/ProjectChat';
import MilestoneProgress from '@/components/client/MilestoneProgress';
import DisputeWidget from '@/components/disputes/DisputeWidget';
import ProjectVersionManager from '@/components/projects/ProjectVersionManager';
import WorkStream from '@/components/projects/WorkStream';
import AIAuditPanel from '@/components/projects/AIAuditPanel';

interface Project {
    id: string;
    title: string;
    description: string;
    status: string;
    budget: string;
    created_at: string;
    team_members?: Array<{
        user: {
            name: string;
            avatar_url?: string;
        };
    }>;
    milestones?: Array<{
        id: string;
        title: string;
        status: string;
        deliverable_link?: string;
    }>;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [milestones, setMilestones] = useState<any[]>([]);

    useEffect(() => {
        fetchProject();
        fetchMilestones();
    }, [params.id]);

    // Real-time integration
    const refreshData = useCallback(() => {
        if (!params.id) return;
        fetchProject();
        fetchMilestones();
    }, [params.id]);

    useRealtime(
        { table: 'projects', event: '*', filter: `id=eq.${params.id}`, enabled: !!params.id },
        refreshData
    );

    useRealtime(
        { table: 'project_milestones', event: '*', filter: `project_id=eq.${params.id}`, enabled: !!params.id },
        refreshData
    );

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/projects/${params.id}`);
            const result = await response.json();
            if (result.success) {
                setProject(result.data);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMilestones = async () => {
        try {
            const response = await fetch(`/api/projects/${params.id}/milestones`);
            if (response.ok) {
                const data = await response.json();
                setMilestones(data);
            }
        } catch (error) {
            console.error('Error fetching milestones:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--text-secondary)]">Project not found</p>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        active: 'bg-green-500/10 text-green-600 border-green-500/20',
        completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        deposit_pending: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        proposed: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-[var(--bg-input)] rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{project.title}</h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${statusColors[project.status] || statusColors.pending}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </div>
                    <DisputeWidget projectId={project.id} projectTitle={project.title} />
                </div>
            </div>

            {/* Proposal Acceptance Card (Only for Proposed status) */}
            {project.status === 'proposed' && (
                <Card className="p-8 border-2 border-indigo-600 bg-indigo-50/50 shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-indigo-900 tracking-tight">Review Project Proposal</h2>
                                <p className="text-indigo-700 font-medium">This project was proposed by your commissioner. Review the details below to proceed.</p>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={async () => {
                                        if (confirm('Accept this project and proceed to checkout?')) {
                                            const res = await fetch('/api/onboarding/accept', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ projectId: project.id })
                                            });
                                            if (res.ok) {
                                                alert('Project accepted! Proceeding to deposit.');
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                    className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl shadow-indigo-200"
                                >
                                    Accept & Start
                                </button>
                                <button className="flex-1 md:flex-none px-10 py-4 bg-white border-2 border-indigo-100 text-indigo-400 rounded-2xl font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Description */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Project Description</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </Card>

                    {/* Milestones */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            Project Milestones & Progress
                        </h2>
                        {milestones && milestones.length > 0 ? (
                            <div className="space-y-6">
                                {milestones.map((milestone) => (
                                    <MilestoneProgress
                                        key={milestone.id}
                                        milestone={milestone}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-[var(--text-secondary)] text-sm">No milestones yet</p>
                        )}
                    </Card>

                    <WorkStream projectId={project.id} />

                    {/* Project Versions */}
                    <ProjectVersionManager projectId={params.id as string} role="client" />

                    {/* Project Chat */}
                    <ProjectChat projectId={params.id as string} currentUserId={(session?.user as any)?.id} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <AIAuditPanel projectId={project.id} />

                    {/* Team */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team
                        </h3>
                        {project.team_members && project.team_members.length > 0 ? (
                            <div className="space-y-3">
                                {project.team_members.map((member, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                            {member.user.avatar_url ? (
                                                <img
                                                    src={member.user.avatar_url}
                                                    alt={member.user.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-[var(--primary)]">
                                                    {member.user.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-[var(--text-primary)]">
                                            {member.user.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">No team members assigned</p>
                        )}
                    </Card>

                    {/* Budget */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Budget
                        </h3>
                        <p className="text-2xl font-bold text-[var(--primary)]">{project.budget} KES</p>
                    </Card>

                    {/* Timeline */}
                    <Card className="p-6">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline
                        </h3>
                        <div className="space-y-4 text-sm">
                            <p className="text-[var(--text-secondary)]">
                                <strong>Started:</strong> {new Date(project.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </Card>

                    {/* Billing & Receipts */}
                    <Card className="p-6 border-2 border-green-500/10 bg-green-50/20">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            Billing & Receipts
                        </h3>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Invoices</p>
                            <Link
                                href={`/invoices/mock-id/print`}
                                target="_blank"
                                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-500 transition-all group"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                                    <span className="text-xs font-bold text-gray-700">Project Deposit</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-300" />
                            </Link>
                            <p className="text-[10px] text-gray-400 italic mt-2">Professional receipts generated for every secure payout.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
