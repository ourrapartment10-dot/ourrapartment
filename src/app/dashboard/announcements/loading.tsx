
import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="pb-20 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="relative space-y-8 px-2 pt-8">
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                    <div className="max-w-2xl space-y-6">
                        <div className="h-8 w-32 rounded-2xl bg-slate-200"></div>
                        <div className="space-y-4">
                            <div className="h-16 w-3/4 rounded-3xl bg-slate-200"></div>
                            <div className="h-6 w-1/2 rounded-xl bg-slate-200"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed Skeleton */}
            <div className="mx-auto max-w-3xl space-y-8 px-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-slate-100"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 rounded-lg bg-slate-100"></div>
                                <div className="h-3 w-20 rounded-lg bg-slate-100"></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-6 w-3/4 rounded-xl bg-slate-100"></div>
                            <div className="h-4 w-full rounded-lg bg-slate-100"></div>
                            <div className="h-4 w-full rounded-lg bg-slate-100"></div>
                            <div className="h-4 w-2/3 rounded-lg bg-slate-100"></div>
                            <div className="h-48 w-full rounded-2xl bg-slate-100 mt-4"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-white to-transparent pointer-events-none">
                <div className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-full shadow-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Loading Feed</span>
                </div>
            </div>
        </div>
    );
}
