'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    image: string | null;
    role: string;
}

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const searchUsers = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/users/search?q=${encodeURIComponent(query)}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            searchUsers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const startChat = async (userId: string) => {
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantId: userId }),
            });

            if (res.ok) {
                const conversation = await res.json();
                onClose();
                router.push(`/dashboard/connect/${conversation.id}`);
            }
        } catch (error) {
            console.error('Failed to start chat', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-6 sm:rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        New Message
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <div className="relative mb-4">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 pr-4 pl-10 text-sm font-medium transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
                            placeholder="Search by name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="custom-scrollbar h-[60vh] overflow-y-auto -mx-2 px-2 pb-2">
                        {loading ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex h-40 flex-col items-center justify-center text-center">
                                <p className="text-sm font-medium text-gray-900">
                                    No people found
                                </p>
                                <p className="text-xs text-gray-500">
                                    Try searching for a different name
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {users.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => startChat(user.id)}
                                        className="group flex w-full items-center gap-3 rounded-2xl p-2 transition-all hover:bg-gray-50 active:scale-[0.98]"
                                    >
                                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 shadow-sm ring-1 ring-gray-100">
                                            {user.image ? (
                                                <img
                                                    referrerPolicy="no-referrer"
                                                    src={user.image}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-600">
                                                    {user.name[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600">
                                                {user.name}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 capitalize">
                                                {user.role.toLowerCase().replace('_', ' ')}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
