'use client';

import { useEffect, useRef } from 'react';
import { useRealtimeContext } from '@/contexts/RealtimeProvider';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
    table: string;
    event?: RealtimeEvent;
    filter?: string;
    schema?: string;
    enabled?: boolean;
}

/**
 * Custom hook for subscribing to real-time database changes
 * 
 * @example
 * // Listen to all new leads
 * useRealtime({
 *   table: 'leads',
 *   event: 'INSERT'
 * }, (payload) => {
 *   console.log('New lead:', payload.new);
 *   setLeads(prev => [...prev, payload.new]);
 * });
 * 
 * @example
 * // Listen to project updates for a specific project
 * useRealtime({
 *   table: 'projects',
 *   event: 'UPDATE',
 *   filter: `id=eq.${projectId}`
 * }, (payload) => {
 *   setProject(payload.new);
 * });
 */
export function useRealtime(
    options: UseRealtimeOptions,
    callback: (payload: any) => void
) {
    const { subscribe, unsubscribe } = useRealtimeContext();
    const channelRef = useRef<RealtimeChannel | null>(null);
    const { table, event = '*', filter, schema = 'public', enabled = true } = options;

    useEffect(() => {
        if (!enabled) return;

        // Subscribe to changes
        const channel = subscribe(`${table}_${event}`, {
            table,
            event,
            schema,
            filter,
            callback,
        });

        channelRef.current = channel;

        // Cleanup on unmount or dependency change
        return () => {
            if (channelRef.current) {
                unsubscribe(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [table, event, filter, schema, enabled, callback, subscribe, unsubscribe]);
}

/**
 * Hook for subscribing to multiple table changes at once
 * Useful for dashboard pages that need to listen to multiple entities
 */
export function useRealtimeMultiple(
    subscriptions: Array<UseRealtimeOptions & { callback: (payload: any) => void }>
) {
    const { subscribe, unsubscribe } = useRealtimeContext();
    const channelsRef = useRef<RealtimeChannel[]>([]);

    useEffect(() => {
        // Subscribe to all
        const channels = subscriptions.map((sub) =>
            subscribe(`${sub.table}_${sub.event || '*'}`, {
                table: sub.table,
                event: sub.event || '*',
                schema: sub.schema || 'public',
                filter: sub.filter,
                callback: sub.callback,
            })
        );

        channelsRef.current = channels;

        // Cleanup
        return () => {
            channelsRef.current.forEach((channel) => unsubscribe(channel));
            channelsRef.current = [];
        };
    }, [JSON.stringify(subscriptions), subscribe, unsubscribe]);
}

/**
 * Hook to get current connection status
 */
export function useConnectionStatus() {
    const { connectionStatus } = useRealtimeContext();
    return connectionStatus;
}
