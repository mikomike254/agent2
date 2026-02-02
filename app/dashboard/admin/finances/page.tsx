'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShieldCheck, ArrowUpRight, ArrowDownRight, History, Download, Filter, Search, Zap, Loader2, PieChart } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminFinancesPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>(null);

    const fetchData = async () => {
        try {
            const [ledgerRes, metricsRes] = await Promise.all([
                fetch('/api/admin/metrics'), // Using existing metrics API
                fetch('/api/admin/metrics') // Placeholder for more detailed ledger
            ]);
            const metricsData = await ledgerRes.json();
            if (metricsData.success) {
                setStats(metricsData.stats);
            }

            // Mocking the ledger for this view
            setTransactions([
                { id: '1', date: '2026-02-02', type: 'inflow', description: 'Deposit: Project Archelon', amount: 45000, status: 'secured', reference: 'PAY-8821' },
                { id: '2', date: '2026-02-01', type: 'outflow', description: 'Payout: Developer #12 (Milestone 1)', amount: 15000, status: 'released', reference: 'TXN-0021' },
                { id: '3', date: '2026-02-01', type: 'inflow', description: 'Service Fee: Account Verification', amount: 500, status: 'secured', reference: 'PAY-9912' },
                { id: '4', date: '2026-01-31', type: 'outflow', description: 'Split: Dispute Resolution #042', amount: 7500, status: 'arbitrated', reference: 'ARB-5511' },
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">The Ledger <span className="text-indigo-600">of Truth</span></h1>
                    <p className="text-gray-500 font-medium italic mt-1">Universal financial oversight and industrial audit trail.</p>
                </div>
                <button className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" />
                    Export Global Ledger
                </button>
            </div>

            {/* High-Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 bg-indigo-600 text-white border-none shadow-2xl shadow-indigo-200 group relative overflow-hidden">
                    <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-30 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <p className="text-indigo-100 font-black uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> TOTAL ESCROW VOLUME
                        </p>
                        <h3 className="text-4xl font-black italic tracking-tighter leading-none">KES {(stats?.revenue?.total || 125000).toLocaleString()}</h3>
                        <p className="text-[10px] text-indigo-200 mt-4 uppercase font-bold tracking-widest">Active nodes across platform</p>
                    </div>
                </Card>

                <Card className="p-8 border-gray-100 shadow-sm">
                    <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">PLATFORM YIELD (10%)</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-gray-950 italic tracking-tighter leading-none">KES {((stats?.revenue?.total || 125000) * 0.1).toLocaleString()}</h3>
                        <div className="flex items-center gap-1 text-green-500 font-black text-xs">
                            <TrendingUp className="w-3 h-3" /> 12%
                        </div>
                    </div>
                </Card>

                <Card className="p-8 border-gray-100 shadow-sm border-dashed">
                    <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">PENDING ARBITRATION</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-rose-500 italic tracking-tighter leading-none">KES 14,200</h3>
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-rose-500" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Transaction Ledger */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-500" />
                        GLOBAL AUDIT TRAIL
                    </h3>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input placeholder="Filter by Ref..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none w-48 focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                        <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-indigo-600 transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Movement</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse"><td colSpan={5} className="p-10"><div className="h-4 bg-gray-50 rounded w-full"></div></td></tr>
                                ))
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/30 transition-all font-medium">
                                        <td className="px-8 py-6 text-xs text-gray-400 font-bold">{tx.date}</td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-gray-950 uppercase tracking-tight">{tx.description}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'inflow' ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                                                <p className={`text-lg font-black italic tabular-nums ${tx.type === 'inflow' ? 'text-green-600' : 'text-gray-950'}`}>
                                                    {tx.type === 'inflow' ? '+' : '-'} {tx.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${tx.status === 'secured' ? 'bg-indigo-50 text-indigo-600' :
                                                    tx.status === 'released' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-mono text-xs text-gray-400 uppercase">{tx.reference}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function TrendingUp(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    )
}
