
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

interface ConversationData {
    id: string;
    title: string | null;
    type: string;
    projectId: string | null;
    updatedAt: string;
    lastMessageAt: string | null;
    participants: any[];
    unreadCount: number;
    lastMessage: {
        content: string;
        type: string;
        createdAt: string;
        senderId: string;
    } | null;
}

// GET: List all conversations for the current user
export async function GET(request: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    const admin = supabaseAdmin;

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        // Build query to fetch conversations user is part of
        let query = admin
            .from('conversation_participants')
            .select(`
                conversation:conversations (
                    id,
                    title,
                    conversation_type,
                    created_at,
                    updated_at,
                    last_message_at,
                    project_id,
                    participants:conversation_participants(
                        user:users(id, name, email, avatar_url, role)
                    )
                ),
                last_read_at
            `)
            .eq('user_id', userId)
            .eq('is_active', true);

        const { data: participations, error } = await query;

        if (error) throw error;

        // Process and format the data
        const conversationPromises = participations.map(async (p: any) => {
            const conv = p.conversation;
            if (!conv) return null;

            // Get unread count for this conversation
            const { count: unreadCount } = await admin
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .gt('created_at', p.last_read_at)
                .neq('sender_id', userId)
                .eq('is_deleted', false);

            // Get latest message content
            const { data: lastMsg } = await admin
                .from('messages')
                .select('content, message_type, created_at, sender_id')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            return {
                id: conv.id,
                title: conv.title,
                type: conv.conversation_type,
                projectId: conv.project_id,
                updatedAt: conv.updated_at,
                lastMessageAt: conv.last_message_at,
                participants: conv.participants.map((cp: any) => cp.user),
                unreadCount: unreadCount || 0,
                lastMessage: lastMsg ? {
                    content: lastMsg.content,
                    type: lastMsg.message_type,
                    createdAt: lastMsg.created_at,
                    senderId: lastMsg.sender_id
                } : null
            } as ConversationData;
        });

        const results = await Promise.all(conversationPromises);
        let conversations = results.filter((c): c is ConversationData => c !== null);

        // Filter by project if requested
        if (projectId) {
            conversations = conversations.filter(c => c.projectId === projectId);
        }

        // Sort by last message (most recent first)
        conversations.sort((a, b) => {
            const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
            const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();
            return timeB - timeA;
        });

        return NextResponse.json({
            success: true,
            data: conversations
        });

    } catch (error: any) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new conversation
export async function POST(request: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase Admin not initialized' }, { status: 500 });
    }
    const admin = supabaseAdmin;

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();
        const { participantIds, title, type = 'direct', projectId } = body;

        // Validation
        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            return NextResponse.json({ error: 'Participants are required' }, { status: 400 });
        }

        // Ensure current user is included
        const allParticipants = Array.from(new Set([...participantIds, userId]));

        // For direct chats (2 people), check if one already exists
        if (type === 'direct' && allParticipants.length === 2) {
            const otherUserId = allParticipants.find(id => id !== userId);

            // Call RPC function to get/create direct conversation
            const { data: existingId, error: rpcError } = await admin
                .rpc('create_direct_conversation', {
                    p_user1_id: userId,
                    p_user2_id: otherUserId,
                    p_project_id: projectId || null
                });

            if (rpcError) throw rpcError;

            return NextResponse.json({
                success: true,
                data: { id: existingId, isNew: false }
            });
        }

        // For group chats or generic creation
        const { data: conversation, error: convError } = await admin
            .from('conversations')
            .insert({
                title: title || 'New Conversation',
                conversation_type: type,
                project_id: projectId || null,
                created_by: userId
            })
            .select('id')
            .single();

        if (convError) throw convError;

        // Add participants
        const participantsData = allParticipants.map(pid => ({
            conversation_id: conversation.id,
            user_id: pid
        }));

        const { error: partError } = await admin
            .from('conversation_participants')
            .insert(participantsData);

        if (partError) throw partError;

        return NextResponse.json({
            success: true,
            data: { id: conversation.id, isNew: true }
        });

    } catch (error: any) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
