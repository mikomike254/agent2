'use client';

import React, { useState } from 'react';
import {
    Search,
    BookOpen,
    FileText,
    Video,
    MessageCircle,
    HelpCircle,
    ChevronRight,
    ArrowUpRight,
    Play
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const CATEGORIES = [
    { id: 'onboarding', title: 'Onboarding', count: 12, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'projects', title: 'Project Management', count: 24, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'payments', title: 'Payments & Escrow', count: 8, icon: HelpCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'video', title: 'Video Tutorials', count: 15, icon: Video, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const ARTICLES = [
    { title: 'How to create your first project', category: 'onboarding', duration: '5 min read' },
    { title: 'Understanding the Escrow system', category: 'payments', duration: '8 min read' },
    { title: 'Collaborating with Commissioners', category: 'projects', duration: '6 min read' },
    { title: 'Setting up your payment method', category: 'payments', duration: '3 min read' },
];

export default function KnowledgeBasePage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Hero Section */}
            <div className="text-center py-12 space-y-6">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">How can we help?</h1>
                <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                    Search our knowledge base for guides, tutorials, and common questions.
                </p>
                <div className="max-w-2xl mx-auto relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for articles, guides..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-6 bg-white border-2 border-gray-100 rounded-[2rem] shadow-xl focus:border-[var(--primary)] outline-none transition-all font-medium text-lg"
                    />
                </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {CATEGORIES.map((cat) => (
                    <Card key={cat.id} className="p-8 border-none shadow-sm hover:shadow-xl transition-all cursor-pointer group text-center rounded-[2.5rem] bg-white">
                        <div className={`w-16 h-16 ${cat.bg} ${cat.color} rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                            <cat.icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{cat.title}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{cat.count} Articles</p>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Popular Articles */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-gray-900 font-primary">Popular Articles</h2>
                        <button className="text-xs font-bold text-[var(--primary)] hover:underline uppercase tracking-widest">View All</button>
                    </div>
                    <div className="space-y-4">
                        {ARTICLES.map((art, i) => (
                            <div key={i} className="flex items-center gap-4 p-6 bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors">{art.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{art.category}</span>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-gray-400">{art.duration}</span>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Support Teaser */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-gray-900 font-primary">Need Support?</h2>
                    <Card className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[70px] opacity-30"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-[var(--primary)]" />
                            </div>
                            <h3 className="text-xl font-bold">Talk to a specialist</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Can't find what you're looking for? Our dedicated support team is available 24/7.
                            </p>
                            <button className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                Contact Support
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>

                    {/* Tutorial Box */}
                    <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-indigo-600 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Play className="w-5 h-5 fill-current" />
                            </div>
                            <h4 className="font-bold">Next Tutorials</h4>
                        </div>
                        <p className="text-xs text-indigo-100 mb-6">Learn how to maximize your agency with our weekly masterclasses.</p>
                        <button className="text-sm font-bold border-b-2 border-white/30 hover:border-white transition-all pb-1">Watch Now</button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
