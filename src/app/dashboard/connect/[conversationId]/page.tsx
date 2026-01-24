'use client';

import ChatInterface from '@/components/chat/ChatInterface';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

export default function ConversationPage() {
    const params = useParams();
    const { user } = useAuth();
    const conversationId = params.conversationId as string;
    const [title, setTitle] = useState('Direct Message');
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        // Mark as read
        fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' });

        // Fetch conversation details for the title
        const fetchConversation = async () => {
            try {
                const res = await fetch(`/api/conversations/${conversationId}`);
                if (res.ok) {
                    const data = await res.json();

                    // Robust finding of the "other" participant
                    const currentId = user?.id?.toString();
                    const other = data.participants.find((p: any) =>
                        p.id.toString() !== currentId
                    ) || data.participants[0]; // Fallback to first if only one exists

                    if (other) {
                        setTitle(other.name);
                        // Ensure we set a truthy string or null, avoiding empty strings
                        setImage(other.image || null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch conversation', error);
            }
        };

        if (user) fetchConversation();
    }, [conversationId, user]);

    return (
        <div className="fixed inset-0 z-30 flex flex-col pt-16 lg:pl-64">
            <div className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-4">
                <ChatInterface
                    apiEndpoint={`/api/conversations/${conversationId}/messages`}
                    pusherChannel={`conversation-${conversationId}`}
                    title={title}
                    image={image}
                    subtitle="Online"
                    isCommunity={false}
                />
            </div>
        </div>
    );
}
