import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, db } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ success: false, message: 'Supabase Admin not initialized' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { action } = await req.json();
        const { id: leadId } = await params;

        if (!action || !['qualify', 'reject'].includes(action)) {
            return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
        }

        const newStatus = action === 'qualify' ? 'qualified' : 'rejected';

        const { data: lead, error } = await supabaseAdmin
            .from('leads')
            .update({ status: newStatus, qualified_at: new Date().toISOString() })
            .eq('id', leadId)
            .select()
            .single();

        if (error) throw error;

        // Audit log
        await db.createAuditLog(
            (session.user as any).id,
            'admin',
            `lead_${action}`,
            { lead_id: leadId, client_name: lead.client_name }
        );

        return NextResponse.json({
            success: true,
            message: `Lead ${action === 'qualify' ? 'qualified' : 'rejected'} successfully`,
            data: lead
        });
    } catch (error: any) {
        console.error('API Error:', error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
