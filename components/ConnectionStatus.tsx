'use client';

import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useRealtime';

export function ConnectionStatus() {
    const status = useConnectionStatus();

    if (status === 'connected') {
        return (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Live</span>
            </div>
        );
    }

    if (status === 'reconnecting') {
        return (
            <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Reconnecting...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <WifiOff className="w-3 h-3" />
            <span className="hidden sm:inline">Offline</span>
        </div>
    );
}
