
import { CreditCard, List, UserCheck, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="mx-auto max-w-[1600px] space-y-8 pb-20 animate-pulse">
            {/* Header Skeleton */}
            <div className="relative space-y-8 px-2 pt-8">
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                    <div className="max-w-2xl space-y-6">
                        <div className="flex w-fit items-center gap-3 rounded-2xl bg-slate-100 px-4 py-2">
                            <CreditCard className="h-4 w-4 text-slate-300" />
                            <div className="h-3 w-32 bg-slate-200 rounded"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-16 w-3/4 rounded-3xl bg-slate-200"></div>
                            <div className="h-6 w-1/2 rounded-xl bg-slate-200"></div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <div className="h-14 w-32 rounded-[2rem] bg-slate-200"></div>
                        <div className="h-14 w-40 rounded-[2rem] bg-slate-900/10"></div>
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm h-32">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-100"></div>
                                <div className="space-y-2">
                                    <div className="h-3 w-20 bg-slate-100 rounded"></div>
                                    <div className="h-6 w-24 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="px-2">
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 w-32 rounded-[1.5rem] bg-slate-200"></div>
                    ))}
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="min-h-[500px] space-y-6 px-2">
                {/* Filters Skeleton */}
                <div className="h-24 rounded-[2.5rem] bg-slate-100 w-full"></div>

                {/* List Skeleton */}
                <div className="hidden md:block overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white">
                    <div className="space-y-0 divide-y divide-slate-100">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center p-6 gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-slate-100" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-32 rounded bg-slate-100" />
                                        <div className="h-2 w-20 rounded bg-slate-100" />
                                    </div>
                                </div>
                                <div className="h-4 w-24 rounded bg-slate-100" />
                                <div className="h-4 w-24 rounded bg-slate-100" />
                                <div className="h-8 w-20 rounded-xl bg-slate-100" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:hidden space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-64 rounded-[2rem] bg-slate-100"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
