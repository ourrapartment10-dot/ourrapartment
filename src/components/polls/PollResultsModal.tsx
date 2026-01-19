"use client";

import { useState, useEffect } from "react";
import { X, Users, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PollResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    pollId: string;
}

export default function PollResultsModal({ isOpen, onClose, pollId }: PollResultsModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && pollId) {
            fetchResults();
        }
    }, [isOpen, pollId]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/polls/${pollId}/results`);
            if (res.ok) {
                const results = await res.json();
                setData(results);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] max-w-lg max-h-[80vh] bg-white rounded-[2rem] shadow-2xl z-[110] overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Voter Breakdown</h2>
                                {data && (
                                    <p className="text-sm text-gray-500 font-medium">
                                        {data.isAnonymous ? "Anonymous Poll - Voter identities hidden" : "Who voted for what"}
                                    </p>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading voters...</p>
                                </div>
                            ) : data ? (
                                <div className="space-y-8">
                                    {data.options.map((option: any) => (
                                        <div key={option.id}>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-black text-gray-900">{option.text}</h3>
                                                <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-black">
                                                    {option.votes?.length || option.count || 0}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                {option.votes && option.votes.length > 0 ? (
                                                    option.votes.map((vote: any) => (
                                                        <div key={vote.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                                            <div className="h-8 w-8 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-100">
                                                                {vote.user.image ? (
                                                                    <Image
                                                                        src={vote.user.image}
                                                                        alt={vote.user.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs uppercase">
                                                                        {vote.user.name[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700">{vote.user.name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic py-2 pl-4 border-l-2 border-gray-100">
                                                        {data.isAnonymous ? "Identities are hidden" : "No votes for this option yet"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 py-10">Failed to load results.</p>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
