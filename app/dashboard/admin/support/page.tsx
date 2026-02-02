'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    MessageSquare,
    Send,
    AlertTriangle,
    ShieldCheck,
    Bell,
    Users,
    Clock,
    Search,
    LifeBuoy,
    Megaphone,
    Zap,
    Scale,
    MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import TicketList from '@/components/support/TicketList';

export default function AdminSupportPage() {
    const { data: session } = useSession();
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState('info');
    const [targetRole, setTargetRole] = useState('all');
    const [isSending, setIsSending] = useState(false);
    const [stats, setStats] = useState({ openTickets: 0, pendingDisputes: 0 });

    const fetchStats = useCallback(async () => {
        // Mock stats or fetch from API
        setStats({ openTickets: 12, pendingDisputes: 3 });
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: broadcastMessage,
                    type: broadcastType,
                    targetRole: targetRole,
                    priority: 'high'
                })
            });
            const result = await res.json();
            if (result.success) {
                alert('Broadcast transmitted!');
                setBroadcastMessage('');
            } else {
                alert(result.error || 'Broadcast failed');
            }
        } catch (error) {
            console.error('Broadcast error:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <LifeBuoy className="w-8 h-8 text-rose-600" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Support <span className="text-rose-600">Command</span></h1>
                    </div>
                    <p className="text-gray-500 font-medium italic">High-frequency communication and dispute arbitration center.</p>
                </div>

                <div className="flex gap-4">
                    <Card className="px-6 py-4 bg-rose-50 border-rose-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Active Requests</p>
                            <p className="text-xl font-black text-rose-700">{stats.openTickets}</p>
                        </div>
                    </Card>
                    <Card className="px-6 py-4 bg-orange-50 border-orange-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Scale className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Open Disputes</p>
                            <p className="text-xl font-black text-orange-700">{stats.pendingDisputes}</p>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Support Tickets */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-rose-500/5">
                        <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
                            <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                <Zap className="w-5 h-5 text-rose-600" />
                                High-Priority Queue
                            </h3>
                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <Search className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-4">
                            <TicketList role="admin" />
                        </div>
                    </Card>
                </div>

                {/* Right: Broadcast & Tools */}
                <div className="space-y-8">
                    <Card className="p-8 border-none shadow-2xl shadow-indigo-500/5 bg-indigo-950 text-white relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

                        <div className="flex items-center gap-3 mb-8">
                            <Megaphone className="w-6 h-6 text-indigo-400" />
                            <h3 className="text-xl font-black uppercase tracking-tighter">Nexus Broadcast</h3>
                        </div>

                        <form onSubmit={handleBroadcast} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 opacity-60">Transmission Layer</label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full px-4 py-3 bg-indigo-900/50 border border-indigo-700 rounded-2xl outline-none font-bold text-sm focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">UNIVERSAL BROADCAST</option>
                                    <option value="commissioner">COMMISSIONERS ONLY</option>
                                    <option value="developer">DEVELOPERS ONLY</option>
                                    <option value="client">CLIENTS ONLY</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 opacity-60">Signal Payload</label>
                                <textarea
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-4 bg-indigo-900/50 border border-indigo-700 rounded-2xl outline-none font-medium text-sm focus:border-indigo-400 transition-all resize-none"
                                    placeholder="Enter system announcement..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 opacity-60">Iconography</label>
                                    <select
                                        value={broadcastType}
                                        onChange={(e) => setBroadcastType(e.target.value)}
                                        className="w-full px-4 py-3 bg-indigo-900/50 border border-indigo-700 rounded-2xl outline-none font-bold text-xs"
                                    >
                                        <option value="info">INFO</option>
                                        <option value="alert">ALERT</option>
                                        <option value="success">UPDATE</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="flex-[2] bg-indigo-500 hover:bg-indigo-400 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20"
                                >
                                    {isSending ? 'Transmitting...' : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Fire Signal
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </Card>

                    <Card className="p-8 border-none shadow-xl bg-white space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            <h3 className="text-lg font-black uppercase tracking-tighter">System Integrity</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-700">Push Notifications</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase">Online</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-700">Live Socket Relay</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase">Active</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-gray-400">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-bold">Maintenance Mode</span>
                                </div>
                                <span className="text-[10px] font-black uppercase">Disabled</span>
                            </div>
                        </div>

                        <button className="w-full py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 hover:text-gray-900 transition-all">
                            Audit System Logs
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
