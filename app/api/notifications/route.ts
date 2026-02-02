export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = await db.getNotifications(session.user.id);
        return NextResponse.json({ success: true, notifications });

    } catch (error: any) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, action } = await req.json();

        if (action === 'mark_read') {
            if (id === 'all') {
                await supabaseAdmin!
                    .from('notifications')
                    .update({ read_at: new Date() })
                    .eq('user_id', session.user.id)
                    .is('read_at', null); // Only unread
            } else {
                await supabaseAdmin!
                    .from('notifications')
                    .update({ read_at: new Date() })
                    .eq('id', id)
                    .eq('user_id', session.user.id);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Update notification error:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
