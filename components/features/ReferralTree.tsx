'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import UserAvatar from '@/components/UserAvatar';

interface Referral {
    id: string;
    name: string;
    avatar_url?: string;
    role: string;
    created_at: string;
}

export default function ReferralTree() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                const res = await fetch('/api/referrals');
                const data = await res.json();
                if (data.success) {
                    setReferrals(data.data);
                }
            } catch (error) {
                console.error('Error fetching referrals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferrals();
    }, []);

    if (loading) return (
        <div className="p-8 animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl"></div>)}
            </div>
        </div>
    );

    const totalReferrals = referrals.length;
    const recentReferrals = referrals.filter(r => {
        const joinDate = new Date(r.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return joinDate > thirtyDaysAgo;
    }).length;

    const growthRate = totalReferrals > 0 ? Math.round((recentReferrals / totalReferrals) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-sm bg-indigo-50 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Network Size</p>
                            <h3 className="text-2xl font-black text-indigo-900">{totalReferrals} Members</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm bg-green-50 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-green-600 shadow-sm">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-green-400 uppercase tracking-widest">30D Growth</p>
                            <h3 className="text-2xl font-black text-green-900">+{growthRate}%</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm bg-orange-50 rounded-3xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-orange-400 uppercase tracking-widest">Active nodes</p>
                            <h3 className="text-2xl font-black text-orange-900">{recentReferrals} Recent</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Referral Cards */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-sm font-black text-gray-400 font-primary uppercase tracking-widest">Direct Referrals</h3>
                    <button className="text-xs font-bold text-[var(--primary)] flex items-center gap-1 hover:underline">
                        Share Code <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {referrals.length === 0 ? (
                    <div className="p-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                        <UserPlus className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-gray-900">Your network starts here</h4>
                        <p className="text-sm text-gray-500 mt-2">Invite colleagues to join your commissioner team and earn rewards.</p>
                        <button className="btn-primary mt-6 px-8 py-3 rounded-2xl font-bold">Invite Someone</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {referrals.map((ref) => (
                            <Card key={ref.id} className="p-6 border-none shadow-sm hover:shadow-xl transition-all rounded-[2rem] bg-white group border border-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform">
                                        <UserAvatar user={ref as any} size="md" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 leading-tight">{ref.name}</h4>
                                        <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mt-0.5">
                                            {ref.role}
                                        </p>
                                    </div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400">Joined {new Date(ref.created_at).toLocaleDateString()}</span>
                                    <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900" />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
