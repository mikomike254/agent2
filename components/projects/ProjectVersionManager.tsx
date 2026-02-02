'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    History,
    Plus,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    MessageSquare
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ProjectVersionManagerProps {
    projectId: string;
    role: 'developer' | 'client';
}

export default function ProjectVersionManager({ projectId, role }: ProjectVersionManagerProps) {
    const { data: session } = useSession();
    const [versions, setVersions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    // Form state
    const [versionLabel, setVersionLabel] = useState('');
    const [reviewUrl, setReviewUrl] = useState('');
    const [description, setDescription] = useState('');

    // Review state
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchVersions();
    }, [projectId]);

    const fetchVersions = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/versions`);
            const data = await res.json();
            if (data.success) {
                setVersions(data.data);
            }
        } catch (error) {
            console.error('Error fetching versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitVersion = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    version_label: versionLabel,
                    review_url: reviewUrl,
                    description
                })
            });
            const data = await res.json();
            if (data.success) {
                setVersions([data.data, ...versions]);
                setShowSubmitForm(false);
                setVersionLabel('');
                setReviewUrl('');
                setDescription('');
            }
        } catch (error) {
            console.error('Error submitting version:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReviewVersion = async (versionId: string, status: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/versions/${versionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    client_feedback: feedback
                })
            });
            const data = await res.json();
            if (data.success) {
                setVersions(versions.map(v => v.id === versionId ? data.data : v));
                setReviewingId(null);
                setFeedback('');
            }
        } catch (error) {
            console.error('Error reviewing version:', error);
        }
    };

    return (
        <Card className="p-8 border-none bg-white dark:bg-[#111] card-soft">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-black dark:text-white tracking-tight">Project Versions</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Revision History & Reviews</p>
                    </div>
                </div>
                {role === 'developer' && !showSubmitForm && (
                    <Button
                        onClick={() => setShowSubmitForm(true)}
                        className="rounded-full bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] px-6"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Submit New
                    </Button>
                )}
            </div>

            {showSubmitForm && (
                <div className="mb-10 p-8 border border-[var(--border-color)] rounded-[2rem] bg-[var(--bg-app)] dark:bg-black/40">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                        Submit for Review
                    </h3>
                    <form onSubmit={handleSubmitVersion} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Version Label</label>
                                <Input
                                    placeholder="e.g. v1.0.1 - Homepage UI"
                                    className="rounded-2xl border-[var(--border-color)] bg-white dark:bg-black"
                                    value={versionLabel}
                                    onChange={(e) => setVersionLabel(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Review URL (Optional)</label>
                                <Input
                                    placeholder="https://preview.techdev.ke/..."
                                    className="rounded-2xl border-[var(--border-color)] bg-white dark:bg-black"
                                    value={reviewUrl}
                                    onChange={(e) => setReviewUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Revision Notes</label>
                            <Textarea
                                placeholder="What's new in this version? List key updates..."
                                className="min-h-[120px] rounded-[2rem] border-[var(--border-color)] bg-white dark:bg-black"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 rounded-full bg-black dark:bg-white text-white dark:text-black font-black"
                            >
                                {isSubmitting ? 'Submitting...' : 'Send to Client'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowSubmitForm(false)}
                                className="rounded-full border-[var(--border-color)]"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">Syncing history...</div>
                ) : versions.length === 0 ? (
                    <div className="p-10 text-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        No versions submitted yet.
                    </div>
                ) : (
                    versions.map((version) => (
                        <div
                            key={version.id}
                            className="group p-8 border border-[var(--border-color)] rounded-[2.5rem] hover:bg-[var(--bg-app)] dark:hover:bg-black transition-all"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-6">
                                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 border border-[var(--border-color)]
                                        ${version.status === 'approved' ? 'bg-green-50 dark:bg-green-900/10 text-green-600' :
                                            version.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/10 text-red-600' :
                                                version.status === 'changes_requested' ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600' :
                                                    'bg-gray-50 dark:bg-gray-900/10 text-gray-400'}`}>
                                        {version.status === 'approved' ? <CheckCircle2 className="w-7 h-7" /> :
                                            version.status === 'rejected' ? <XCircle className="w-7 h-7" /> :
                                                version.status === 'changes_requested' ? <AlertCircle className="w-7 h-7" /> :
                                                    <Clock className="w-7 h-7" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-black text-lg text-black dark:text-white">{version.version_label}</h4>
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                ${version.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    version.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        version.status === 'changes_requested' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                {version.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{version.description}</p>
                                        <p className="text-[10px] text-gray-300 font-bold mt-2 uppercase tracking-widest">
                                            {new Date(version.created_at).toLocaleDateString()} at {new Date(version.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {version.review_url && (
                                        <a href={version.review_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="rounded-2xl border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest">
                                                Preview <ExternalLink className="w-3 h-3 ml-2" />
                                            </Button>
                                        </a>
                                    )}
                                    {role === 'client' && version.status === 'pending' && reviewingId !== version.id && (
                                        <Button
                                            onClick={() => setReviewingId(version.id)}
                                            className="rounded-2xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Review
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {reviewingId === version.id && (
                                <div className="mt-8 pt-8 border-t border-[var(--border-color)] animate-in fade-in slide-in-from-top-4">
                                    <h5 className="font-bold text-sm mb-4">Accept or Request Changes</h5>
                                    <Textarea
                                        placeholder="Add your feedback here..."
                                        className="mb-4 rounded-2xl"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleReviewVersion(version.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                                        >
                                            Approve Version
                                        </Button>
                                        <Button
                                            onClick={() => handleReviewVersion(version.id, 'changes_requested')}
                                            variant="outline"
                                            className="border-amber-600 text-amber-600 hover:bg-amber-50 rounded-xl"
                                        >
                                            Request Changes
                                        </Button>
                                        <Button
                                            onClick={() => setReviewingId(null)}
                                            variant="ghost"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {version.client_feedback && (
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-[var(--border-color)]">
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Client Feedback</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{version.client_feedback}"</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
