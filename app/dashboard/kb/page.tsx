'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    BookOpen,
    FileText,
    Video,
    MessageCircle,
    HelpCircle,
    ChevronRight,
    ArrowUpRight,
    Play,
    Loader2,
    X,
    Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const CATEGORIES = [
    { id: 'onboarding', title: 'Onboarding', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'projects', title: 'Project Management', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'payments', title: 'Payments & Escrow', icon: HelpCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'technical', title: 'Technical', icon: Video, color: 'text-orange-600', bg: 'bg-orange-50' },
];

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    slug: string;
    created_at: string;
}

export default function KnowledgeBasePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch('/api/kb');
                const data = await res.json();
                if (data.success) {
                    setArticles(data.data);
                }
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const filteredArticles = articles.filter(art => {
        const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            art.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? art.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const getArticleCount = (catId: string) => {
        return articles.filter(a => a.category === catId).length;
    };

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
                    <Card
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={`p-8 border-none shadow-sm hover:shadow-xl transition-all cursor-pointer group text-center rounded-[2.5rem] bg-white ${selectedCategory === cat.id ? 'ring-2 ring-indigo-600' : ''}`}
                    >
                        <div className={`w-16 h-16 ${cat.bg} ${cat.color} rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                            <cat.icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{cat.title}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{getArticleCount(cat.id)} Articles</p>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Popular Articles */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-gray-900 font-primary">
                            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Articles` : 'Popular Articles'}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredArticles.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-3xl text-gray-400 font-medium">
                                    No articles found in this category.
                                </div>
                            )}
                            {filteredArticles.map((art) => (
                                <div
                                    key={art.id}
                                    onClick={() => setSelectedArticle(art)}
                                    className="flex items-center gap-4 p-6 bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors">{art.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{art.category}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {new Date(art.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
                                </div>
                            ))}
                        </div>
                    )}
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

            {/* Article Modal */}
            {selectedArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <Card className="w-full max-w-3xl bg-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-400" />
                        </button>

                        <div className="mb-8 shrink-0">
                            <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">
                                <span className="px-2 py-1 bg-indigo-50 rounded">{selectedArticle.category}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(selectedArticle.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{selectedArticle.title}</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                            <div className="prose prose-indigo max-w-none text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                                {selectedArticle.content}
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between shrink-0">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Was this helpful?</p>
                            <div className="flex gap-4">
                                <button className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-all">Yes, thanks!</button>
                                <button className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all">Not really</button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
