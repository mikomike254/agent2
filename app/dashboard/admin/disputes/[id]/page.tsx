'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ShieldAlert,
    ArrowLeft,
    Scale,
    MessageSquare,
    FileText,
    DollarSign,
    Gavel,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Split
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export default function ArbitrationConsole() {
    const { id } = useParams();
    const router = useRouter();
    const [dispute, setDispute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchDispute = async () => {
            try {
                const res = await fetch(`/api/admin/disputes/${id}`);
                const data = await res.json();
                if (data.success) {
                    setDispute(data.dispute);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDispute();
    }, [id]);

    const handleAction = async (action: 'refund_client' | 'release_developer' | 'split') => {
        if (!confirm(`Are you sure you want to execute [${action.replace('_', ' ').toUpperCase()}]? This will move real funds and close the dispute.`)) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/disputes/${id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                alert('Arbitration completed successfully.');
                router.push('/dashboard/admin/disputes');
            }
        } catch (err) {
            console.warn('Action error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-black uppercase tracking-widest">Opening Secure Archive...</div>;
    if (!dispute) return <div className="p-20 text-center text-red-500 font-bold uppercase tracking-widest">Dispute Case Not Found.</div>;

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold uppercase tracking-widest text-[10px]">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tribunal
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${dispute.status === 'open' ? 'bg-rose-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                        Status: {dispute.status}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full">
                        Case ID: {dispute.id.slice(0, 8)}
                    </span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Case Overview */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-10 border-none shadow-2xl rounded-[3rem] bg-white relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{dispute.project_title}</h1>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    Raised by: <span className="text-rose-600">{dispute.raised_by_name}</span> • {format(new Date(dispute.created_at), 'PPP')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-8 rounded-[2rem]">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Claim Detail
                                </h3>
                                <p className="text-gray-700 leading-relaxed font-medium">{dispute.reason}</p>
                            </div>

                            {/* Evidence Files Mock/Placeholder */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 border border-gray-100 rounded-3xl flex items-center gap-4 hover:border-indigo-500 transition-colors cursor-pointer group">
                                    <FileText className="w-6 h-6 text-gray-300 group-hover:text-indigo-600" />
                                    <span className="text-xs font-bold text-gray-500">Project_spec.pdf</span>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-3xl flex items-center gap-4 hover:border-indigo-500 transition-colors cursor-pointer group">
                                    <FileText className="w-6 h-6 text-gray-300 group-hover:text-indigo-600" />
                                    <span className="text-xs font-bold text-gray-500">Milestone_1_Proof.zip</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Chat History / Timeline Mock */}
                    <Card className="p-10 border-none shadow-xl rounded-[3rem] bg-gray-50/50">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Arbitration Log</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0"></div>
                                <p className="text-xs text-gray-600 font-medium">Dispute initiated by Client. System-lock engaged on project escrow.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 shrink-0"></div>
                                <p className="text-xs text-gray-400 font-medium italic">Developer requested mediation 2 hours later.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Arbitration Controls */}
                <div className="space-y-8">
                    <Card className="p-10 border-none shadow-2xl bg-black text-white rounded-[3rem] relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                <Scale className="w-6 h-6 text-indigo-400" />
                                Verdict Hub
                            </h3>

                            <div className="bg-white/5 p-6 rounded-[2rem] mb-8 border border-white/10">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Escrow at Stake</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">KES 45,000</span>
                                    <span className="text-[10px] text-indigo-400 font-black uppercase">Reserved</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleAction('refund_client')}
                                    disabled={submitting}
                                    className="w-full py-5 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                                >
                                    <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                    Full Refund to Client
                                </button>
                                <button
                                    onClick={() => handleAction('release_developer')}
                                    disabled={submitting}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Release to Developer
                                </button>
                                <button
                                    onClick={() => handleAction('split')}
                                    disabled={submitting}
                                    className="w-full py-5 bg-white/10 border border-white/20 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <Split className="w-4 h-4" />
                                    Split Escrow (50/50)
                                </button>
                            </div>
                        </div>
                        {/* Abstract bg element */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                    </Card>

                    <Card className="p-10 border border-gray-100 bg-white rounded-[3rem] shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Protocol Tip</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Arbitrators should review "Project Versions" submitted by the developer and "Messages" before issuing a final verdict.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
