'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle2, Search, ArrowRight, Loader2, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';

export default function DeveloperJobBoard() {
    const { data: session } = useSession();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects?type=open');
            const data = await res.json();
            if (data.success) {
                setJobs(data.data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchJobs();
        }
    }, [session]);

    const handleClaim = async (projectId: string) => {
        if (!confirm('Are you sure you want to claim this project? You will be responsible for its delivery.')) return;

        setClaimingId(projectId);
        try {
            const res = await fetch('/api/projects/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId })
            });
            const data = await res.json();
            if (data.success) {
                alert('Project claimed successfully!');
                fetchJobs(); // Refresh list
            } else {
                alert(data.error || 'Failed to claim project');
            }
        } catch (error) {
            console.error('Claim error:', error);
            alert('An error occurred');
        } finally {
            setClaimingId(null);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Scanning Network For Open Nodes</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Open Job Board</h2>
                    <p className="text-gray-500 mt-2 text-lg">Browse and claim projects posted by verified commissioners.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            {filteredJobs.length === 0 ? (
                <Card className="p-20 text-center border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-[40px]">
                    <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No open nodes detected at this time</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {filteredJobs.map((job) => (
                        <Card key={job.id} className="p-8 border-none shadow-xl shadow-indigo-100/20 bg-white hover:shadow-2xl hover:shadow-indigo-200/30 transition-all group rounded-[2.5rem]">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {job.category || 'General'}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Posted {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed max-w-2xl">
                                        {job.description}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-6 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                                <DollarSign className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Budget</p>
                                                <p className="text-sm font-bold text-gray-900">KES {parseInt(job.total_value).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Commissioner</p>
                                                <p className="text-sm font-bold text-gray-900">{job.commissioner?.user?.name || 'Partner'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-gray-50 pt-8 lg:pt-0 lg:pl-8">
                                    <button
                                        onClick={() => handleClaim(job.id)}
                                        disabled={claimingId === job.id}
                                        className="flex-1 lg:flex-none px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {claimingId === job.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                Claim Project
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
