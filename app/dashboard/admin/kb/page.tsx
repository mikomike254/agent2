'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit, ExternalLink, Search, Loader2, X, FileText, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    slug: string;
    is_published: boolean;
    created_at: string;
}

export default function AdminKBPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
        is_published: true
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/kb?publishedOnly=false');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = editingArticle ? 'PUT' : 'POST';
            const res = await fetch('/api/kb', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingArticle ? { ...formData, id: editingArticle.id } : formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                setEditingArticle(null);
                setFormData({
                    title: '',
                    content: '',
                    category: 'general',
                    is_published: true
                });
                fetchArticles();
            } else {
                alert(data.error || 'Failed to save article');
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            const res = await fetch(`/api/kb?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchArticles();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    if (loading && articles.length === 0) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-600" />
                        Knowledge Base Editor
                    </h1>
                    <p className="text-gray-500 mt-1">Write and publish guides for your agency network.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingArticle(null);
                        setFormData({
                            title: '',
                            content: '',
                            category: 'general',
                            is_published: true
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Article
                </button>
            </div>

            <Card className="overflow-hidden border-none shadow-xl bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-widest text-[10px] font-black">
                        <tr>
                            <th className="px-6 py-4">Article Title</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {articles.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    No articles found. Start writing your first guide!
                                </td>
                            </tr>
                        )}
                        {articles.map((article) => (
                            <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="font-bold text-gray-900">{article.title}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-widest">
                                        {article.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {article.is_published ? (
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-tight">
                                            <Eye className="w-3.5 h-3.5" />
                                            Live
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-xs uppercase tracking-tight">
                                            <EyeOff className="w-3.5 h-3.5" />
                                            Draft
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-400 font-medium">
                                    {new Date(article.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingArticle(article);
                                                setFormData({
                                                    title: article.title,
                                                    content: article.content,
                                                    category: article.category,
                                                    is_published: article.is_published
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(article.id)}
                                            className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <Card className="w-full max-w-4xl bg-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editingArticle ? 'Update Article' : 'Draft New Guide'}</h2>
                            <p className="text-gray-500 mt-1">Use simple text or markdown to format your content.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col overflow-hidden">
                            <div className="grid md:grid-cols-2 gap-8 shrink-0">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-lg transition-all"
                                        placeholder="e.g. Setting up your Escrow wallet"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold"
                                        >
                                            <option value="onboarding">Onboarding</option>
                                            <option value="projects">Projects</option>
                                            <option value="payments">Payments</option>
                                            <option value="technical">Technical</option>
                                            <option value="general">General</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visibility</label>
                                        <div className="flex items-center gap-2 h-[60px] px-5 bg-gray-50 rounded-2xl">
                                            <input
                                                type="checkbox"
                                                id="is_published"
                                                checked={formData.is_published}
                                                onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                                                className="w-5 h-5 rounded accent-indigo-600"
                                            />
                                            <label htmlFor="is_published" className="text-sm font-bold text-gray-700 cursor-pointer">Published</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 shrink-0">Article Content</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none text-gray-700 font-medium leading-relaxed resize-none flex-1 overflow-y-auto"
                                    placeholder="Write your article content here..."
                                />
                            </div>

                            <div className="pt-4 shrink-0 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            {editingArticle ? 'Save Changes' : 'Publish Article'}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-5 bg-gray-100 text-gray-900 rounded-[2rem] font-bold text-sm hover:bg-gray-200 transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
