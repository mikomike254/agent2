// app/api/meetings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        const { data: meetings, error } = await supabaseAdmin
            .from('meetings')
            .select('*')
            .or(`client_id.eq.${userId},commissioner_id.eq.${userId}`)
            .order('start_time', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data: meetings });
    } catch (error: any) {
        console.error('Error fetching meetings:', error);
        return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { projectId, commissionerId, clientId, title, description, startTime, endTime, meetingLink } = body;

        const { data: meeting, error } = await supabaseAdmin
            .from('meetings')
            .insert({
                project_id: projectId,
                commissioner_id: commissionerId,
                client_id: clientId,
                title,
                description,
                start_time: startTime,
                end_time: endTime,
                meeting_link: meetingLink,
                status: 'scheduled'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: meeting });
    } catch (error: any) {
        console.error('Error creating meeting:', error);
        return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, status } = body;

        const { data: meeting, error } = await supabaseAdmin
            .from('meetings')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data: meeting });
    } catch (error: any) {
        console.error('Error updating meeting:', error);
        return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
    }
}
