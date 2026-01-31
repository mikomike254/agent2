// API Route: Upload Avatar/Profile Picture
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Get user
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const formData = await req.formData();
        const file = formData.get('avatar') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
            }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            }, { status: 400 });
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Convert File to ArrayBuffer then to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('avatars')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({
                success: false,
                message: `Upload failed: ${uploadError.message}`
            }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin
            .storage
            .from('avatars')
            .getPublicUrl(fileName);

        const avatarUrl = urlData.publicUrl;

        // Update user's avatar_url in database
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ avatar_url: avatarUrl })
            .eq('id', user.id);

        if (updateError) {
            console.error('Database update error:', updateError);
            return NextResponse.json({
                success: false,
                message: 'Failed to update profile'
            }, { status: 500 });
        }

        // Delete old avatar if it exists
        try {
            const { data: oldFiles } = await supabaseAdmin
                .storage
                .from('avatars')
                .list(user.id);

            if (oldFiles && oldFiles.length > 1) {
                // Keep only the newest file
                const filesToDelete = oldFiles
                    .filter(f => f.name !== fileName.split('/')[1])
                    .map(f => `${user.id}/${f.name}`);

                if (filesToDelete.length > 0) {
                    await supabaseAdmin
                        .storage
                        .from('avatars')
                        .remove(filesToDelete);
                }
            }
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
            // Don't fail the request if cleanup fails
        }

        return NextResponse.json({
            success: true,
            data: { avatar_url: avatarUrl },
            message: 'Avatar uploaded successfully!'
        });

    } catch (error: any) {
        console.error('Avatar upload error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}

// DELETE endpoint to remove avatar
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, avatar_url')
            .eq('email', session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Remove from storage
        if (user.avatar_url) {
            const { data: files } = await supabaseAdmin
                .storage
                .from('avatars')
                .list(user.id);

            if (files && files.length > 0) {
                const filePaths = files.map(f => `${user.id}/${f.name}`);
                await supabaseAdmin
                    .storage
                    .from('avatars')
                    .remove(filePaths);
            }
        }

        // Clear avatar_url from database
        await supabaseAdmin
            .from('users')
            .update({ avatar_url: null })
            .eq('id', user.id);

        return NextResponse.json({
            success: true,
            message: 'Avatar removed successfully!'
        });

    } catch (error: any) {
        console.error('Avatar delete error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}
