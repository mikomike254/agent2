// app/api/profiles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const { id } = params;

        // Fetch basic user data
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, name, avatar_url, role, created_at')
            .eq('id', id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        let detailedProfile = null;

        // Fetch related role data
        if (user.role === 'commissioner') {
            const { data } = await supabaseAdmin
                .from('commissioners')
                .select('*')
                .eq('user_id', user.id)
                .single();
            detailedProfile = data;
        } else if (user.role === 'developer') {
            const { data } = await supabaseAdmin
                .from('developers')
                .select('*')
                .eq('user_id', user.id)
                .single();
            detailedProfile = data;
        }

        return NextResponse.json({
            success: true,
            data: {
                ...user,
                profile: detailedProfile
            }
        });
    } catch (error: any) {
        console.error('Error fetching public profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
