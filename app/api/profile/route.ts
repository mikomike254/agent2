// API Route: Get and Update User Profile
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Fetch user profile with all new fields
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        // Fetch user settings
        const { data: settings } = await supabaseAdmin
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Fetch role-specific data
        let roleData = {};

        if (user.role === 'commissioner') {
            const { data: commissioner } = await supabaseAdmin
                .from('commissioners')
                .select('*')
                .eq('user_id', userId)
                .single();

            roleData = commissioner || {};
        } else if (user.role === 'developer') {
            const { data: developer } = await supabaseAdmin
                .from('developers')
                .select('*')
                .eq('user_id', userId)
                .single();

            roleData = developer || {};
        } else if (user.role === 'client') {
            const { data: client } = await supabaseAdmin
                .from('clients')
                .select('*')
                .eq('user_id', userId)
                .single();

            roleData = client || {};
        }

        return NextResponse.json({
            success: true,
            data: {
                user,
                roleData,
                settings: settings || {}
            },
        });
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch profile' },
            { status: 500 }
        );
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

        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;
        const body = await request.json();

        const {
            // User table fields
            name,
            phone,
            bio,
            avatar_url,
            company,
            industry,
            location,
            timezone,
            linkedin_url,
            github_url,
            twitter_url,
            website_url,
            preferred_language,

            // Role-specific fields
            skills,
            hourly_rate,
            portfolio_url,
            mpesa_number,
            company_size,
            specialization,
            years_experience,

            // Settings
            settings
        } = body;

        // Build user updates object (only include provided fields)
        const userUpdates: any = {};
        if (name !== undefined) userUpdates.name = name;
        if (phone !== undefined) userUpdates.phone = phone;
        if (bio !== undefined) userUpdates.bio = bio;
        if (avatar_url !== undefined) userUpdates.avatar_url = avatar_url;
        if (location !== undefined) userUpdates.location = location;
        if (timezone !== undefined) userUpdates.timezone = timezone;
        if (linkedin_url !== undefined) userUpdates.linkedin_url = linkedin_url;
        if (github_url !== undefined) userUpdates.github_url = github_url;
        if (twitter_url !== undefined) userUpdates.twitter_url = twitter_url;
        if (website_url !== undefined) userUpdates.website_url = website_url;
        if (preferred_language !== undefined) userUpdates.preferred_language = preferred_language;
        userUpdates.updated_at = new Date().toISOString();

        // Update users table
        if (Object.keys(userUpdates).length > 1) { // more than just updated_at
            const { error: userError } = await supabaseAdmin
                .from('users')
                .update(userUpdates)
                .eq('id', userId);

            if (userError) throw userError;
        }

        // Update role-specific tables
        const roleUpdates: any = {};

        if (userRole === 'commissioner') {
            if (mpesa_number !== undefined) roleUpdates.mpesa_number = mpesa_number;
            if (phone !== undefined) roleUpdates.phone = phone;
            if (avatar_url !== undefined) roleUpdates.avatar_url = avatar_url;
            if (bio !== undefined) roleUpdates.bio = bio;
            if (specialization !== undefined) roleUpdates.specialization = specialization;
            if (years_experience !== undefined) roleUpdates.years_experience = years_experience;

            if (Object.keys(roleUpdates).length > 0) {
                await supabaseAdmin
                    .from('commissioners')
                    .update(roleUpdates)
                    .eq('user_id', userId);
            }
        } else if (userRole === 'developer') {
            if (skills !== undefined) roleUpdates.skills = skills;
            if (hourly_rate !== undefined) roleUpdates.hourly_rate = parseFloat(hourly_rate);
            if (portfolio_url !== undefined) roleUpdates.portfolio_url = portfolio_url;
            if (phone !== undefined) roleUpdates.phone = phone;
            if (avatar_url !== undefined) roleUpdates.avatar_url = avatar_url;
            if (bio !== undefined) roleUpdates.bio = bio;

            if (Object.keys(roleUpdates).length > 0) {
                await supabaseAdmin
                    .from('developers')
                    .update(roleUpdates)
                    .eq('user_id', userId);
            }
        } else if (userRole === 'client') {
            if (phone !== undefined) roleUpdates.phone = phone;
            if (avatar_url !== undefined) roleUpdates.avatar_url = avatar_url;
            if (bio !== undefined) roleUpdates.bio = bio;
            if (industry !== undefined) roleUpdates.industry = industry;
            if (company_size !== undefined) roleUpdates.company_size = company_size;

            if (Object.keys(roleUpdates).length > 0) {
                await supabaseAdmin
                    .from('clients')
                    .update(roleUpdates)
                    .eq('user_id', userId);
            }
        }

        // Update settings if provided
        if (settings && typeof settings === 'object') {
            const { error: settingsError } = await supabaseAdmin
                .from('user_settings')
                .update(settings)
                .eq('user_id', userId);

            if (settingsError) {
                console.error('Error updating settings:', settingsError);
                // Don't throw, just log - settings update is not critical
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update profile' },
            { status: 500 }
        );
    }
}

// Add PUT method for consistency
export async function PUT(request: NextRequest) {
    return POST(request);
}
