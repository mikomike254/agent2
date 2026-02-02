'use client';

import React from 'react';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';

interface Milestone {
    id: string;
    title: string;
    status: 'pending' | 'completed' | 'in_progress' | 'disputed';
    percent_amount: number;
    order_index: number;
}

interface ProjectTimelineProps {
    milestones: Milestone[];
}

export default function ProjectTimeline({ milestones }: ProjectTimelineProps) {
    if (!milestones || milestones.length === 0) return null;

    const sortedMilestones = [...milestones].sort((a, b) => a.order_index - b.order_index);

    return (
        <div className="space-y-8 py-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Strategic Roadmap</h3>
                </div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                    {sortedMilestones.length} Phases Defined
                </div>
            </div>

            {/* Horizontal Flow */}
            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 hidden md:block"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                    {sortedMilestones.map((m, idx) => (
                        <div key={m.id} className="relative group">
                            {/* Visual Node */}
                            <div className="mb-4 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-[#0F0F12] shadow-2xl transition-all duration-500 ${m.status === 'completed' ? 'bg-green-500 text-white' :
                                        m.status === 'in_progress' ? 'bg-indigo-600 text-white animate-pulse' :
                                            'bg-white/5 text-gray-600 border-white/5'
                                    }`}>
                                    {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                        m.status === 'in_progress' ? <Clock className="w-5 h-5" /> :
                                            <Circle className="w-5 h-5" />}
                                </div>
                                <div className="mt-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                    Phase {idx + 1}
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className={`p-6 bg-white shadow-2xl rounded-[2rem] border transition-all duration-300 ${m.status === 'in_progress' ? 'border-indigo-500/50 scale-105' :
                                    m.status === 'completed' ? 'border-green-500/20 opacity-80' :
                                        'border-transparent opacity-60'
                                }`}>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                    {m.title}
                                </h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                                        Value: {m.percent_amount}%
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 capitalize">
                                        {m.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scale Indicator */}
            <div className="flex items-center gap-4 bg-[#0F0F12]/50 border border-white/5 p-4 rounded-2xl">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-1000"
                        style={{ width: `${(milestones.filter(m => m.status === 'completed').length / milestones.length) * 100}%` }}
                    ></div>
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Execution Velocity: {Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100)}%
                </span>
            </div>
        </div>
    );
}
