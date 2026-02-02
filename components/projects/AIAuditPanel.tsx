'use client';

import React, { useState } from 'react';
import { Brain, Zap, ShieldAlert, CheckCircle2, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AIAuditProps {
    projectId: string;
}

export default function AIAuditPanel({ projectId }: AIAuditProps) {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    const runAudit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId })
            });
            const data = await res.json();
            if (data.success) {
                setReport(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-8 border-none bg-gradient-to-br from-indigo-950 via-gray-900 to-black text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 -mr-20 -mt-20"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Brain className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight uppercase">Node Intelligence</h3>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Autonomous Audit Engine</p>
                        </div>
                    </div>

                    {!report && (
                        <button
                            onClick={runAudit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-indigo-900 transition-all shadow-xl shadow-indigo-500/20"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Execute Audit
                        </button>
                    )}
                </div>

                {!report && !loading && (
                    <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                        <p className="text-sm font-medium text-gray-400">Ready to synthesize project health and industrial work signals.</p>
                    </div>
                )}

                {loading && (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 animate-spin text-indigo-400" />
                            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200 animate-pulse" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-300">Synthesizing Signals...</p>
                    </div>
                )}

                {report && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Risk Indicator */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                {report.riskLevel === 'Low' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400" />}
                                Risk Evaluation: <span className={report.riskLevel === 'Low' ? 'text-emerald-400' : 'text-rose-400'}>{report.riskLevel}</span>
                            </div>
                            <button onClick={() => setReport(null)} className="text-[10px] font-bold text-gray-500 uppercase hover:text-white transition-colors">Reset</button>
                        </div>

                        {/* Sentiment */}
                        <div className="relative pl-6 border-l-2 border-indigo-500/30">
                            <p className="text-lg font-medium leading-relaxed italic text-indigo-100">
                                "{report.sentiment}"
                            </p>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tactical Recommendations</h4>
                            {report.recommendations.map((rec: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-xs font-bold text-gray-300 border border-transparent hover:border-indigo-500/30 transition-all">
                                    <ChevronRight className="w-3 h-3 text-indigo-500" />
                                    {rec}
                                </div>
                            ))}
                        </div>

                        {/* Signals Grid */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                            <div className="text-center">
                                <p className="text-2xl font-black tabular-nums">{report.signals.health}%</p>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Health</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black">{report.signals.activity}</p>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Activity</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black">{report.signals.alignment}</p>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sync</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
