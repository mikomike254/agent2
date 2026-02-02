import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch top 5 developers by rating and projects completed
        const { data: developers, error } = await supabaseAdmin
            .from('developers')
            .select(`
                id,
                bio,
                specialization,
                rating,
                projects_completed,
                tier,
                user:users (
                    id,
                    name,
                    avatar_url
                )
            `)
            .order('rating', { ascending: false })
            .order('projects_completed', { ascending: false })
            .limit(5);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: developers || []
        });

    } catch (error: any) {
        console.error('Error fetching top developers:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
