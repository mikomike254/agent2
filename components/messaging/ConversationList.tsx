
'use client';

import { useState, useEffect } from 'react';
import { User, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

interface Participant {
    id: string;
    name: string;
    avatar_url?: string;
}

interface Conversation {
    id: string;
    title?: string;
    participants: Participant[];
    lastMessage?: {
        content: string;
        createdAt: string;
        senderId: string;
    };
    unreadCount: number;
    updatedAt: string;
}

interface ConversationListProps {
    conversations: Conversation[];
    loading: boolean;
    activeId?: string;
    onSelect: (id: string) => void;
}

export function ConversationList({ conversations, loading, activeId, onSelect }: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filter conversations
    const filteredConversations = conversations.filter(conv => {
        const otherParticipant = conv.participants.find(p => p.id !== 'current-user-id') || conv.participants[0];
        const title = conv.title || otherParticipant?.name || 'Conversation';
        return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getDisplayName = (conv: Conversation) => {
        if (conv.title) return conv.title;
        // Logic to get other participant name
        // Assuming we filter out current user in API or here. 
        // For now, let's just use the first participant that has a name
        return conv.participants[0]?.name || 'Unknown User';
    };

    const getDisplayAvatar = (conv: Conversation) => {
        // If group, maybe different icon
        // For direct, use other user's avatar
        return conv.participants[0]?.avatar_url;
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center p-8 text-[var(--text-secondary)]">
                <p>No conversations yet.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-[var(--bg-input)]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-transparent rounded-lg focus:bg-[var(--bg-card)] focus:border-[var(--primary)] outline-none text-sm transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => {
                    const isActive = conv.id === activeId;
                    const name = getDisplayName(conv);
                    const avatar = getDisplayAvatar(conv);
                    const date = conv.lastMessage?.createdAt
                        ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })
                        : formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true });

                    return (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={`w-full p-4 flex items-start gap-4 hover:bg-[var(--bg-secondary)] transition-colors text-left border-l-4 ${isActive
                                    ? 'bg-[var(--bg-secondary)] border-[var(--primary)]'
                                    : 'border-transparent'
                                }`}
                        >
                            <Avatar className="w-10 h-10 border border-[var(--bg-input)]">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-medium truncate pr-2 ${conv.unreadCount > 0 ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-primary)]'
                                        }`}>
                                        {name}
                                    </h3>
                                    <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                                        {date}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
                                        }`}>
                                        {conv.lastMessage?.content || 'No messages yet'}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="bg-[var(--primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
