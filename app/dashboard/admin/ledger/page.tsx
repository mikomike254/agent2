'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { supabaseClient } from '@/lib/db';
import {
    FileText,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2,
    Plus,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    Database,
    Zap
} from 'lucide-react';

export default function AdminLedgerPage() {
    const { data: session } = useSession();
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('adjustment');

    const fetchLedger = useCallback(async () => {
        try {
            if (!supabaseClient) throw new Error('Supabase client not initialized');
            const { data, error } = await supabaseClient
                .from('escrow_ledger')
                .select(`
                    *,
                    project:projects(title)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEntries(data || []);
        } catch (error) {
            console.error('Error fetching ledger:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) {
            fetchLedger();
        }
    }, [session, fetchLedger]);

    const handleOverride = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const res = await fetch('/api/admin/financials/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(amount),
                    description: desc,
                    transactionType: type,
                    action: 'manual_entry'
                })
            });
            const result = await res.json();
            if (result.success) {
                setShowAdjustModal(false);
                setAmount('');
                setDesc('');
                fetchLedger();
            } else {
                alert(result.error || 'Override failed');
            }
        } catch (error) {
            console.error('Override error:', error);
            alert('An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const totalEscrow = entries[0]?.balance_after || 0;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Database className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Escrow <span className="text-indigo-600">Master</span></h1>
                    </div>
                    <p className="text-gray-500 font-medium">Platform-wide financial auditing and manual overrides.</p>
                </div>

                <div className="flex gap-4">
                    <Card className="px-6 py-4 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 border-none flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Vault Balance</span>
                        <span className="text-2xl font-black tabular-nums">KES {Number(totalEscrow).toLocaleString()}</span>
                    </Card>
                    <button
                        onClick={() => setShowAdjustModal(true)}
                        className="bg-black text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-gray-900/10"
                    >
                        <Plus className="w-5 h-5" />
                        Manual Adjustment
                    </button>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-2xl shadow-indigo-500/5">
                <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        Master Transaction Log
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal Node</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Project/Source</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nexus Description</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Delta</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Balance Post-State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
                                        <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-300">Synchronizing Ledger...</p>
                                    </td>
                                </tr>
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">Financial record is currently void.</td>
                                </tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id} className={`group hover:bg-gray-50/50 transition-all ${entry.description.includes('[ADMIN OVERRIDE]') ? 'bg-orange-50/30' : ''}`}>
                                        <td className="px-6 py-5 text-xs font-bold text-gray-400">
                                            {new Date(entry.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 tracking-tight underline decoration-indigo-200 decoration-2 underline-offset-4">{entry.project?.title || 'Nexus Core'}</span>
                                                <span className="text-[9px] font-black uppercase tracking-tighter text-indigo-600 mt-1">{entry.transaction_type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                {entry.description.includes('[ADMIN OVERRIDE]') && <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />}
                                                <span className={`text-sm font-medium ${entry.description.includes('[ADMIN OVERRIDE]') ? 'text-orange-700 font-bold' : 'text-gray-700'}`}>
                                                    {entry.description}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl w-fit font-black text-sm ${entry.amount >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                {entry.amount >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                KES {Math.abs(Number(entry.amount)).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black tabular-nums text-gray-950">
                                            KES {Number(entry.balance_after).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Adjustment Modal */}
            {showAdjustModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
                    <Card className="w-full max-w-lg p-8 animate-in zoom-in duration-200 border-none shadow-3xl bg-white">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Nexus Override</h3>
                                <p className="text-gray-500 text-sm mt-1">Manual adjustment of the universal ledger.</p>
                            </div>
                            <button onClick={() => setShowAdjustModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleOverride} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction Delta (Use negative for outflows)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">KES</span>
                                    <input
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-16 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-black text-xl transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Override Authorization Target</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                                >
                                    <option value="adjustment">Balance Adjustment</option>
                                    <option value="payout">Manual Payout Sync</option>
                                    <option value="refund">Manual Refund Sync</option>
                                    <option value="fee">Fee Correction</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Adjustment Rationale</label>
                                <textarea
                                    required
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-medium transition-all"
                                    placeholder="Explain the reason for this override..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {isProcessing ? 'Executing Nexus Command...' : 'Execute Override'}
                            </button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
