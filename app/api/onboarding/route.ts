// app/api/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import crypto from 'crypto';

// GET: List all onboarding sessions (filtered by role)
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

        let onboardingSessions = [];

        if (role === 'commissioner') {
            // Get commissioner's ID
            const { data: commissioner } = await supabaseAdmin
                .from('commissioners')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (commissioner) {
                const { data, error } = await supabaseAdmin
                    .from('client_onboarding')
                    .select(`
                        *,
                        client:clients (
                            id,
                            user_id,
                            company_name,
                            contact_person,
                            phone,
                            user:users (name, email)
                        ),
                        commissioner:commissioners (
                            id,
                            user:users (name, email)
                        )
                    `)
                    .eq('commissioner_id', commissioner.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                onboardingSessions = data || [];
            }
        } else if (role === 'admin') {
            // Admin can see all
            const { data, error } = await supabaseAdmin
                .from('client_onboarding')
                .select(`
                    *,
                    client:clients (
                        id,
                        user_id,
                        company_name,
                        contact_person,
                        phone,
                        user:users (name, email)
                    ),
                    commissioner:commissioners (
                        id,
                        user:users (name, email)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            onboardingSessions = data || [];
        }

        return NextResponse.json({ success: true, data: onboardingSessions });
    } catch (error: any) {
        console.error('Error fetching onboarding sessions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create new onboarding session
export async function POST(req: NextRequest) {
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

        // Only commissioners can create onboarding sessions
        if (role !== 'commissioner' && role !== 'admin') {
            return NextResponse.json({ error: 'Only commissioners can create onboarding sessions' }, { status: 403 });
        }

        const body = await req.json();
        const {
            clientName,
            clientEmail,
            clientPhone,
            companyName,
            projectScope,
            budgetRange,
            timeline
        } = body;

        // Validation
        if (!clientName || !clientEmail) {
            return NextResponse.json({ error: 'Client name and email are required' }, { status: 400 });
        }

        // Get commissioner ID
        const { data: commissioner } = await supabaseAdmin
            .from('commissioners')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (!commissioner) {
            return NextResponse.json({ error: 'Commissioner profile not found' }, { status: 400 });
        }

        // Check if user already exists
        let clientUserId = null;
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', clientEmail)
            .single();

        if (existingUser) {
            clientUserId = existingUser.id;
        } else {
            // Create new user
            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert({
                    email: clientEmail,
                    name: clientName,
                    phone: clientPhone,
                    role: 'client',
                    verified: false,
                    status: 'pending'
                })
                .select()
                .single();

            if (userError) throw userError;
            clientUserId = newUser.id;
        }

        // Check if client profile exists
        let clientId = null;
        const { data: existingClient } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('user_id', clientUserId)
            .single();

        if (existingClient) {
            clientId = existingClient.id;
            // Update client info
            await supabaseAdmin
                .from('clients')
                .update({
                    company_name: companyName,
                    contact_person: clientName,
                    phone: clientPhone,
                    project_scope: projectScope,
                    budget_range: budgetRange,
                    timeline: timeline,
                    assigned_commissioner_id: commissioner.id
                })
                .eq('id', clientId);
        } else {
            // Create new client profile
            const { data: newClient, error: clientError } = await supabaseAdmin
                .from('clients')
                .insert({
                    user_id: clientUserId,
                    company_name: companyName,
                    contact_person: clientName,
                    phone: clientPhone,
                    project_scope: projectScope,
                    budget_range: budgetRange,
                    timeline: timeline,
                    assigned_commissioner_id: commissioner.id
                })
                .select()
                .single();

            if (clientError) throw clientError;
            clientId = newClient.id;
        }

        // Generate unique token
        const token = crypto.randomBytes(32).toString('hex');
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const onboardingLink = `${baseUrl}/onboard/link/${token}`;

        // Create onboarding session
        const { data: onboarding, error: onboardingError } = await supabaseAdmin
            .from('client_onboarding')
            .insert({
                client_id: clientId,
                commissioner_id: commissioner.id,
                onboarding_token: token,
                onboarding_link: onboardingLink,
                status: 'initiated',
                total_steps: 7
            })
            .select()
            .single();

        if (onboardingError) throw onboardingError;

        // Create initial onboarding steps
        const steps = [
            { step_number: 1, step_name: 'Welcome', description: 'Introduction and overview' },
            { step_number: 2, step_name: 'Client Information', description: 'Basic contact and company details' },
            { step_number: 3, step_name: 'Project Scope', description: 'Detailed project requirements' },
            { step_number: 4, step_name: 'Budget & Timeline', description: 'Financial and scheduling details' },
            { step_number: 5, step_name: 'Documents', description: 'Upload contracts and briefs' },
            { step_number: 6, step_name: 'Payment', description: 'Deposit payment (43%)' },
            { step_number: 7, step_name: 'Completion', description: 'Final steps and next actions' }
        ];

        const stepsToInsert = steps.map(step => ({
            ...step,
            onboarding_id: onboarding.id
        }));

        await supabaseAdmin
            .from('onboarding_steps')
            .insert(stepsToInsert);

        return NextResponse.json({
            success: true,
            data: {
                onboarding,
                onboardingLink
            }
        });

    } catch (error: any) {
        console.error('Error creating onboarding session:', error);
        return NextResponse.json({ error: error.message || 'Failed to create onboarding session' }, { status: 500 });
    }
}
