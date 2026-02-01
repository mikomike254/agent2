
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatWindow } from '@/components/messaging/ChatWindow';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get('conversation');
        if (id) {
            setActiveConversationId(id);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/messages');
            const result = await response.json();
            if (result.success) {
                setConversations(result.data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id);
        // Update URL shallowly or navigate
        // router.push(`/dashboard/messages?conversation=${id}`, { scroll: false });
        // shallow routing in Next 13+ is implicit mostly or use HTML5 history?
        // Let's just update active state. URL sync is nice but not strictly required for MVP unless deep linking.
        // If we want deep linking:
        const url = new URL(window.location.href);
        url.searchParams.set('conversation', id);
        window.history.pushState({}, '', url.toString());
    };

    const handleBack = () => {
        setActiveConversationId(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('conversation');
        window.history.pushState({}, '', url.toString());
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // Get recipient name/avatar for ChatWindow
    // For direct chats, it's the other user. For group, it's the title.
    const getChatDetails = () => {
        if (!activeConversation) return { name: 'Unknown', avatar: undefined };

        // Logic similar to List but for the header
        const otherParticipant = activeConversation.participants.find((p: any) => p.email !== 'me'); // 'me' check needs session.
        // Ideally we pass current user ID to helper or use session.
        // For now, let's use title if exists, or first participant.

        // Since we don't have current user ID readily available in this scope without prop drilling or context hook (useSession),
        // we can assume the API filtered correctly or we just pick the first one that looks like a name.
        // A better way is to rely on title if group, or 'participants[0].name' if direct.

        const name = activeConversation.title || activeConversation.participants[0]?.name || 'Chat';
        const avatar = activeConversation.participants[0]?.avatar_url;

        return { name, avatar };
    };

    const { name: recipientName, avatar: recipientAvatar } = getChatDetails();

    return (
        <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex overflow-hidden rounded-xl bg-[var(--bg-card)] border border-[var(--bg-input)] shadow-sm">

            {/* Sidebar / List - Hidden on mobile if chat is active */}
            <div className={`
                w-full md:w-1/3 border-r border-[var(--bg-input)] bg-[var(--bg-secondary)] flex flex-col
                ${activeConversationId ? 'hidden md:flex' : 'flex'}
            `}>
                <ConversationList
                    conversations={conversations}
                    loading={loading}
                    activeId={activeConversationId || undefined}
                    onSelect={handleSelectConversation}
                />
            </div>

            {/* Chat Window - Hidden on mobile if no chat active */}
            <div className={`
                flex-1 flex flex-col bg-[var(--bg-card)]
                ${!activeConversationId ? 'hidden md:flex' : 'flex'}
            `}>
                {activeConversationId ? (
                    <ChatWindow
                        conversationId={activeConversationId}
                        recipientName={recipientName}
                        recipientAvatar={recipientAvatar}
                        onBack={handleBack}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50 p-8 text-center">
                        <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">Select a conversation</h3>
                        <p className="max-w-xs">Choose a chat from the sidebar to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
