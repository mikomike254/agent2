// app/api/referrals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Fetch user basic info to check if they are a commissioner
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (user?.role !== 'commissioner') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch referred users (where referrer_id = userId)
        const { data: referrals, error } = await supabaseAdmin
            .from('users')
            .select('id, name, avatar_url, role, created_at')
            .eq('referrer_id', userId);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: referrals || []
        });
    } catch (error: any) {
        console.error('Error fetching referrals:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
