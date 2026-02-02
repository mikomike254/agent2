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
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('leads')
            .select(`
                *,
                commissioner:commissioners (
                    id,
                    user:users (
                        name,
                        email,
                        avatar_url
                    )
                )
            `);

        if (status && status !== 'all') {
            if (status === 'pending') {
                query = query.eq('status', 'pending_approval');
            } else {
                query = query.eq('status', status);
            }
        }

        const { data: leads, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: leads });
    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
