'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Award, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getLevelBadgeRaw, CommissionerLevel } from '@/lib/commission';
import ReferralTree from '@/components/features/ReferralTree';

export default function TeamPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/commissioner/team');
                const json = await res.json();
                if (res.ok) {
                    setData(json);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    const { downline = [], stats = {}, level = 'bronze' } = data || {};

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Team & Earnings</h2>
                <p className="text-gray-500 mt-2 text-lg">Track your team performance and commission earnings.</p>
            </div>

            {/* Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-lg bg-white">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Team Members</p>
                    <h3 className="text-4xl font-black text-gray-900">{stats.totalAgents || 0}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md">
                        <Users className="w-3 h-3" />
                        <span>Active</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-lg bg-white">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Team Revenue</p>
                    <h3 className="text-4xl font-black text-gray-900">KES {(stats.teamRevenue || 0).toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                        <TrendingUp className="w-3 h-3" />
                        <span>Generated</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-lg bg-white">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">My Earnings</p>
                    <h3 className="text-4xl font-black text-gray-900">KES {(stats.lifetimeOverrides || 0).toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-yellow-600 bg-yellow-50 w-fit px-2 py-1 rounded-md">
                        <DollarSign className="w-3 h-3" />
                        <span>Commissions</span>
                    </div>
                </Card>
            </div>

            {/* Referral Tree Visualization */}
            <div className="pt-4">
                <h3 className="text-xl font-black text-gray-900 mb-6">Network Visualization</h3>
                <ReferralTree />
            </div>

            {/* Team Table */}
            <Card className="overflow-hidden border-none shadow-xl">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Team Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-6 py-4">Commissioner</th>
                                <th className="px-6 py-4">Level</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Revenue Generated</th>
                                <th className="px-6 py-4 text-right">Earnings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {downline.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No team members yet. Invite other commissioners to join your team!
                                    </td>
                                </tr>
                            ) : (
                                downline.map((agent: any) => {
                                    const badge = getLevelBadgeRaw(agent.level as CommissionerLevel);
                                    return (
                                        <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{agent.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{agent.joined}</td>
                                            <td className="px-6 py-4 text-right font-mono text-gray-600">
                                                {agent.revenue > 0 ? `KES ${agent.revenue.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-green-600">
                                                {agent.my_earnings > 0 ? `KES ${agent.my_earnings.toLocaleString()}` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
