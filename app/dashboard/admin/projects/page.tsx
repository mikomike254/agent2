'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    Briefcase,
    CheckCircle,
    Clock,
    AlertCircle,
    Search,
    ExternalLink,
    Filter,
    Layers,
    User,
    ShieldAlert,
    Trash2,
    Zap,
    Users,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import AssignmentModal from '@/components/dashboard/AssignmentModal';

export default function AdminProjectsPage() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [assignmentProject, setAssignmentProject] = useState<any | null>(null);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await fetch('/api/projects');
            const result = await response.json();
            if (result.success) {
                setProjects(result.data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) {
            fetchProjects();
        }
    }, [session, fetchProjects]);

    const handleAction = async (projectId: string, action: string, value?: any) => {
        setIsUpdating(projectId);
        try {
            const response = await fetch(`/api/admin/projects/${projectId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, value })
            });
            const result = await response.json();
            if (result.success) {
                fetchProjects();
            } else {
                alert(result.error || 'Action failed');
            }
        } catch (error) {
            console.error('Project action error:', error);
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'in_review': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'lead': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Project <span className="text-blue-600">Overlord</span></h1>
                    </div>
                    <p className="text-gray-500 font-medium italic">Universal control over every work node in CREATIVE.KE.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Universal search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none w-full md:w-72 font-medium transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-12 pr-8 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-gray-700 appearance-none cursor-pointer transition-all shadow-sm"
                        >
                            <option value="all">ALL STATES</option>
                            <option value="lead">LEADS</option>
                            <option value="pending">PENDING</option>
                            <option value="active">ACTIVE</option>
                            <option value="in_review">REVIEW</option>
                            <option value="completed">COMPLETED</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="p-8 space-y-6 animate-pulse border-none shadow-xl">
                            <div className="h-6 bg-gray-100 rounded-xl w-1/4"></div>
                            <div className="h-8 bg-gray-100 rounded-xl w-3/4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-100 rounded-lg"></div>
                                <div className="h-4 bg-gray-100 rounded-lg w-5/6"></div>
                            </div>
                            <div className="pt-6 border-t border-gray-100">
                                <div className="h-12 bg-gray-100 rounded-2xl"></div>
                            </div>
                        </Card>
                    ))
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-white rounded-3xl border-4 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Layers className="w-10 h-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No matching work nodes found in sector.</p>
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <Card
                            key={project.id}
                            className={`p-8 hover:shadow-2xl transition-all duration-500 border-none group relative overflow-hidden bg-white shadow-xl ${isUpdating === project.id ? 'opacity-50 grayscale' : ''}`}
                        >
                            {/* God Mode Badge */}
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-2">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${getStatusStyle(project.status)}`}>
                                        {project.status}
                                    </span>
                                    <Zap className={`w-4 h-4 ${project.status === 'active' ? 'text-blue-500 fill-blue-500' : 'text-gray-300'}`} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Platform Value</p>
                                    <p className="text-lg font-black text-gray-950 tabular-nums italic">KES {Number(project.total_value).toLocaleString()}</p>
                                </div>
                            </div>

                            <Link href={`/dashboard/admin/projects/${project.id}`}>
                                <h3 className="text-2xl font-black text-gray-950 group-hover:text-blue-600 transition-colors mb-3 tracking-tighter leading-tight decoration-blue-500 decoration-4 hover:underline underline-offset-8">
                                    {project.title}
                                </h3>
                            </Link>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-8 font-medium leading-relaxed">
                                {project.description}
                            </p>

                            <div className="space-y-6 pt-6 border-t-2 border-gray-50">
                                {/* Progress Control */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 text-gray-900 font-black uppercase tracking-widest">
                                            <Layers className="w-4 h-4 text-blue-600" />
                                            <span>Temporal Progress</span>
                                        </div>
                                        <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{project.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/20"
                                            style={{ width: `${project.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Overlord Actions Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Force State</label>
                                        <select
                                            value={project.status}
                                            disabled={isUpdating === project.id}
                                            onChange={(e) => handleAction(project.id, 'set_status', e.target.value)}
                                            className="w-full p-2 bg-gray-50 border-none rounded-xl text-[10px] font-black uppercase tracking-tighter focus:ring-2 focus:ring-blue-600 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="lead">LEAD</option>
                                            <option value="pending">PENDING</option>
                                            <option value="active">ACTIVE</option>
                                            <option value="in_review">REVIEW</option>
                                            <option value="completed">COMPLETED</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Assignment</label>
                                        <button
                                            onClick={() => setAssignmentProject(project)}
                                            className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-gray-100 transition-colors"
                                        >
                                            <Users className="w-3 h-3 text-blue-600" />
                                            <span>{project.developer_id ? 'MANAGE' : 'ASSIGN'}</span>
                                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Major Overrides */}
                                <div className="flex gap-2">
                                    {project.status === 'active' && project.progress >= 100 && (
                                        <button
                                            onClick={() => handleAction(project.id, 'set_status', 'completed')}
                                            className="flex-1 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Direct Ship
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (confirm('DANGER: This will PERMANENTLY delete this project and all associated data. Proceed with absolute authority?')) {
                                                handleAction(project.id, 'force_delete');
                                            }
                                        }}
                                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                                        title="Purge Project"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {assignmentProject && (
                <AssignmentModal
                    isOpen={!!assignmentProject}
                    onClose={() => setAssignmentProject(null)}
                    projectId={assignmentProject.id}
                    currentDeveloperId={assignmentProject.developer_id}
                    currentCommissionerId={assignmentProject.commissioner_id}
                    onSuccess={() => {
                        fetchProjects();
                        setAssignmentProject(null);
                    }}
                />
            )}
        </div>
    );
}
