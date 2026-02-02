'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface RealtimeContextType {
    supabase: SupabaseClient;
    connectionStatus: ConnectionStatus;
    subscribe: (channelName: string, config: SubscriptionConfig) => RealtimeChannel;
    unsubscribe: (channel: RealtimeChannel) => void;
}

interface SubscriptionConfig {
    table: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
    filter?: string;
    callback: (payload: any) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createClient());
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map());

    useEffect(() => {
        // Monitor connection status
        const handleOnline = () => setConnectionStatus('connected');
        const handleOffline = () => setConnectionStatus('disconnected');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Set initial status
        setConnectionStatus(navigator.onLine ? 'connected' : 'disconnected');

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);

            // Cleanup all channels on unmount
            channels.forEach(channel => {
                supabase.removeChannel(channel);
            });
        };
    }, []);

    const subscribe = useCallback((channelName: string, config: SubscriptionConfig) => {
        // Create unique channel name
        const uniqueChannelName = `${channelName}_${Date.now()}`;

        const channel = supabase
            .channel(uniqueChannelName)
            .on(
                'postgres_changes',
                {
                    event: config.event || '*',
                    schema: config.schema || 'public',
                    table: config.table,
                    filter: config.filter,
                },
                (payload) => {
                    console.log(`[Realtime] Event received on ${config.table}:`, payload);
                    config.callback(payload);
                }
            )
            .subscribe((status) => {
                console.log(`[Realtime] Subscription status for ${uniqueChannelName}:`, status);
                if (status === 'SUBSCRIBED') {
                    setConnectionStatus('connected');
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setConnectionStatus('disconnected');
                }
            });

        setChannels(prev => new Map(prev).set(uniqueChannelName, channel));
        return channel;
    }, [supabase]);

    const unsubscribe = useCallback((channel: RealtimeChannel) => {
        supabase.removeChannel(channel);
        setChannels(prev => {
            const newMap = new Map(prev);
            // Find and remove the channel
            for (const [key, value] of newMap.entries()) {
                if (value === channel) {
                    newMap.delete(key);
                    break;
                }
            }
            return newMap;
        });
    }, [supabase]);

    return (
        <RealtimeContext.Provider value={{ supabase, connectionStatus, subscribe, unsubscribe }}>
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtimeContext() {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error('useRealtimeContext must be used within RealtimeProvider');
    }
    return context;
}
