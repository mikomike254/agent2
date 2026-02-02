'use client';

import React, { useState, useEffect } from 'react';
import { History, Zap, Clock, User, FileText, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WorkStreamProps {
    projectId: string;
}

export default function WorkStream({ projectId }: WorkStreamProps) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const res = await fetch(`/api/work-sessions?projectId=${projectId}`);
            const data = await res.json();
            if (data.success) {
                setSessions(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching work stream:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 30000); // Pulse every 30s
        return () => clearInterval(interval);
    }, [projectId]);

    const formatDuration = (start: string, end: string | null) => {
        if (!end) return 'Active';
        const duration = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000);
        const hrs = Math.floor(duration / 3600);
        const mins = Math.floor((duration % 3600) / 60);
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    return (
        <Card className="p-8 border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-500" />
                        Live Industrial Stream
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time developer activity audit</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Live Sync</span>
                </div>
            </div>

            <div className="space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-1/4" />
                                <div className="h-3 bg-gray-100 rounded w-full" />
                            </div>
                        </div>
                    ))
                ) : sessions.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 italic text-sm">
                        No work signals detected for this project period.
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} className="group relative pl-8 border-l-2 border-gray-100 last:border-transparent pb-8 last:pb-0">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all ${session.status === 'active' ? 'bg-indigo-500 ring-4 ring-indigo-50 animate-pulse' : 'bg-gray-300'
                                }`} />

                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                            {session.developer?.user?.name || 'Authorized Developer'}
                                        </p>
                                        <ChevronRight className="w-3 h-3 text-gray-300" />
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tight ${session.status === 'active' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                                        "{session.notes || 'Working on architectural foundations...'}"
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Clock className="w-3 h-3" />
                                            {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <History className="w-3 h-3" />
                                            {formatDuration(session.start_time, session.end_time)}
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
