'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Star,
    CheckCircle,
    ChevronRight,
    Briefcase,
    Zap,
    Users
} from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/UserAvatar';

export default function BrowseCommissioners() {
    const [commissioners, setCommissioners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    useEffect(() => {
        const fetchCommissioners = async () => {
            try {
                const res = await fetch(`/api/commissioners?search=${search}&category=${category}`);
                const data = await res.json();
                if (data.success) {
                    setCommissioners(data.data);
                }
            } catch (error) {
                console.error('Error fetching commissioners:', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchCommissioners, 300);
        return () => clearTimeout(timer);
    }, [search, category]);

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative p-12 lg:p-20 bg-black rounded-[3rem] overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
                <div className="relative z-10 max-w-2xl space-y-6">
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                        Premium <span className="text-indigo-400">Talent Leaders.</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-medium">
                        Connect with verified commissioners to lead your next digital venture. Expert oversight, guaranteed delivery.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1.2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by expertise, name or bio..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all backdrop-blur-md"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-4">
                {['All', 'Web App', 'Mobile App', 'E-commerce', 'UI/UX Design', 'Fintech'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${category === cat
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white border border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-80 bg-gray-50 rounded-[2.5rem] animate-pulse"></div>
                    ))
                ) : commissioners.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No commissioners found matching your criteria</p>
                    </div>
                ) : (
                    commissioners.map((comm) => (
                        <div key={comm.id} className="group relative bg-white rounded-[3rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
                            <div className="p-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-gray-50 group-hover:border-indigo-100 transition-colors">
                                        <UserAvatar user={{ name: comm.name, avatar_url: comm.avatar }} size="xl" />
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                        <Star className="w-3 h-3 fill-current" />
                                        {comm.rating}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                        {comm.name}
                                        {comm.availability === 'available' && (
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        )}
                                    </h3>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Verified Commissioner</p>
                                </div>

                                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
                                    {comm.bio}
                                </p>

                                <div className="flex flex-wrap gap-2 py-2">
                                    {comm.specialties?.slice(0, 3).map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-tighter group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            {s}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-gray-900 leading-none">{comm.completed_projects}</span>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Projects</span>
                                    </div>
                                    <Link href={`/profile/${comm.user_id}`}>
                                        <button className="h-12 w-12 bg-black text-white rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
