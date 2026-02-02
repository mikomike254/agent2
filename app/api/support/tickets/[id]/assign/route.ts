import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'support'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { assignedTo } = await req.json();

        const { data, error } = await supabaseAdmin
            .from('support_tickets')
            .update({
                assigned_to: assignedTo,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data,
            message: assignedTo ? 'Ticket assigned successfully' : 'Ticket unassigned'
        });

    } catch (error: any) {
        console.error('Ticket assignment error:', error);
        return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
    }
}
