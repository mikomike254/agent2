'use client';

import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useRealtime';

export function ConnectionStatus() {
    const status = useConnectionStatus();

    if (status === 'connected') {
        return (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50/50 px-3 py-1.5 rounded-full border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Live
            </div>
        );
    }

    if (status === 'reconnecting' || status === 'disconnected') {
        return (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50/50 px-3 py-1.5 rounded-full border border-amber-100">
                <Loader2 className="w-3 h-3 animate-spin" />
                Syncing
            </div>
        );
    }
}
