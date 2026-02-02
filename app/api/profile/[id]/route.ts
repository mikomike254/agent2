import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!supabaseAdmin) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

        // 1. Get User
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // 2. Get Role-Specific Data
        let roleData = null;
        if (user.role === 'commissioner') {
            const { data } = await supabaseAdmin
                .from('commissioners')
                .select('*')
                .eq('user_id', id)
                .single();
            roleData = data;
        } else if (user.role === 'developer') {
            const { data } = await supabaseAdmin
                .from('developers')
                .select('*')
                .eq('user_id', id)
                .single();
            roleData = data;
        } else if (user.role === 'client') {
            const { data } = await supabaseAdmin
                .from('clients')
                .select('*')
                .eq('user_id', id)
                .single();
            roleData = data;
        }

        return NextResponse.json({
            success: true,
            data: {
                ...user,
                roleData
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
