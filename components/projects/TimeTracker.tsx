'use client';

import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Zap, History, FileText, Loader2 } from 'lucide-react';

interface TimeTrackerProps {
    projectId: string;
    milestoneId?: string;
}

export default function TimeTracker({ projectId, milestoneId }: TimeTrackerProps) {
    const [activeSession, setActiveSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [elapsed, setElapsed] = useState(0);

    const fetchActiveSession = async () => {
        try {
            const res = await fetch(`/api/work-sessions?projectId=${projectId}`);
            const data = await res.json();
            if (data.success) {
                const active = data.data.find((s: any) => s.status === 'active');
                if (active) {
                    setActiveSession(active);
                    const start = new Date(active.start_time).getTime();
                    setElapsed(Math.floor((Date.now() - start) / 1000));
                }
            }
        } catch (err) {
            console.error('Error fetching sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveSession();
    }, [projectId]);

    useEffect(() => {
        let interval: any;
        if (activeSession) {
            interval = setInterval(() => {
                const start = new Date(activeSession.start_time).getTime();
                setElapsed(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/work-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'start',
                    projectId,
                    milestoneId,
                    notes
                })
            });
            const data = await res.json();
            if (data.success) {
                setActiveSession(data.data);
                setNotes('');
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/work-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'stop',
                    sessionId: activeSession.id,
                    notes
                })
            });
            if ((await res.json()).success) {
                setActiveSession(null);
                setElapsed(0);
                setNotes('');
            }
        } catch (err) {
            console.warn(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading && !activeSession) return <div className="p-8 bg-white/5 rounded-3xl animate-pulse h-32" />;

    return (
        <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${activeSession ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-200' : 'bg-white border-gray-100 shadow-sm'
            }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${activeSession ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                        {activeSession ? <Zap className="w-8 h-8 animate-pulse" /> : <Clock className="w-8 h-8" />}
                    </div>
                    <div>
                        <h4 className={`text-lg font-black uppercase tracking-tight ${activeSession ? 'text-white' : 'text-gray-900'}`}>
                            {activeSession ? 'Session Active' : 'Work Intelligence'}
                        </h4>
                        <p className={`text-xs font-bold uppercase tracking-widest ${activeSession ? 'text-indigo-100' : 'text-gray-400'}`}>
                            {activeSession ? `Logging duration: ${formatTime(elapsed)}` : 'Record your industrial output'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {!activeSession ? (
                        <>
                            <input
                                placeholder="What are you building?"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="flex-1 md:w-64 bg-gray-50 border-none outline-none px-4 py-3 rounded-xl text-sm font-medium"
                            />
                            <button
                                onClick={handleStart}
                                className="bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                <Play className="w-5 h-5 fill-current" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <input
                                placeholder="Session notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="bg-white/10 text-white placeholder:text-indigo-200 border-none outline-none px-4 py-3 rounded-xl text-sm font-medium"
                            />
                            <button
                                onClick={handleStop}
                                className="bg-white text-indigo-600 p-4 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all shadow-xl"
                            >
                                <Square className="w-5 h-5 fill-current" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {activeSession && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-bold text-indigo-100 uppercase tracking-widest">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Synchronizing with global time-ledger
                </div>
            )}
        </div>
    );
}
