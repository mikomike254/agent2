'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, Cpu, Globe, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function GlobalNodeHealth() {
    const [metrics, setMetrics] = useState({
        latency: 12,
        load: 24,
        dbStatus: 'Synchronized',
        apiStatus: 'Operational',
        connections: 156
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                latency: Math.floor(Math.random() * 5) + 8,
                load: Math.floor(Math.random() * 10) + 15,
                connections: prev.connections + (Math.random() > 0.5 ? 1 : -1)
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="p-8 border-none bg-indigo-950 text-white shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                            <Activity className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic">Global Node <span className="text-indigo-400">Health</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300/60 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                Real-time Telemetry Active
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-yellow-400" /> API Latency
                        </p>
                        <p className="text-3xl font-black tabular-nums">{metrics.latency}ms</p>
                        <p className="text-[10px] text-indigo-400 font-bold mt-1 uppercase tracking-tighter italic">Low Latency Node</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Database className="w-3 h-3 text-indigo-400" /> DB Sync
                        </p>
                        <p className="text-3xl font-black">{metrics.dbStatus}</p>
                        <p className="text-[10px] text-green-400 font-bold mt-1 uppercase tracking-tighter italic">No Latency Detected</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Globe className="w-3 h-3 text-blue-400" /> Connections
                        </p>
                        <p className="text-3xl font-black tabular-nums">{metrics.connections}</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter italic">Active Transmission</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Cpu className="w-3 h-3 text-purple-400" /> Node Load
                        </p>
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-black tabular-nums">{metrics.load}%</p>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${metrics.load}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between p-4 bg-indigo-900/40 rounded-2xl border border-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest">Platform Sovereign Integrity</p>
                            <p className="text-[10px] text-gray-400 italic">All sub-systems reporting optimal status (Node Version 2.0.4)</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Deep Diagnostics
                    </button>
                </div>
            </div>
        </Card>
    );
}
