
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, Mail, Clock, DollarSign, UserCheck, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRealtime } from '@/hooks/useRealtime';

interface Lead {
    id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    project_summary: string;
    budget: string;
    status: 'created' | 'active' | 'contacted' | 'converted' | 'closed' | 'claimed';
    created_at: string;
    commissioner_id: string | null;
    claimed_by: string | null;
    commissioner?: {
        user?: {
            name: string;
            avatar_url: string;
            email: string;
        };
    };
}

export default function LeadsPage() {
    const { data: session } = useSession();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'mine' | 'pool'>('all');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await fetch('/api/leads');
            const result = await response.json();
            if (result.success) {
                setLeads(result.data);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    // Real-time updates
    const refreshLeads = useCallback(() => {
        fetchLeads();
    }, []);

    useRealtime(
        { table: 'leads', event: '*', enabled: true },
        refreshLeads
    );

    const handleClaim = async (leadId: string) => {
        try {
            const response = await fetch('/api/leads/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
            });

            const result = await response.json();
            if (result.success) {
                alert('Lead claimed successfully!');
                fetchLeads(); // Refresh
            } else {
                alert(result.message || 'Failed to claim lead');
            }
        } catch (error) {
            console.error('Error claiming lead:', error);
            alert('An error occurred');
        }
    };

    // Filter logic
    const userEmail = session?.user?.email;

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.project_summary?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        const ownerEmail = lead.commissioner?.user?.email;
        const isClaimed = !!lead.claimed_by || !!lead.commissioner_id;

        if (filter === 'pool') return !isClaimed;
        if (filter === 'mine') {
            // Include if explicitly claimed by me (if we had ID) OR matches email OR is assigned to me
            return isClaimed && (ownerEmail === userEmail || !ownerEmail);
        }

        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'created': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">New</Badge>;
            case 'active': return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>;
            case 'contacted': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Contacted</Badge>;
            case 'converted': return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Converted</Badge>;
            case 'closed': return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Closed</Badge>;
            case 'claimed': return <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">Claimed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Lead Management</h1>
                    <p className="text-[var(--text-secondary)]">Track and convert potential clients.</p>
                </div>
                {/* Search & Filter */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                        <Input
                            placeholder="Search leads..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--bg-input)]">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('mine')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'mine' ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            My Leads
                        </button>
                        <button
                            onClick={() => setFilter('pool')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'pool' ? 'bg-white shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            Pool
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-[var(--bg-secondary)] rounded-xl"></div>
                    ))}
                </div>
            ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12 bg-[var(--bg-card)] rounded-xl border border-[var(--bg-input)]">
                    <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCheck className="w-8 h-8 text-[var(--text-secondary)]" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">No leads found</h3>
                    <p className="text-[var(--text-secondary)]">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.map((lead) => {
                        const isClaimed = !!lead.claimed_by || !!lead.commissioner_id;
                        return (
                            <Card key={lead.id} className="group hover:shadow-lg transition-all border-[var(--bg-input)] bg-[var(--bg-card)] overflow-hidden">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {lead.client_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[var(--text-primary)] line-clamp-1">{lead.client_name}</h3>
                                                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(lead.status)}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm text-[var(--text-primary)] line-clamp-2 min-h-[40px]">
                                            {lead.project_summary}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                            <DollarSign className="w-3 h-3" />
                                            Budget: <span className="font-medium text-[var(--text-primary)]">KES {Number(lead.budget).toLocaleString() || 'Negotiable'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[var(--bg-input)] flex justify-between items-center">
                                        <div className="flex gap-2">
                                            {lead.client_email && (
                                                <a href={`mailto:${lead.client_email}`} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)] transition-colors">
                                                    <Mail className="w-4 h-4" />
                                                </a>
                                            )}
                                            {lead.client_phone && (
                                                <a href={`tel:${lead.client_phone}`} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)] transition-colors">
                                                    <Phone className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>

                                        {!isClaimed ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleClaim(lead.id)}
                                                className="bg-[var(--primary)] text-white hover:opacity-90"
                                            >
                                                Claim Lead
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                <CheckCircle className="w-3 h-3" />
                                                {lead.status === 'claimed' ? 'Claimed' : 'Assigned'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
