'use client';

import ChatInterface from '@/components/chat/ChatInterface';
import { Users, Info } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function CommunityChatPage() {
    const router = useRouter();

    return (
        <div className="fixed inset-0 z-30 flex flex-col pt-16 lg:pl-64">
            <div className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-4">
                <ChatInterface
                    title="Connect Space"
                    subtitle="Community Chat"
                    isCommunity={true}
                    onBack={() => router.back()}
                />
            </div>
        </div>
    );
}
