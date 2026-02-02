import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { message, type, targetRole, priority } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message content required' }, { status: 400 });
        }

        // Check if we have a notifications table, if not, we can use a 'system_broadcasts' table
        // For now, let's assume we use a 'notifications' table with target_role
        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                title: 'SYSTEM BROADCAST',
                body: message,
                type: type || 'broadcast',
                priority: priority || 'normal',
                target_role: targetRole || 'all',
                is_system: true,
                metadata: {
                    admin_id: (session.user as any).id,
                    timestamp: new Date().toISOString()
                }
            })
            .select()
            .single();

        if (error) {
            // If table doesn't exist, we'll try to create a simple log/broadcast entry
            console.error('Failed to insert broadcast into notifications table:', error);
            return NextResponse.json({ error: 'System notifications infrastructure not ready. Requesting DDL update.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data,
            message: 'Broadcast transmitted to Nexus nodes'
        });

    } catch (error: any) {
        console.error('Broadcast error:', error);
        return NextResponse.json({ error: error.message || 'Transmission failed' }, { status: 500 });
    }
}
