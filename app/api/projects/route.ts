// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, supabaseAdmin } from '@/lib/db';

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

        let projects = [];

        if (role === 'client') {
            const { data: client } = await supabaseAdmin
                .from('clients')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (client) {
                projects = await db.getProjectsByClient(client.id);
            }
        } else if (role === 'developer') {
            const { data: developer } = await supabaseAdmin
                .from('developers')
                .select('id')
                .eq('user_id', userId)
                .single();
            if (developer) {
                projects = await db.getProjectsByDeveloper(developer.id);
            }
        } else if (role === 'admin') {
            const { data: allProjects } = await supabaseAdmin
                .from('projects')
                .select('*, milestones:project_milestones(*)')
                .order('created_at', { ascending: false });
            projects = allProjects || [];
        } else if (role === 'commissioner') {
            const { data: commissioner } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (commissioner) {
                const { data: commProjects } = await supabaseAdmin
                    .from('projects')
                    .select('*')
                    .eq('commissioner_id', commissioner.id)
                    .order('created_at', { ascending: false });
                projects = commProjects || [];
            }
        }

        return NextResponse.json({ success: true, data: projects });
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            projectType,
            title,
            description,
            budget,
            timeline,
            skills,
            commissionerId,
        } = body;

        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;

        // Get or create client record
        let client;

        if (userRole === 'commissioner' && body.clientId) {
            // If commissioner is creating project, use provided clientId
            // First verify the client exists
            const { data: targetClient } = await supabaseAdmin
                .from('clients')
                .select('id')
                .eq('id', body.clientId)
                .single();

            if (!targetClient) {
                return NextResponse.json({ error: 'Selected client not found.' }, { status: 404 });
            }
            client = targetClient;
        } else {
            // If client is creating project, resolve from session
            const { data: myClient } = await supabaseAdmin
                .from('clients')
                .select('id')
                .eq('user_id', userId)
                .single();

            // If client doesn't exist and user is a client, create one
            if (!myClient && userRole === 'client') {
                const { data: newClient, error: clientError } = await supabaseAdmin
                    .from('clients')
                    .insert({
                        user_id: userId,
                        contact_person: (session.user as any).name || 'Unknown'
                    })
                    .select()
                    .single();

                if (clientError) {
                    console.error('Error creating client record:', clientError);
                    return NextResponse.json({ error: 'Failed to create client profile' }, { status: 500 });
                }
                client = newClient;
            } else {
                client = myClient;
            }
        }

        if (!client) {
            return NextResponse.json({ error: 'Client profile not found. Please contact support.' }, { status: 400 });
        }

        // Validate required fields
        if (!title || !description) {
            return NextResponse.json({ error: 'Project title and description are required' }, { status: 400 });
        }

        // Sanitize UUIDs
        const finalCommissionerId = (projectType === 'direct' && commissionerId && commissionerId.trim() !== '') ? commissionerId : null;
        const finalLeadId = (body.leadId && body.leadId.trim() !== '') ? body.leadId : null;

        // Create project
        const { data: project, error } = await supabaseAdmin
            .from('projects')
            .insert({
                client_id: client.id,
                commissioner_id: finalCommissionerId,
                lead_id: finalLeadId,
                title,
                description,
                total_value: budget || 0,
                timeline,
                skills: skills || [],
                status: projectType === 'direct' ? 'active' : 'lead',
                project_type: projectType || 'open',
                category: body.category || 'general',
                currency: 'KES'
            })
            .select()
            .single();

        if (error) {
            console.error('Database error creating project:', error);
            throw error;
        }

        // If it was from a lead, mark the lead as converted
        if (body.leadId) {
            await supabaseAdmin
                .from('leads')
                .update({ status: 'converted', updated_at: new Date().toISOString() })
                .eq('id', body.leadId);
        }

        return NextResponse.json({
            success: true,
            data: project,
            message: 'Project created successfully'
        });
    } catch (error: any) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create project', details: error.hint || '' },
            { status: 500 }
        );
    }
}
