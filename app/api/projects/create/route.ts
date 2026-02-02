import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, total_value, category, deadline, client_email, creator_role } = await req.json();

        // 1. Resolve Lead/Client
        let clientId: string | null = null;
        const targetEmail = client_email || session.user?.email;

        // Find or create client record
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, role')
            .eq('email', targetEmail)
            .single();

        if (userError || !userData) {
            // If creator is not client, we might need to create a invitation flow
            // For now, let's assume the user must exist if it's not the creator themselves
            if (creator_role === 'client') {
                return NextResponse.json({ success: false, message: 'Current user not found in database' }, { status: 400 });
            } else {
                return NextResponse.json({ success: false, message: `No user found with email ${targetEmail}` }, { status: 400 });
            }
        }

        // Get Client ID
        const { data: clientData, error: clientError } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('user_id', userData.id)
            .single();

        if (clientError || !clientData) {
            // Need to create client record if it doesn't exist (e.g. first time user)
            const { data: newClient, error: createClientError } = await supabaseAdmin
                .from('clients')
                .insert({ user_id: userData.id, company_name: 'Independent' })
                .select()
                .single();

            if (createClientError) throw createClientError;
            clientId = newClient.id;
        } else {
            clientId = clientData.id;
        }

        // 2. Resolve Creator ID (Commissioners/Developers)
        let commissionerId: string | null = null;
        let developerId: string | null = null;

        if (creator_role === 'commissioner') {
            const { data: comm } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', (session.user as any).id)
                .single();
            commissionerId = comm?.id || null;
        } else if (creator_role === 'developer') {
            const { data: dev } = await supabaseAdmin
                .from('developers')
                .select('id')
                .eq('user_id', (session.user as any).id)
                .single();
            developerId = dev?.id || null;
        }

        // 3. Create Project
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .insert({
                title,
                description,
                total_value,
                category,
                client_id: clientId,
                commissioner_id: commissionerId,
                developer_id: developerId,
                status: creator_role === 'client' ? 'lead' : 'proposed',
                project_type: creator_role === 'client' ? 'open' : (commissionerId ? 'direct' : 'open')
            })
            .select()
            .single();

        if (projectError) throw projectError;

        return NextResponse.json({ success: true, data: project });

    } catch (error: any) {
        console.error('Project creation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
