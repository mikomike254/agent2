'use client';

import { useState, useEffect } from 'react';
import { X, Search, User, UserPlus, Shield, Check, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    currentDeveloperId?: string;
    currentCommissionerId?: string;
    onSuccess: () => void;
}

export default function AssignmentModal({
    isOpen,
    onClose,
    projectId,
    currentDeveloperId,
    currentCommissionerId,
    onSuccess
}: AssignmentModalProps) {
    const [tab, setTab] = useState<'developer' | 'commissioner'>('developer');
    const [developers, setDevelopers] = useState<any[]>([]);
    const [commissioners, setCommissioners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, tab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = tab === 'developer' ? '/api/developers' : '/api/commissioners';
            const res = await fetch(endpoint);
            const data = await res.json();
            if (data.success) {
                if (tab === 'developer') setDevelopers(data.data);
                else setCommissioners(data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (id: string) => {
        setIsUpdating(true);
        try {
            const action = tab === 'developer' ? 'set_developer' : 'set_commissioner';
            const res = await fetch(`/api/admin/projects/${projectId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, value: id })
            });
            const data = await res.json();
            if (data.success) {
                onSuccess();
                onClose();
            } else {
                alert(data.error || 'Assignment failed');
            }
        } catch (error) {
            console.error('Assignment error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const list = tab === 'developer' ? developers : commissioners;
    const filteredList = list.filter(item => {
        const name = item.user?.name || item.name || '';
        const email = item.user?.email || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <Card className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Assignment <span className="text-blue-600">Protocol</span></h2>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Sector Re-assignment / Node Deployment</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Role Tabs */}
                    <div className="flex p-1.5 bg-gray-100 rounded-3xl">
                        <button
                            onClick={() => { setTab('developer'); setSearchTerm(''); }}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${tab === 'developer' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Shield className="w-4 h-4" />
                            Developer Squad
                        </button>
                        <button
                            onClick={() => { setTab('commissioner'); setSearchTerm(''); }}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${tab === 'commissioner' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <UserPlus className="w-4 h-4" />
                            Commissioner Hub
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${tab}s...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-8 py-5 bg-gray-50 border-none rounded-[2rem] outline-none font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300"
                        />
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="py-20 text-center space-y-4">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Signal Grids</p>
                            </div>
                        ) : filteredList.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100">
                                <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching agents found</p>
                            </div>
                        ) : (
                            filteredList.map((item) => {
                                const id = item.id;
                                const isCurrent = tab === 'developer' ? id === currentDeveloperId : id === currentCommissionerId;
                                const name = item.user?.name || item.name;
                                const email = item.user?.email || item.email || '';
                                const specialties = item.specialties || item.roles || [];

                                return (
                                    <button
                                        key={id}
                                        onClick={() => handleAssign(id)}
                                        disabled={isUpdating || isCurrent}
                                        className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${isCurrent ? 'bg-blue-50 border-blue-200 cursor-default' : 'bg-white border-gray-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10'}`}
                                    >
                                        <div className="flex items-center gap-5 text-left">
                                            <div className="relative">
                                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black text-xl">
                                                    {name.charAt(0)}
                                                </div>
                                                {isCurrent && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white ring-4 ring-blue-50">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-950 text-base">{name}</h4>
                                                <p className="text-xs font-bold text-gray-400">{email}</p>
                                                <div className="flex gap-2 mt-2">
                                                    {specialties.slice(0, 3).map((s: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-50 text-[8px] font-black uppercase text-gray-500 rounded-lg">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {!isCurrent && (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                                Assign
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {isUpdating && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest animate-pulse">Re-routing Nexus Assignments</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
