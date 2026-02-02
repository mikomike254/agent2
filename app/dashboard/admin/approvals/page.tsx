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
    Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import ApprovalActionButtons from '@/components/dashboard/admin/ApprovalActionButtons';

export default function AdminApprovalsPage() {
    const { data: session } = useSession();
    const [pendingCommissioners, setPendingCommissioners] = useState<any[]>([]);
    const [pendingDevelopers, setPendingDevelopers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/approvals'); // Assuming this exists or using direct supabase if client-side
            // Since this was an async server component before, I'll keep the structure but fetch via API
            // For now, I'll mock the fetch or assume an API exists. 
            // Wait, the previous file was an async server component. I'll stick to that or convert it properly.
            // Actually, I'll keep it as a client component for better UX with 'God Mode' buttons.

            const [commRes, devRes] = await Promise.all([
                fetch('/api/admin/users?role=commissioner&verified=false'),
                fetch('/api/admin/users?role=developer&verified=false')
            ]);

            const comms = await commRes.json();
            const devs = await devRes.json();

            setPendingCommissioners(comms.data || []);
            setPendingDevelopers(devs.data || []);
        } catch (error) {
            console.error('Error fetching approvals:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session) fetchData();
    }, [session, fetchData]);

    const hasPending = pendingCommissioners.length + pendingDevelopers.length > 0;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <UserCheck className="w-8 h-8 text-emerald-600" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Gatekeeper <span className="text-emerald-600">Nexus</span></h1>
                    </div>
                    <p className="text-gray-500 font-medium italic">Arbitrate access and verify entity credentials.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="p-8 h-64 animate-pulse bg-gray-50 border-none shadow-xl" />
                    ))}
                </div>
            ) : !hasPending ? (
                <Card className="p-24 text-center border-none shadow-2xl shadow-emerald-500/5 bg-white rounded-[2rem]">
                    <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Perimeter Secure</h3>
                    <p className="text-gray-400 font-medium mt-2">All pending entities have been processed.</p>
                </Card>
            ) : (
                <div className="space-y-12">
                    {/* Categories */}
                    {pendingCommissioners.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Commissioner Nodes</h2>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {pendingCommissioners.map((user: any) => (
                                    <Card key={user.id} className="p-8 border-none shadow-2xl shadow-purple-500/5 hover:scale-[1.02] transition-all bg-white rounded-3xl group">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center font-black text-2xl text-purple-600 border-2 border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                {user.name?.[0]}
                                            </div>
                                            <ShieldAlert className="w-5 h-5 text-purple-200 group-hover:text-purple-600 transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{user.name}</h3>
                                        <p className="text-sm text-gray-400 font-medium mb-6">{user.email}</p>

                                        <div className="space-y-4 pt-6 border-t border-gray-50">
                                            <ApprovalActionButtons
                                                id={user.id}
                                                type="commissioner"
                                                name={user.name}
                                                onSuccess={fetchData}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {pendingDevelopers.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Developer Nodes</h2>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {pendingDevelopers.map((user: any) => (
                                    <Card key={user.id} className="p-8 border-none shadow-2xl shadow-blue-500/5 hover:scale-[1.02] transition-all bg-white rounded-3xl group">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-2xl text-blue-600 border-2 border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {user.name?.[0]}
                                            </div>
                                            <Zap className="w-5 h-5 text-blue-200 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{user.name}</h3>
                                        <p className="text-sm text-gray-400 font-medium mb-6">{user.email}</p>

                                        <div className="space-y-4 pt-6 border-t border-gray-50">
                                            <ApprovalActionButtons
                                                id={user.id}
                                                type="developer"
                                                name={user.name}
                                                onSuccess={fetchData}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
