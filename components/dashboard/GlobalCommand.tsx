'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command, X, ArrowRight, Zap, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalCommand() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSearch = useCallback(async (val: string) => {
        if (!val || val.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            if (data.success) {
                setResults(data.results);
            }
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => handleSearch(query), 300);
        return () => clearTimeout(timeout);
    }, [query, handleSearch]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0F0F12] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden scale-in duration-300">
                {/* Search Bar */}
                <div className="flex items-center gap-4 p-6 border-b border-white/5">
                    <Search className="w-6 h-6 text-indigo-500" />
                    <input
                        autoFocus
                        placeholder="Search projects, users, or intelligence..."
                        className="bg-transparent border-none outline-none text-white text-lg font-medium w-full placeholder:text-gray-600"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg">
                        <span className="text-[10px] font-black text-gray-500 uppercase">ESC</span>
                    </div>
                </div>

                {/* Results Area */}
                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                    {loading && (
                        <div className="flex items-center justify-center py-20 animate-pulse">
                            <Zap className="w-8 h-8 text-indigo-500/30 animate-bounce" />
                        </div>
                    )}

                    {!loading && results.length === 0 && query.length > 0 && (
                        <div className="text-center py-20">
                            <Target className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No signals found in the matrix.</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="space-y-2 pb-4">
                            {results.map((res) => (
                                <button
                                    key={`${res.type}-${res.id}`}
                                    onClick={() => {
                                        router.push(res.url);
                                        setOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] rounded-2xl transition-all group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${res.type === 'project' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'
                                            }`}>
                                            {res.type === 'project' ? <Zap className="w-5 h-5" /> : <Command className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{res.title}</h4>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                                {res.type} • {res.meta}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:translate-x-1 group-hover:text-white transition-all" />
                                </button>
                            ))}
                        </div>
                    )}

                    {!query && (
                        <div className="space-y-6 p-4 py-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Command className="w-4 h-4 text-gray-500" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Quick Actions</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { router.push('/dashboard'); setOpen(false); }} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group">
                                    <h5 className="text-xs font-black text-white uppercase mb-1">DASHBOARD</h5>
                                    <p className="text-[10px] text-gray-500">Return to command center</p>
                                </button>
                                <button onClick={() => { router.push('/dashboard/settings/profile'); setOpen(false); }} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all">
                                    <h5 className="text-xs font-black text-white uppercase mb-1">IDENTITY</h5>
                                    <p className="text-[10px] text-gray-500">Manage your profile</p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="flex gap-4">
                        <span>↑↓ to navigate</span>
                        <span>↵ to select</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-indigo-500" />
                        Intelligence Active
                    </div>
                </div>
            </div>
        </div>
    );
}
