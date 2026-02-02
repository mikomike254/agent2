'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Edit, ExternalLink, Image as ImageIcon, Video, Mail, Loader2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Asset {
    id: string;
    title: string;
    description: string;
    asset_type: string;
    url: string;
    thumbnail_url?: string;
    tier_required: string;
}

export default function AdminMarketingPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        asset_type: 'banner',
        url: '',
        thumbnail_url: '',
        tier_required: 'tier1'
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/assets');
            const data = await res.json();
            if (data.success) {
                setAssets(data.data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = editingAsset ? 'PUT' : 'POST';
            const res = await fetch('/api/assets', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingAsset ? { ...formData, id: editingAsset.id } : formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                setEditingAsset(null);
                setFormData({
                    title: '',
                    description: '',
                    asset_type: 'banner',
                    url: '',
                    thumbnail_url: '',
                    tier_required: 'tier1'
                });
                fetchAssets();
            } else {
                alert(data.error || 'Failed to save asset');
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            const res = await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchAssets();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'banner': return <ImageIcon className="w-5 h-5 text-purple-500" />;
            case 'video': return <Video className="w-5 h-5 text-red-500" />;
            case 'email_swipe': return <Mail className="w-5 h-5 text-blue-500" />;
            default: return <Megaphone className="w-5 h-5 text-indigo-500" />;
        }
    };

    if (loading && assets.length === 0) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-indigo-600" />
                        Asset Manager
                    </h1>
                    <p className="text-gray-500 mt-1">Manage marketing materials for your Commissioner network.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAsset(null);
                        setFormData({
                            title: '',
                            description: '',
                            asset_type: 'banner',
                            url: '',
                            thumbnail_url: '',
                            tier_required: 'tier1'
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Asset
                </button>
            </div>

            <Card className="overflow-hidden border-none shadow-xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Title & Type</th>
                            <th className="px-6 py-4">Required Tier</th>
                            <th className="px-6 py-4">Asset URL</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">{getIcon(asset.asset_type)}</div>
                                        <div>
                                            <div className="font-bold text-gray-900">{asset.title}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-black">{asset.asset_type}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-widest">
                                        {asset.tier_required}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <a href={asset.url} target="_blank" className="text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                                        View Resource <ExternalLink className="w-3 h-3" />
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingAsset(asset);
                                                setFormData({
                                                    title: asset.title,
                                                    description: asset.description,
                                                    asset_type: asset.asset_type,
                                                    url: asset.url,
                                                    thumbnail_url: asset.thumbnail_url || '',
                                                    tier_required: asset.tier_required
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
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

            {/* Asset Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-xl bg-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <h2 className="text-2xl font-black text-gray-900 mb-6">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none font-bold transition-all"
                                        placeholder="e.g. Q1 Banner Set"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Type</label>
                                    <select
                                        value={formData.asset_type}
                                        onChange={e => setFormData({ ...formData, asset_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none font-bold"
                                    >
                                        <option value="banner">Banner Image</option>
                                        <option value="email_swipe">Email Swipe</option>
                                        <option value="social_post">Social Post</option>
                                        <option value="video">Video Tutorial</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resource URL</label>
                                <input
                                    required
                                    type="url"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none font-mono text-xs"
                                    placeholder="https://drive.google.com/..."
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thumbnail URL (Optional)</label>
                                    <input
                                        type="url"
                                        value={formData.thumbnail_url}
                                        onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none font-mono text-xs"
                                        placeholder="https://imgur.com/..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tier Requirement</label>
                                    <select
                                        value={formData.tier_required}
                                        onChange={e => setFormData({ ...formData, tier_required: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none font-bold"
                                    >
                                        <option value="tier1">Tier 1 (Bronze)</option>
                                        <option value="tier2">Tier 2 (Silver)</option>
                                        <option value="tier3">Tier 3 (Gold)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm min-h-[100px]"
                                    placeholder="Explain how to use this asset..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Asset'}
                            </button>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
