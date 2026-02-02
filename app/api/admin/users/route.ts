export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, message: 'Supabase Admin not initialized' }, { status: 500 });
    }
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const verified = searchParams.get('verified');

        let query = supabaseAdmin
            .from('users')
            .select('*');

        if (role) query = query.eq('role', role);
        if (verified) query = query.eq('verified', verified === 'true');

        const { data: users, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
