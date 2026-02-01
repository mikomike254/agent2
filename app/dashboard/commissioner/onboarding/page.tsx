'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Users,
    UserPlus,
    Copy,
    ExternalLink,
    MoreVertical,
    CheckCircle2,
    Clock,
    Send,
    Loader2,
    Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CommissionerOnboardingPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        scope: ''
    });
    const [sendingProposal, setSendingProposal] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/commissioner/onboarding');
            const data = await res.json();
            if (data.success) {
                setSessions(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/commissioner/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_name: newClient.name,
                    client_email: newClient.email,
                    client_phone: newClient.phone,
                    project_scope: newClient.scope
                })
            });
            const data = await res.json();
            if (data.success) {
                setSessions([data.data, ...sessions]);
                setShowModal(false);
                setNewClient({ name: '', email: '', phone: '', scope: '' });
            }
        } catch (err) {
            console.error('Failed to create session', err);
        }
    };

    const copyLink = (id: string) => {
        const url = `${window.location.origin}/onboard/${id}`;
        navigator.clipboard.writeText(url);
        alert('Onboarding link copied to clipboard!');
    };

    const handleSendProposal = async (session: any) => {
        if (!confirm(`Send project proposal for ${session.client_name} to Admin?`)) return;

        setSendingProposal(session.id);
        try {
            const res = await fetch('/api/commissioner/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.id,
                    client_name: session.client_name,
                    client_email: session.client_email,
                    client_phone: session.client_phone,
                    project_title: `${session.client_name} - ${session.project_scope?.substring(0, 30) || 'New Project'}`,
                    project_description: session.project_scope,
                    budget: 0 // Will be set by Admin during approval or negotiated
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Proposal sent to Admin dashboard!');
                fetchSessions();
            } else {
                alert('Failed to send proposal: ' + data.error);
            }
        } catch (err) {
            console.error('Error sending proposal:', err);
        } finally {
            setSendingProposal(null);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Client Onboarding</h1>
                    <p className="text-gray-500 mt-1">Manage your clients' onboarding process and track their progress.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Onboard New Client
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-sm bg-indigo-50/50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Sessions</p>
                        <p className="text-2xl font-black text-gray-900">{sessions.length}</p>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm bg-green-50/50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed</p>
                        <p className="text-2xl font-black text-gray-900">{sessions.filter(s => s.status === 'completed' || s.status === 'converted').length}</p>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-sm bg-orange-50/50 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Action</p>
                        <p className="text-2xl font-black text-gray-900">{sessions.filter(s => s.status === 'pending').length}</p>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden border-none shadow-xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Onboarding Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Progress</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                                    </td>
                                </tr>
                            ) : sessions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No onboarding sessions yet. Start by adding a new client.</td>
                                </tr>
                            ) : (
                                sessions.map(session => (
                                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{session.client_name}</div>
                                            <div className="text-xs text-gray-500">{session.client_email || 'No email provided'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${session.status === 'completed' || session.status === 'converted' ? 'bg-green-100 text-green-700' :
                                                session.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-600 transition-all duration-500"
                                                        style={{ width: `${session.progress_percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-600">{session.progress_percent}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {session.status === 'completed' && (
                                                    <Button
                                                        size="sm"
                                                        disabled={sendingProposal === session.id}
                                                        onClick={() => handleSendProposal(session)}
                                                        className="h-8 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
                                                    >
                                                        {sendingProposal === session.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                                        ) : (
                                                            <Briefcase className="w-3.5 h-3.5 mr-1" />
                                                        )}
                                                        Send to Admin
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyLink(session.id)}
                                                    className="h-8 px-3 rounded-lg border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-100"
                                                >
                                                    <Copy className="w-3.5 h-3.5 mr-1" />
                                                    Link
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="h-8 px-3 rounded-lg border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-100"
                                                >
                                                    <a href={`/onboard/${session.id}`} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                                        Preview
                                                    </a>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-lg p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-gray-900">Onboard Client</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <CheckCircle2 className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSession} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Client Name *</label>
                                <input
                                    required
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                    placeholder="Full Name"
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Client Email</label>
                                    <input
                                        type="email"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                        placeholder="email@example.com"
                                        value={newClient.email}
                                        onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                                    <input
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                        placeholder="+254..."
                                        value={newClient.phone}
                                        onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Design Scope / Project Focus</label>
                                <textarea
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none min-h-[100px]"
                                    placeholder="Describe what the client needs..."
                                    value={newClient.scope}
                                    onChange={e => setNewClient({ ...newClient, scope: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 h-12 font-bold text-gray-600 rounded-xl">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100">
                                    Create Session
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
