
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId } = await params;
        const userId = (session.user as any).id;

        // Verify user is a participant
        const { data: participant, error: participantError } = await supabaseAdmin
            .from('conversation_participants')
            .select('id, last_read_at')
            .eq('conversation_id', conversationId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (participantError || !participant) {
            return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
        }

        // Fetch conversation details
        const { data: conversation, error: convError } = await supabaseAdmin
            .from('conversations')
            .select(`
        *,
        participants:conversation_participants(
          user:users(id, name, email, avatar_url, role)
        )
      `)
            .eq('id', conversationId)
            .single();

        if (convError) throw convError;

        // Fetch messages
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const before = url.searchParams.get('before'); // timestamp for pagination

        let query = supabaseAdmin
            .from('messages')
            .select(`
        *,
        sender:users(id, name, avatar_url),
        attachments:message_attachments(*)
      `)
            .eq('conversation_id', conversationId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (before && before !== 'undefined') {
            query = query.lt('created_at', before);
        }

        const { data: messages, error: msgError } = await query;

        if (msgError) throw msgError;

        // Update last_read_at asynchronously (fire and forget for this request, or await if critical)
        await supabaseAdmin.rpc('mark_conversation_read', {
            p_conversation_id: conversationId,
            p_user_id: userId
        });

        return NextResponse.json({
            success: true,
            data: {
                conversation,
                messages: messages ? messages.reverse() : [] // Return in chronological order for UI
            }
        });

    } catch (error: any) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId } = await params;
        const userId = (session.user as any).id;
        const body = await request.json();
        const { content, type = 'text', attachments = [] } = body;

        if (!content && (!attachments || attachments.length === 0)) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        // Verify user is a participant
        const { data: participant, error: participantError } = await supabaseAdmin
            .from('conversation_participants')
            .select('id')
            .eq('conversation_id', conversationId)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (participantError || !participant) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Insert message
        const { data: message, error: messageError } = await supabaseAdmin
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: userId,
                content,
                message_type: type
            })
            .select('*, sender:users(id, name, avatar_url)')
            .single();

        if (messageError) throw messageError;

        // Handle attachments if any
        if (attachments && attachments.length > 0) {
            const attachmentInserts = attachments.map((att: any) => ({
                message_id: message.id,
                file_name: att.name,
                file_url: att.url,
                file_type: att.type,
                file_size: att.size || 0
            }));

            const { error: attError } = await supabaseAdmin
                .from('message_attachments')
                .insert(attachmentInserts);

            if (attError) console.error('Error saving attachments:', attError);
        }

        return NextResponse.json({
            success: true,
            data: message
        });

    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
