'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    UserCheck,
    ShieldAlert,
    Users,
    Zap,
    ChevronRight,
    Search,
    Phone,
    Mail,
    DollarSign,
    Clock,
    Target,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

export default function AdminLeadsPage() {
    const { data: session } = useSession();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'qualified' | 'rejected'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchLeads = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.set('status', filter);

            const res = await fetch(`/api/admin/leads?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setLeads(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (session) fetchLeads();
    }, [session, fetchLeads]);

    const handleQualify = async (leadId: string, action: 'qualify' | 'reject') => {
        setProcessing(leadId);
        try {
            const res = await fetch(`/api/admin/leads/${leadId}/qualify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            const result = await res.json();
            if (result.success) {
                await fetchLeads();
            } else {
                alert(result.message || 'Action failed');
            }
        } catch (error) {
            console.error('Error qualifying lead:', error);
            alert('An error occurred');
        } finally {
            setProcessing(null);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.project_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.client_email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_approval':
                return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending Review</span>;
            case 'qualified':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Qualified</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Rejected</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Lead <span className="text-indigo-600">Qualification</span></h1>
                    </div>
                    <p className="text-gray-500 font-medium italic">Review and approve leads before they enter the commissioner pool.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-100 pb-2">
                {['pending', 'qualified', 'rejected', 'all'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab as any)}
                        className={`px-6 py-3 rounded-t-2xl font-bold text-sm uppercase tracking-wider transition-all ${filter === tab
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        {tab === 'pending' ? 'Pending Review' : tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="p-8 h-64 animate-pulse bg-gray-50 border-none shadow-xl" />
                    ))}
                </div>
            ) : filteredLeads.length === 0 ? (
                <Card className="p-24 text-center border-none shadow-2xl shadow-indigo-500/5 bg-white rounded-[2rem]">
                    <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">All Clear</h3>
                    <p className="text-gray-400 font-medium mt-2">No {filter !== 'all' ? filter : ''} leads found.</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredLeads.map((lead) => (
                        <Card key={lead.id} className="p-8 border-none shadow-2xl shadow-indigo-500/5 hover:scale-[1.02] transition-all bg-white rounded-3xl group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-2xl text-indigo-600 border-2 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {lead.client_name?.[0] || 'L'}
                                </div>
                                {getStatusBadge(lead.status)}
                            </div>

                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">{lead.client_name}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                            </div>

                            <p className="text-sm text-gray-600 font-medium mb-4 line-clamp-2 min-h-[40px]">
                                {lead.project_summary}
                            </p>

                            <div className="space-y-3 mb-6">
                                {lead.client_email && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{lead.client_email}</span>
                                    </div>
                                )}
                                {lead.client_phone && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone className="w-3 h-3" />
                                        <span>{lead.client_phone}</span>
                                    </div>
                                )}
                                {lead.budget && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <DollarSign className="w-3 h-3" />
                                        <span className="font-bold text-gray-900">KES {Number(lead.budget).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {lead.status === 'pending_approval' && (
                                <div className="space-y-3 pt-6 border-t border-gray-50">
                                    <button
                                        onClick={() => handleQualify(lead.id, 'qualify')}
                                        disabled={processing === lead.id}
                                        className="w-full py-3 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processing === lead.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Approve Lead
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleQualify(lead.id, 'reject')}
                                        disabled={processing === lead.id}
                                        className="w-full py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject Lead
                                    </button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
