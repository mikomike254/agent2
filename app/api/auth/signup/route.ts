// Signup API Route
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const reqjson = await req.json();
        const { name, email, password, role, phone } = reqjson;

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password (in production, use bcrypt)
        const passwordHash = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');

        // Determine approval status
        const verified = role === 'client'; // Auto-approve clients

        // Create user
        const { data: newUser, error } = await supabaseAdmin
            .from('users')
            .insert({
                name,
                email,
                password_hash: passwordHash,
                role,
                phone,
                verified
                // removed status as it's missing from schema
            })
            .select()
            .single();

        if (error) {
            console.error('User creation error:', error);
            return NextResponse.json(
                { success: false, message: `Failed to create user: ${error.message}` },
                { status: 500 }
            );
        }

        // If commissioner or developer, create additional profile
        if (role === 'commissioner') {
            const { error: commError } = await supabaseAdmin.from('commissioners').insert({
                user_id: newUser.id,
                tier: 'tier1',
                rate_percent: 25.0,
                verified_at: null // Explicitly pending
            });

            if (commError) {
                console.error('Commissioner creation error:', commError);
                // We keep the user but log the error
            }
        }

        // Create audit log
        await supabaseAdmin.from('audit_logs').insert({
            actor_id: newUser.id,
            actor_role: role,
            action: 'user_registration',
            details: { role, email },
            // Removed ip_address as it's not in schema
        });

        // TODO: Send notification email
        // If commissioner/developer: "Registration pending approval"
        // If client: "Welcome to Tech Developers"

        return NextResponse.json({
            success: true,
            data: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
                requiresApproval: !verified
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
