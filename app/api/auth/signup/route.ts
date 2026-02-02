// Signup API Route
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail } from '@/lib/emailjs';

export async function POST(req: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json(
            { success: false, message: 'Supabase Admin client not initialized. Check environment variables.' },
            { status: 500 }
        );
    }
    try {
        const reqjson = await req.json();
        const { name, email, password, role, phone, referralCode } = reqjson;

        let referrerId = null;
        if (referralCode) {
            // Check if referralCode is a user ID or a custom code
            // First try matching custom code in commissioners table
            const { data: refComm } = await supabaseAdmin
                .from('commissioners')
                .select('user_id')
                .eq('referral_code', referralCode)
                .single();

            if (refComm) {
                referrerId = refComm.user_id;
            } else {
                // Try matching as a raw UUID
                referrerId = referralCode;
            }
        }

        // 1. Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name, role, phone }
        });

        if (authError) {
            console.error('Supabase Auth creation error:', authError.message);
            return NextResponse.json(
                { success: false, message: authError.message },
                { status: 400 }
            );
        }

        const user = authUser.user;

        // 2. Create user in public.users table (linked by ID)
        const { data: newUser, error: profileError } = await supabaseAdmin
            .from('users')
            .insert({
                id: user.id, // Use the ID from Auth
                name,
                email,
                role,
                phone,
                referrer_id: referrerId,
                verified: role === 'client' // Auto-approve clients
            })
            .select()
            .single();

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Cleanup: delete the auth user if profile creation fails? 
            // Better to just return error for now.
            return NextResponse.json(
                { success: false, message: `Failed to create profile: ${profileError.message}` },
                { status: 500 }
            );
        }

        // 3. Create role-specific profiles
        if (role === 'commissioner') {
            const customRefCode = `COMM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
            let parentCommId = null;
            if (referrerId) {
                const { data: p } = await supabaseAdmin
                    .from('commissioners')
                    .select('id')
                    .eq('user_id', referrerId)
                    .single();
                parentCommId = p?.id || null;
            }
            await supabaseAdmin.from('commissioners').insert({
                user_id: newUser.id,
                tier: 'tier1',
                rate_percent: 25.0,
                referral_code: customRefCode,
                parent_commissioner_id: parentCommId
            });
        } else if (role === 'developer') {
            await supabaseAdmin.from('developers').insert({
                user_id: newUser.id,
                verified: false
            });
        } else if (role === 'client') {
            await supabaseAdmin.from('clients').insert({
                user_id: newUser.id,
                company_name: name // Default to name
            });
        }

        // 4. Create audit log
        await supabaseAdmin.from('audit_logs').insert({
            actor_id: newUser.id,
            actor_role: role,
            action: 'user_registration',
            details: { role, email }
        });

        // 5. Send Welcome Email
        try {
            const requiresApproval = role !== 'client';
            const welcomeMessage = requiresApproval
                ? `Welcome to CREATIVE.KE, ${name}! Your account as a ${role} is currently pending admin approval. We will notify you once your profile has been verified.`
                : `Welcome to CREATIVE.KE, ${name}! Your client account is active. You can now start proposing projects and connecting with top-tier talent.`;

            await sendEmail({
                to_email: email,
                to_name: name,
                subject: 'Welcome to CREATIVE.KE',
                message: welcomeMessage,
                cta_link: `${process.env.NEXTAUTH_URL || 'https://aaaaaaasshh33.netlify.app'}/dashboard`
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        return NextResponse.json({
            success: true,
            data: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                requiresApproval: role !== 'client'
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
