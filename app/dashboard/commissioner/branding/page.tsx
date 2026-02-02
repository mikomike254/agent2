'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Upload, Globe, Save, Loader2, CheckCircle, Smartphone, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';

export default function BrandingHub() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        primaryColor: '#5347CE',
        logoUrl: '',
        displayName: '',
        theme: 'onyx'
    });

    useEffect(() => {
        const fetchBranding = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/commissioner/branding');
                const data = await res.json();
                if (data.success && data.config) {
                    setConfig(data.config);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBranding();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/commissioner/branding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config })
            });
            const data = await res.json();
            if (data.success) {
                alert('Sovereign Branding Manifested.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Branding <span className="text-indigo-600">Sovereignty</span></h1>
                <p className="text-gray-500 font-medium italic mt-1">Manifest your unique aesthetic across your client-facing nodes.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Configuration side */}
                <div className="space-y-8">
                    <Card className="p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Palette className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Aesthetic Core</h3>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Primary Node Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={config.primaryColor}
                                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                    className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-xl"
                                />
                                <input
                                    type="text"
                                    value={config.primaryColor}
                                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-mono text-sm uppercase font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Display Identity</label>
                            <input
                                placeholder="e.g. Acme Studio Network"
                                value={config.displayName}
                                onChange={(e) => setConfig({ ...config, displayName: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Identity Seal (Logo URL)</label>
                            <div className="flex gap-4">
                                <input
                                    placeholder="https://..."
                                    value={config.logoUrl}
                                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                                />
                                <button className="p-4 bg-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors">
                                    <Upload className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-4 bg-indigo-600 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin text-indigo-200" /> : <Save className="w-4 h-4" />}
                            Execute Manifest
                        </button>
                    </Card>

                    <Card className="p-8 bg-gray-50 border-dashed border-2 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-indigo-100">
                            <Globe className="w-8 h-8 text-indigo-200" />
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 text-sm uppercase">Global SEO node</h4>
                            <p className="text-xs text-gray-400 mt-1 font-medium italic">Changes propagate across all public referral and onboarding nodes within 60s.</p>
                        </div>
                    </Card>
                </div>

                {/* Preview side */}
                <div className="space-y-6 lg:sticky lg:top-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-gray-500 uppercase tracking-widest text-xs">Live Synthesis Preview</h3>
                        <div className="flex gap-2">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Monitor className="w-4 h-4" /></div>
                            <div className="p-2 bg-gray-100 text-gray-400 rounded-lg"><Smartphone className="w-4 h-4" /></div>
                        </div>
                    </div>

                    <div className="w-full aspect-[4/3] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-100 relative">
                        {/* Mock Header */}
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {config.logoUrl ? (
                                    <img src={config.logoUrl} alt="Logo" className="h-6 w-auto" />
                                ) : (
                                    <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: config.primaryColor }}></div>
                                )}
                                <span className="font-black tracking-tighter text-gray-900">{config.displayName || 'CREATIVE.KE'}</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                                <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                            </div>
                        </div>

                        {/* Mock Hero */}
                        <div className="p-8 space-y-4">
                            <div className="w-2/3 h-8 bg-gray-100 rounded-xl"></div>
                            <div className="w-full h-32 bg-gray-50 rounded-3xl relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: config.primaryColor }}></div>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-6 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg" style={{ backgroundColor: config.primaryColor }}>
                                    Primary Action
                                </div>
                                <div className="px-6 py-3 rounded-xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Secondary
                                </div>
                            </div>
                        </div>

                        {/* Mock Tags */}
                        <div className="px-8 flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-[8px] font-black uppercase text-gray-300">TAG NODE 0{i}</div>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Aesthetic Transmission: {config.theme.toUpperCase()} MODE</p>
                </div>
            </div>
        </div>
    );
}
