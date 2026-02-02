import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId } = await params;
        const body = await req.json();
        const { action, value } = body;

        let updateData: any = {};
        let logMessage = '';

        switch (action) {
            case 'set_status':
                updateData = { status: value };
                logMessage = `Status forced to ${value}`;
                break;
            case 'set_developer':
                updateData = { developer_id: value || null };
                logMessage = value ? `Developer assigned: ${value}` : 'Developer unassigned';
                break;
            case 'set_commissioner':
                updateData = { commissioner_id: value || null };
                logMessage = value ? `Commissioner assigned: ${value}` : 'Commissioner unassigned';
                break;
            case 'update_progress':
                updateData = { progress: Number(value) };
                logMessage = `Progress updated to ${value}%`;
                break;
            case 'force_delete':
                const { error: deleteError } = await supabaseAdmin
                    .from('projects')
                    .delete()
                    .eq('id', projectId);
                if (deleteError) throw deleteError;
                return NextResponse.json({ success: true, message: 'Project purged from existence' });
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('projects')
            .update(updateData)
            .eq('id', projectId)
            .select()
            .maybeSingle();

        if (error) throw error;

        // Log the action (if we had an admin logs table)
        console.log(`[ADMIN ACTION] Project ${projectId}: ${logMessage} by ${(session.user as any).email}`);

        return NextResponse.json({
            success: true,
            data,
            message: `Project updated: ${logMessage}`
        });

    } catch (error: any) {
        console.error('Project action error:', error);
        return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
    }
}
