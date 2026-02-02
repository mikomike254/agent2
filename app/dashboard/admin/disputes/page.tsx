'use client';

import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Scale,
    MessageSquare,
    CheckCircle,
    XCircle,
    ArrowRight,
    Search,
    Clock,
    User,
    Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ConflictCenterPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<any>(null);
    const [resolutionText, setResolutionText] = useState('');

    useEffect(() => {
        const fetchDisputes = async () => {
            try {
                const res = await fetch('/api/admin/disputes');
                const data = await res.json();
                if (data.disputes) setDisputes(data.disputes);
            } catch (err) {
                console.error('Failed to load disputes');
            } finally {
                setLoading(false);
            }
        };
        fetchDisputes();
    }, []);

    const handleResolve = async (status: string, action?: string) => {
        if (!selectedDispute) return;
        try {
            const res = await fetch(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolution: resolutionText, status, action })
            });
            if (res.ok) {
                // Refresh list
                const updated = disputes.map(d => d.id === selectedDispute.id ? { ...d, status } : d);
                setDisputes(updated);
                setSelectedDispute(null);
                setResolutionText('');
            }
        } catch (err) {
            alert('Resolution failed');
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="bg-black/40 border border-rose-500/20 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Scale className="w-32 h-32 text-rose-500" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Conflict Resolution Center
                    </h1>
                    <p className="text-rose-200/60 mt-2 max-w-xl">
                        Arbitrate disputes, review environment logs, and issue final judgments on escrow releases. Total transparency for multi-party trust.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dispute List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search case ID..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/30 outline-none"
                        />
                    </div>

                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center py-10 text-slate-500">Scanning for conflicts...</div>
                        ) : disputes.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                Peace is maintained. No active disputes.
                            </div>
                        ) : (
                            disputes.map((d) => (
                                <button
                                    key={d.id}
                                    onClick={() => setSelectedDispute(d)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedDispute?.id === d.id
                                            ? 'bg-rose-500/10 border-rose-500/40'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-black ${d.status === 'open' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                                            }`}>
                                            {d.status}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono italic">#{d.id.split('-')[0]}</span>
                                    </div>
                                    <h3 className="font-bold text-white truncate">{d.reason || 'General Dispute'}</h3>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Dispute Details / Arbitration Panel */}
                <div className="lg:col-span-2">
                    {selectedDispute ? (
                        <div className="bg-black/40 border border-white/10 rounded-3xl overflow-hidden h-fit flex flex-col">
                            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white text-lg">Arbitration Case #{selectedDispute.id.split('-')[0]}</h2>
                                        <p className="text-xs text-slate-500">Raised by: {selectedDispute.raised_by_email || 'Verified User'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Escrow Funds</p>
                                    <p className="text-xl font-black text-rose-400">$2,450.00</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                                <section className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> Grievance Statement
                                    </h3>
                                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-slate-300 leading-relaxed italic border-l-4 border-l-rose-500">
                                        "{selectedDispute.reason}"
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Evidence Log
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs flex items-center justify-between group cursor-pointer hover:bg-white/10">
                                            <span className="truncate">communication_log.pdf</span>
                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs flex items-center justify-between group cursor-pointer hover:bg-white/10">
                                            <span className="truncate">technical_specs.docx</span>
                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-3 pt-6 border-t border-white/5">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase">Investigator Notes & Ruling</h3>
                                    <textarea
                                        value={resolutionText}
                                        onChange={(e) => setResolutionText(e.target.value)}
                                        placeholder="Enter internal investigation notes and final arbitration logic..."
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none h-32 resize-none"
                                    />
                                </section>
                            </div>

                            <div className="p-6 bg-black/60 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <button
                                    onClick={() => handleResolve('investigating')}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
                                >
                                    Flag for Review
                                </button>
                                <button
                                    onClick={() => handleResolve('resolved', 'release_escrow')}
                                    className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Release Funds
                                </button>
                                <button
                                    onClick={() => handleResolve('resolved', 'refund_client')}
                                    className="px-4 py-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" /> Partial Refund
                                </button>
                                <button
                                    onClick={() => handleResolve('closed', 'refund_client')}
                                    className="px-4 py-3 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Hard Reject
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-black/40 border border-dashed border-white/10 rounded-3xl h-[600px] flex flex-col items-center justify-center text-slate-500 gap-4">
                            <Scale className="w-16 h-16 opacity-20" />
                            <p className="text-sm">Select a case from the log to begin arbitration</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
