'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Loader2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NotificationMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter((n: any) => !n.read_at).length);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    // Poll for notifications
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markRead = async (id: string) => {
        // Optimistic update
        if (id === 'all') {
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
            setUnreadCount(0);
        } else {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        try {
            await fetch('/api/notifications', {
                method: 'POST',
                body: JSON.stringify({ id, action: 'mark_read' })
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white relative group"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-indigo-400 animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black shadow-[0_0_10px_rgba(239,68,68,0.6)]"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-[#0F0F12] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={() => markRead('all')} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                <span className="text-xs"> syncing...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-xs italic">
                                No new notifications. Peace and quiet.
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-4 hover:bg-white/[0.03] transition-colors relative group ${!n.read_at ? 'bg-indigo-500/5' : ''}`}
                                    onClick={() => !n.read_at && markRead(n.id)}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                            <p className={`text-sm ${!n.read_at ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                                                {n.body}
                                            </p>
                                            <p className="text-[10px] text-gray-600 mt-2 font-mono uppercase">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!n.read_at && (
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
