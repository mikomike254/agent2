import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, action } = await req.json();

        if (action === 'start') {
            if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

            // Verify user exists
            const { data: user } = await supabaseAdmin!
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            // Set impersonation cookie
            // We use a prefix that matches what NextAuth might expect or just a custom one
            (await cookies()).set('nexus-impersonation-id', userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 // 1 hour
            });

            return NextResponse.json({ success: true, message: `Now impersonating ${user.name}` });
        } else if (action === 'stop') {
            (await cookies()).delete('nexus-impersonation-id');
            return NextResponse.json({ success: true, message: 'Stopped impersonating' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Impersonation error:', error);
        return NextResponse.json({ error: 'Failed to toggle impersonation' }, { status: 500 });
    }
}
