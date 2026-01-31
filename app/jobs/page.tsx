'use client';

import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, Clock, MapPin, User, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Job {
    id: string;
    title: string;
    description: string;
    budget: number;
    timeline: string;
    category: string;
    status: string;
    created_at: string;
    client: {
        name: string;
        company_name?: string;
    };
}

export default function JobBoardPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch('/api/jobs');
                const data = await res.json();
                if (data.success) {
                    setJobs(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleConvertToProject = async (jobId: string) => {
        if (!confirm('Convert this job to a project?')) return;

        try {
            const res = await fetch('/api/projects/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: jobId })
            });

            const result = await res.json();
            if (result.success) {
                alert('Project created successfully!');
                window.location.href = `/dashboard/projects/${result.data.id}`;
            } else {
                alert(result.message || 'Failed to create project');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Job Board</h1>
                    <p className="text-gray-600 mt-1">Browse available projects and opportunities</p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <Card className="p-12 text-center">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs available</h3>
                    <p className="text-gray-600">Check back later for new opportunities!</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {jobs.map((job) => (
                        <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                                    <p className="text-gray-600 mb-4">{job.description}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-semibold">KES {job.budget?.toLocaleString() || 'Not specified'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{job.timeline || 'Flexible'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="capitalize">{job.category || 'General'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>{job.client?.name || 'Client'}</span>
                                            {job.client?.company_name && (
                                                <span className="text-gray-400">• {job.client.company_name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {job.status === 'open' ? 'Open' : 'Closed'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <Link
                                    href={`/profile/${job.client}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Client Profile
                                </Link>
                                <button
                                    onClick={() => handleConvertToProject(job.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Create Project
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
