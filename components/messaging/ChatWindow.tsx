
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Paperclip, MoreVertical, Loader2, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    type: 'text' | 'image' | 'file';
    attachments?: any[];
}

interface ChatWindowProps {
    conversationId: string;
    recipientName: string;
    recipientAvatar?: string;
    onBack?: () => void; // for mobile
}

export function ChatWindow({ conversationId, recipientName, recipientAvatar, onBack }: ChatWindowProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClientComponentClient();

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/messages/${conversationId}?limit=50`);
            const result = await response.json();
            if (result.success) {
                setMessages(result.data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conversationId) {
            setLoading(true);
            fetchMessages();

            // Real-time subscription
            const channel = supabase
                .channel(`chat:${conversationId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                }, (payload) => {
                    const newMsg = payload.new as any;
                    setMessages((prev) => [...prev, {
                        id: newMsg.id,
                        content: newMsg.content,
                        senderId: newMsg.sender_id,
                        createdAt: newMsg.created_at,
                        type: newMsg.message_type,
                        attachments: [] // fetch if needed or update query
                    }]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [conversationId]);

    useEffect(() => {
        // Scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() && !sending) return;

        setSending(true);
        try {
            const response = await fetch(`/api/messages/${conversationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    type: 'text'
                })
            });
            const result = await response.json();
            if (result.success) {
                setNewMessage('');
                // Optimistic update or wait for real-time?
                // Real-time handles it usually, but let's see.
                // If real-time is slow, we might duplicate if we add it manually here too. 
                // Let's rely on real-time subscription for now or fetch again?
                // Actually, duplicate ID check prevents duplication key error but UI might show double if not careful.
                // Best to update local state immediately for responsiveness and ignore real-time event for own message if possible, 
                // or just rely on real-time which is fast enough for chat usually.
                // Adding manually for instant feedback:
                /*
                setMessages(prev => [...prev, {
                    id: result.data.id,
                    content: newMessage,
                    senderId: (session?.user as any).id,
                    createdAt: new Date().toISOString(),
                    type: 'text'
                }]);
                */
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--bg-input)] bg-[var(--bg-primary)] z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden p-2 hover:bg-[var(--bg-secondary)] rounded-full">
                            <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                        </button>
                    )}
                    <Avatar className="w-10 h-10 border border-[var(--bg-input)]">
                        <AvatarImage src={recipientAvatar} />
                        <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{recipientName}</h3>
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)]">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-secondary)] scroll-smooth"
            >
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-50">
                        <p>No messages yet.</p>
                        <p className="text-sm">Say hi to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === (session?.user as any)?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-[75%] rounded-2xl px-4 py-3 shadow-sm relative group
                                    ${isMe
                                        ? 'bg-[var(--primary)] text-white rounded-br-none'
                                        : 'bg-[var(--bg-test)] text-[var(--text-primary)] rounded-bl-none border border-[var(--bg-input)] bg-white dark:bg-zinc-800'
                                    }
                                `}>
                                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <span className={`text-[10px] mt-1 block opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--bg-input)] bg-[var(--bg-card)]">
                <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                    <button
                        type="button"
                        className="p-3 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors flex-shrink-0"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <div className="relative flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type a message..."
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-transparent focus:bg-[var(--bg-card)] border focus:border-[var(--primary)] rounded-2xl outline-none resize-none min-h-[50px] max-h-[150px] transition-all"
                            rows={1}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={`p-3 rounded-full bg-[var(--primary)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex-shrink-0 disabled:opacity-50 disabled:scale-100 ${sending ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
