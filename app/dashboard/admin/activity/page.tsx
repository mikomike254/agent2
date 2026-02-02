'use client';

import { useState, useEffect } from 'react';
import {
    Activity,
    User,
    Clock,
    Filter,
    Search,
    UserPlus,
    Cpu,
    AlertTriangle,
    CreditCard,
    FileText,
    ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityFeedPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ role: '', action: '' });

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const params = new URLSearchParams();
                if (filter.role) params.set('role', filter.role);
                if (filter.action) params.set('action', filter.action);

                const res = await fetch(`/api/admin/activity?${params.toString()}`);
                const data = await res.json();
                if (data.activities) setActivities(data.activities);
            } catch (err) {
                console.error('Failed to load activities');
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
        const interval = setInterval(fetchActivities, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, [filter]);

    const getActionIcon = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('signup') || a.includes('login')) return <UserPlus className="w-4 h-4 text-emerald-400" />;
        if (a.includes('payment') || a.includes('escrow')) return <CreditCard className="w-4 h-4 text-blue-400" />;
        if (a.includes('project')) return <Cpu className="w-4 h-4 text-purple-400" />;
        if (a.includes('dispute') || a.includes('error')) return <AlertTriangle className="w-4 h-4 text-rose-400" />;
        return <Activity className="w-4 h-4 text-slate-400" />;
    };

    const getRoleBadge = (role: string) => {
        const colors: any = {
            admin: 'bg-red-500/10 text-red-400 border-red-500/20',
            commissioner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            developer: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            client: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${colors[role?.toLowerCase()] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                {role || 'System'}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.03] border border-white/[0.05] p-6 rounded-2xl backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Nexus Activity Feed
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Live platform-wide event monitoring
                    </p>
                </div>

                <div className="flex gap-2">
                    <select
                        value={filter.role}
                        onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="commissioner">Commissioner</option>
                        <option value="developer">Developer</option>
                        <option value="client">Client</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter actions..."
                            value={filter.action}
                            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                            className="bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Feed Section */}
            <div className="bg-black/20 border border-white/[0.05] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2 px-2">Event & Actor</div>
                    <div className="hidden md:block">Entity Information</div>
                    <div className="mr-4">Timestamp</div>
                </div>

                <div className="divide-y divide-white/[0.03]">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            Synchronizing with Nexus...
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No matching activities found in the Nexus logs.
                        </div>
                    ) : (
                        activities.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-white/[0.02] flex items-center justify-between transition-colors group">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white truncate max-w-[150px] md:max-w-none">
                                                {log.action}
                                            </span>
                                            {getRoleBadge(log.actor_role)}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                            <User className="w-3 h-3" />
                                            {log.actor_email || 'System Operation'}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:flex flex-1 items-center gap-3 text-slate-300">
                                    {log.entity_type && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/5 rounded-lg text-xs">
                                            <span className="text-slate-500 capitalize">{log.entity_type}:</span>
                                            <span className="font-mono text-[10px] text-emerald-400/80">{log.entity_id?.split('-')[0]}...</span>
                                            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-emerald-500 transition-colors cursor-pointer" />
                                        </div>
                                    )}
                                </div>

                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className="text-sm font-medium text-slate-200">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        {new Date(log.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Platform Health Quick Glance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-emerald-400' },
                    { label: 'Active Sessions', value: 'Live', icon: User, color: 'text-blue-400' },
                    { label: 'Global Load', value: 'Normal', icon: Cpu, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-black/40 border border-white/[0.05] flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-black/40 border border-white/5 ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
