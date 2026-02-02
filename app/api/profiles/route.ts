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
        if (!session?.user || !['admin', 'support'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let query = supabaseAdmin
            .from('users')
            .select('id, name, email, role, avatar_url');

        if (role) {
            query = query.eq('role', role);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: data || []
        });

    } catch (error: any) {
        console.error('Error fetching profiles:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
