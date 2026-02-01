// app/api/commissioner/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

// GET: List all clients assigned to commissioner
export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        if (role !== 'commissioner' && role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get commissioner ID
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!commissioner && role !== 'admin') {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 400 });
        }

        // Get clients with onboarding status
        let query = supabaseAdmin
            .from('clients')
            .select(`
                *,
                user:users (id, name, email, phone, avatar_url, status),
                onboarding:client_onboarding (
                    id,
                    status,
                    progress_percent,
                    current_step,
                    total_steps,
                    created_at,
                    completed_at
                ),
                projects (
                    id,
                    title,
                    status,
                    total_value
                )
            `);

        if (role === 'commissioner') {
            query = query.eq('assigned_commissioner_id', commissioner.id);
        }

        const { data: clients, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data: clients || [] });

    } catch (error: any) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
