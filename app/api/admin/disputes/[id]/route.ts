import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const { data: dispute, error } = await supabaseAdmin!
            .from('disputes')
            .select(`
                *,
                project:projects(*),
                raised_by_user:users!disputes_raised_by_fkey(id, email, name, avatar_url)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Flatten data for UI
        const formatted = {
            ...dispute,
            project_title: dispute.project?.title,
            raised_by_name: dispute.raised_by_user?.name,
            raised_by_email: dispute.raised_by_user?.email
        };

        return NextResponse.json({ success: true, dispute: formatted });

    } catch (error: any) {
        console.error('Dispute fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch dispute' }, { status: 500 });
    }
}
