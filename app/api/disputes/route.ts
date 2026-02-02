import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, db } from '@/lib/db';

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, message: 'Supabase Admin not initialized' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { project_id, reason, description } = body;
        const user = session.user as any;

        if (!project_id || !reason || !description) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const { data: dispute, error } = await supabaseAdmin
            .from('disputes')
            .insert({
                project_id,
                raised_by: user.id,
                raised_by_role: user.role,
                reason,
                description,
                status: 'open'
            })
            .select()
            .single();

        if (error) throw error;

        // Audit log
        await db.createAuditLog(
            user.id,
            user.role,
            'dispute_raised',
            { dispute_id: dispute.id, project_id, reason }
        );

        return NextResponse.json({
            success: true,
            message: 'Dispute raised successfully',
            data: dispute
        });
    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
