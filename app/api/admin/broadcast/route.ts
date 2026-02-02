import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { NotificationService } from '@/lib/notifications';

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

        // Fetch target users
        let query = supabaseAdmin.from('users').select('id');
        if (targetRole && targetRole !== 'all') {
            query = query.eq('role', targetRole);
        }
        const { data: users, error: fetchError } = await query;

        if (fetchError || !users) {
            return NextResponse.json({ error: 'Failed to fetch target audience' }, { status: 500 });
        }

        console.log(`[Transmission] Broadcasting to ${users.length} users (Role: ${targetRole || 'all'})`);

        // Use Transmission Layer
        // active fire-and-forget to avoid timeout on large lists, or batch
        const notifications = users.map(user =>
            NotificationService.send({
                userId: user.id,
                type: 'system',
                title: '📢 System Update', // Icon for visibility
                message: message,
                metadata: { priority, type, admin_id: (session.user as any).id }
            })
        );

        // We accept that some might fail silently via the service
        await Promise.all(notifications);

        return NextResponse.json({
            success: true,
            data: { count: users.length },
            message: `Broadcast transmitted to ${users.length} nodes successfully`
        });

    } catch (error: any) {
        console.error('Broadcast error:', error);
        return NextResponse.json({ error: error.message || 'Transmission failed' }, { status: 500 });
    }
}
