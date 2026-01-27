'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    CreditCard,
    MessageSquare,
    Wrench,
    Users,
    CheckCircle2,
    AlertCircle,
    Bell,
    Calendar,
    TrendingUp,
} from 'lucide-react';

// Mock Data for different views
const features = [
    {
        id: 'dashboard',
        label: 'Overview',
        icon: Home,
        color: 'bg-indigo-500',
        content: (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 sm:p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <span className="text-xs font-bold text-indigo-600">+12%</span>
                        </div>
                        <div className="text-xl font-black text-gray-900 sm:text-2xl">245</div>
                        <div className="text-xs font-semibold text-gray-500">Total Residents</div>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 sm:p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600">98%</span>
                        </div>
                        <div className="text-xl font-black text-gray-900 sm:text-2xl">$12k</div>
                        <div className="text-xs font-semibold text-gray-500">Collection Rate</div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">Recent Activity</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Today</span>
                    </div>
                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-100" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-2 w-2/3 rounded-full bg-gray-200" />
                                    <div className="h-2 w-1/2 rounded-full bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'payments',
        label: 'Payments',
        icon: CreditCard,
        color: 'bg-emerald-500',
        content: (
            <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/20">
                    <div>
                        <p className="text-xs font-medium text-emerald-100">Total Due</p>
                        <p className="text-2xl font-black">$450.00</p>
                    </div>
                    <div className="rounded-lg bg-white/20 p-2">
                        <CreditCard className="h-5 w-5 text-white" />
                    </div>
                </div>
                <div className="space-y-2">
                    {[
                        { title: 'Maintenance Bill', amount: '$150.00', status: 'Paid', date: 'Oct 24' },
                        { title: 'Water Charges', amount: '$45.00', status: 'Pending', date: 'Due Tomorrow' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {item.status === 'Paid' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                                    <p className="text-[10px] font-medium text-gray-500">{item.date}</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-gray-900">{item.amount}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'announcements',
        label: 'Community',
        icon: MessageSquare,
        color: 'bg-blue-500',
        content: (
            <div className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-blue-700">
                        <Bell className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Announcement</span>
                    </div>
                    <h4 className="mb-1 text-sm font-bold text-gray-900">Diwali Celebration 🪔</h4>
                    <p className="mb-3 text-xs text-gray-600">Join us for the grand celebration this weekend at the Club House!</p>
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-6 w-6 rounded-full border-2 border-white bg-gray-200 bg-[url('https://i.pravatar.cc/100?img=${i + 20}')] bg-cover`} />
                        ))}
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[9px] font-bold text-blue-600">+42</div>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900">Yoga Session</p>
                            <p className="text-[10px] text-gray-500">Tomorrow at 7:00 AM</p>
                        </div>
                        <button className="ml-auto rounded-lg bg-gray-900 px-3 py-1.5 text-[10px] font-bold text-white">Join</button>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'complaints',
        label: 'Support',
        icon: Wrench,
        color: 'bg-orange-500',
        content: (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-gray-900">Active Tickets</h4>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">2 Pending</span>
                </div>
                {[
                    { title: 'Leaking Tap', area: 'Kitchen', status: 'In Progress' },
                    { title: 'Lift Not Working', area: 'Block A', status: 'Open' },
                ].map((item, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-gray-200">
                        <div className="absolute top-0 left-0 h-full w-1 bg-orange-500" />
                        <div className="pl-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">{item.title}</span>
                                <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${item.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {item.status}
                                </span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-400">{item.area}</p>
                        </div>
                    </div>
                ))}
                <button className="w-full rounded-xl border-2 border-dashed border-gray-200 py-2 text-xs font-bold text-gray-400 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
                    + New Ticket
                </button>
            </div>
        ),
    }
];

export default function InteractiveHeroDisplay() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % features.length);
        }, 3000); // Rotate every 3 seconds
        return () => clearInterval(interval);
    }, [isHovered]);

    const activeFeature = features[activeIndex];

    return (
        <div
            className="relative mx-auto w-full max-w-[420px] lg:mr-0 lg:ml-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Container Mockup */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/80 shadow-2xl backdrop-blur-xl transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">

                {/* Top Bar Mockup */}
                <div className="flex items-center border-b border-gray-100 bg-white px-4 py-3">
                    <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="mx-auto flex w-1/2 items-center justify-center rounded-md bg-gray-50 py-1 text-[10px] font-medium text-gray-400">
                        ourapartment.com
                    </div>
                </div>

                {/* Inner Layout */}
                <div className="flex h-[380px]">
                    {/* Sidebar (Desktop) / Mobile Tabs Indicator */}
                    <div className="flex w-16 flex-none flex-col items-center gap-4 border-r border-gray-100 bg-gray-50/50 py-4 sm:w-20">
                        {features.map((feature, idx) => {
                            const isActive = idx === activeIndex;
                            const Icon = feature.icon;
                            return (
                                <button
                                    key={feature.id}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${isActive ? 'bg-white shadow-md' : 'hover:bg-white hover:shadow-sm'}`}
                                >
                                    <div className={`absolute inset-0 rounded-xl opacity-20 ${feature.color} ${isActive ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                                    {/* We use opacity overlay for background color to keep it subtle or full based on active state, wait, actually simpler: */}
                                    <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${isActive ? feature.color : 'bg-transparent'}`} style={{ opacity: isActive ? 1 : 0 }} />

                                    <Icon className={`relative z-10 h-5 w-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />

                                    {/* Mobile/Tooltip indicator - simple dot for now or just visual change */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute -right-[1px] top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-gray-900"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="relative flex-1 bg-white p-4 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight text-gray-900">{activeFeature.label}</h3>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50">
                                <activeFeature.icon className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="relative h-[260px] w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeFeature.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute inset-0"
                                >
                                    {activeFeature.content}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
