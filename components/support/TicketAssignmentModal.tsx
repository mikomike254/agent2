'use client';

import { useState, useEffect } from 'react';
import { X, Search, Shield, Check, Loader2, LifeBuoy } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TicketAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string;
    currentAssigneeId?: string;
    onSuccess: () => void;
}

export default function TicketAssignmentModal({
    isOpen,
    onClose,
    ticketId,
    currentAssigneeId,
    onSuccess
}: TicketAssignmentModalProps) {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchStaff();
        }
    }, [isOpen]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            // In a real app, this would be /api/admin/staff or similar
            // For now we'll fetch users with role admin/support if we had that API
            // Let's assume /api/users?role=staff works or we just get all managed users
            const res = await fetch('/api/profiles?role=admin'); // Mocking admin list
            const data = await res.json();
            if (data.success) {
                setStaff(data.data);
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
            const res = await fetch(`/api/support/tickets/${ticketId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: id })
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

    const filteredList = staff.filter(item => {
        const name = item.name || '';
        const email = item.email || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <Card className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                            <LifeBuoy className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Agent <span className="text-rose-600">Routing</span></h2>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Support Allocation Protocol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-rose-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search support agents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-8 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold text-gray-900 focus:ring-4 focus:ring-rose-500/10 transition-all"
                        />
                    </div>

                    <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="py-12 text-center space-y-4">
                                <Loader2 className="w-10 h-10 text-rose-600 animate-spin mx-auto" />
                            </div>
                        ) : filteredList.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No agents detected</div>
                        ) : (
                            filteredList.map((item) => {
                                const isCurrent = item.id === currentAssigneeId;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleAssign(item.id)}
                                        disabled={isUpdating || isCurrent}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${isCurrent ? 'bg-rose-50 border-rose-200' : 'bg-white border-gray-100 hover:border-rose-500'}`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-black">
                                                {item.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 text-sm">{item.name}</h4>
                                                <p className="text-[10px] font-bold text-gray-400">{item.email}</p>
                                            </div>
                                        </div>
                                        {isCurrent ? <Check className="w-5 h-5 text-rose-600" /> : <div className="p-2 opacity-0 group-hover:opacity-100"><Shield className="w-4 h-4 text-rose-600" /></div>}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {isUpdating && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-4">
                        <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
                    </div>
                )}
            </Card>
        </div>
    );
}
