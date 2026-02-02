import { supabaseAdmin } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let query = supabaseAdmin
            .from('developers')
            .select(`
                *,
                user:users(id, name, avatar_url, email)
            `);

        if (search) {
            query = query.or(`user.name.ilike.%${search}%,user.email.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: data || []
        });

    } catch (error: any) {
        console.error('Error fetching developers:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
