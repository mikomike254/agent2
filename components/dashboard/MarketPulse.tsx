'use client';

import { useState, useEffect } from 'react';
import { Star, Briefcase, Award, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import Link from 'next/link';

export default function MarketPulse() {
    const [developers, setDevelopers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopDevelopers = async () => {
            try {
                const res = await fetch('/api/developers/top');
                const data = await res.json();
                if (data.success) {
                    setDevelopers(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching top developers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopDevelopers();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-white/5 rounded w-1/3 mb-4"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-[2rem] border border-white/5"></div>
                ))}
            </div>
        );
    }

    if (developers.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Market Pulse</h2>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3" />
                    Live Talent
                </div>
            </div>

            <div className="space-y-4">
                {developers.map((dev) => (
                    <Link
                        key={dev.id}
                        href={`/profile/${dev.user?.id}`}
                        className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl border-2 border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                            <UserAvatar user={dev.user} size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                {dev.user?.name}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-widest mt-0.5">
                                {dev.specialization || 'Full Stack Node'}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                                    <Star className="fill-yellow-500 w-3 h-3" />
                                    {dev.rating || '5.0'}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Briefcase className="w-3 h-3" />
                                    {dev.projects_completed || 0} Projects
                                </div>
                            </div>
                        </div>
                        <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
                        </div>
                    </Link>
                ))}
            </div>

            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all">
                Access Elite Talent Pool
            </button>
        </div>
    );
}
