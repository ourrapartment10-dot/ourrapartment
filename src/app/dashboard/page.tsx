"use client";

import { useAuth } from "@/components/auth/AuthContext";
import {
    Users, Building, AlertCircle, Calendar, CreditCard, Activity, CheckCircle,
    Wallet, FileText, Megaphone, Plus, ArrowUpRight, TrendingUp, HandCoins,
    Timer, Vote, ChevronRight, Bell, Settings, ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useRouter } from "next/navigation";

interface StatCard {
    label: string;
    value: string | number;
    change: string;
    icon: any;
    color: string;
    bg: string;
    link?: string;
    trend?: "up" | "down" | "neutral";
}

interface ActivityItem {
    id: string;
    type: "BOOKING" | "COMPLAINT" | "ANNOUNCEMENT" | "PAYMENT";
    title: string;
    subtitle: string;
    date: string;
    status?: string;
}

interface DashboardData {
    role: string;
    stats: {
        totalResidents?: number;
        totalProperties?: number;
        occupiedProperties?: number;
        pendingComplaints?: number;
        todaysBookings?: number;
        pendingPayments: number;
        totalRevenue?: number;
        totalExpenses?: number;
        openComplaints?: number;
        upcomingBookings?: number;
        property?: any;
    };
    performance?: {
        resolvedComplaints: number;
        totalComplaints: number;
    };
    charts: {
        revenue?: { month: string; amount: number }[];
        payments?: { month: string; amount: number }[];
    };
    activePolls?: any[];
    latestEvent?: any;
    activities: ActivityItem[];
}

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const jsonData = await res.json();
                    setData(jsonData);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
                <p className="text-gray-500 font-medium animate-pulse">Syncing community data...</p>
            </div>
        );
    }

    if (!data) return null;

    const isAdmin = data.role === "ADMIN" || data.role === "SUPER_ADMIN";

    const adminCards: StatCard[] = [
        {
            label: "Residents",
            value: data.stats.totalResidents || 0,
            change: "Active Members",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50/50",
            trend: "up",
            link: "/dashboard/admin/residents"
        },
        {
            label: "Occupancy",
            value: `${Math.round(((data.stats.occupiedProperties || 0) / (data.stats.totalProperties || 1)) * 100)}%`,
            change: `${data.stats.occupiedProperties}/${data.stats.totalProperties} Units`,
            icon: Building,
            color: "text-indigo-600",
            bg: "bg-indigo-50/50",
            link: "/dashboard/admin/properties"
        },
        {
            label: "Revenue",
            value: `₹${(data.stats.totalRevenue || 0).toLocaleString()}`,
            change: "Total Collections",
            icon: Wallet,
            color: "text-emerald-600",
            bg: "bg-emerald-50/50",
            trend: "up",
            link: "/dashboard/finances"
        },
        {
            label: "Complaints",
            value: data.stats.pendingComplaints || 0,
            change: "Pending Resolution",
            icon: AlertCircle,
            color: "text-orange-600",
            bg: "bg-orange-50/50",
            trend: "down",
            link: "/dashboard/complaints"
        }
    ];

    const residentCards: StatCard[] = [
        {
            label: "My Dues",
            value: `₹${(data.stats.pendingPayments * 2500).toLocaleString()}`, // Approximate for UI
            change: `${data.stats.pendingPayments} Pending Bills`,
            icon: CreditCard,
            color: "text-red-600",
            bg: "bg-red-50/50",
            link: "/dashboard/payments"
        },
        {
            label: "Complaints",
            value: data.stats.openComplaints || 0,
            change: "Status Tracker",
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50/50",
            link: "/dashboard/complaints"
        },
        {
            label: "Facility Bookings",
            value: data.stats.upcomingBookings || 0,
            change: "Upcoming Events",
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-50/50",
            link: "/dashboard/facilities"
        }
    ];

    const cards = isAdmin ? adminCards : residentCards;

    return (
        <div className="space-y-8 pb-10">
            {/* --- Header Section --- */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Hi, {user?.name?.split(" ")[0]}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">
                        {isAdmin ? "The community is running smoothly today." : "Everything you need to manage your home is here."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isAdmin ? (
                        <>
                            <Link href="/dashboard/announcements" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                                <Plus className="h-4 w-4" /> Announcement
                            </Link>
                            <Link href="/dashboard/finances" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                <TrendingUp className="h-4 w-4" /> Reports
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/facilities" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-nowrap">
                                <Calendar className="h-4 w-4" /> Book Facility
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {/* --- Key Metrics Grid --- */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                {cards.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="relative group"
                    >
                        {stat.link ? (
                            <Link href={stat.link} className="block">
                                <MetricCard stat={stat} />
                            </Link>
                        ) : (
                            <MetricCard stat={stat} />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* --- Main Dashboard Body --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visual Data Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Insights / Charts */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{isAdmin ? "Revenue Overview" : "Maintenance Trends"}</h3>
                                <p className="text-sm text-gray-500 font-medium">Monthly collection history</p>
                            </div>
                            <select className="bg-gray-50 border-none text-sm font-bold rounded-lg px-3 py-1.5 outline-none text-gray-600">
                                <option>Last 6 Months</option>
                            </select>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={isAdmin ? data.charts.revenue : data.charts.payments}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                        tickFormatter={(val) => `₹${val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(val) => [`₹${val}`, 'Amount']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Secondary Row: Activity & Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* activity */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Recent Updates</h3>
                                <Link href="/dashboard/announcements" className="text-blue-600 hover:text-blue-700">
                                    <Activity className="h-5 w-5" />
                                </Link>
                            </div>
                            <div className="space-y-5">
                                {data.activities.length > 0 ? (
                                    data.activities.slice(0, 5).map((activity, i) => (
                                        <div key={i} className="flex items-start gap-4 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors group" onClick={() => {
                                            if (activity.type === 'COMPLAINT') router.push('/dashboard/complaints');
                                            if (activity.type === 'BOOKING') router.push('/dashboard/facilities');
                                            if (activity.type === 'ANNOUNCEMENT') router.push('/dashboard/announcements');
                                            if (activity.type === 'PAYMENT') router.push('/dashboard/payments');
                                        }}>
                                            <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'BOOKING' ? 'bg-purple-50 text-purple-600' :
                                                activity.type === 'COMPLAINT' ? 'bg-orange-50 text-orange-600' :
                                                    activity.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-600' :
                                                        'bg-blue-50 text-blue-600'
                                                }`}>
                                                <ActivityIcon type={activity.type} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{activity.title}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">
                                                    {new Date(activity.date).toLocaleDateString()} • {activity.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-gray-400 text-xs font-semibold uppercase tracking-wider">No recent records</p>
                                )}
                            </div>
                        </div>

                        {/* Performance / Quick Links */}
                        <div className="bg-gray-900 rounded-[2rem] p-6 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-all duration-700" />

                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                                {isAdmin ? "Community Status" : "Property Details"}
                            </h3>

                            {isAdmin ? (
                                <div className="space-y-6">
                                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-3">Service Level</p>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-2xl font-black">
                                                {data.performance?.totalComplaints ? Math.round((data.performance.resolvedComplaints / data.performance.totalComplaints) * 100) : 0}%
                                            </span>
                                            <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Resolution</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${data.performance?.totalComplaints ? (data.performance.resolvedComplaints / data.performance.totalComplaints) * 100 : 0}%` }}
                                                className="h-full bg-blue-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href="/dashboard/settings" className="p-3 text-center rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors">Settings</Link>
                                        <Link href="/dashboard/subscription" className="p-3 text-center rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors">Billing</Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-2">My Unit</p>
                                        <p className="text-xl font-bold">{data.stats.property ? `${data.stats.property.block}-${data.stats.property.flatNumber}` : 'Not Assigned'}</p>
                                        <p className="text-[11px] text-gray-400 mt-1 uppercase font-bold">{data.stats.property ? `Floor ${data.stats.property.floor}` : 'Contact Admin'}</p>
                                    </div>
                                    <Link href="/dashboard/complaints" className="flex items-center justify-between w-full p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors group">
                                        <span className="font-bold text-sm">Raise Help Request</span>
                                        <ArrowUpRight className="h-5 w-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Notifications & Polls */}
                <aside className="space-y-8">
                    {/* Calendar / Reminder Card */}
                    <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Timer className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold truncate">{data.latestEvent ? "Important Update" : "No Next Event"}</h4>
                                <p className="text-xs text-blue-100 font-medium truncate">{data.latestEvent?.title || "Stay tuned for updates"}</p>
                            </div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/10">
                            {data.latestEvent ? (
                                <>
                                    <p className="text-lg font-black">{new Date(data.latestEvent.createdAt).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest mt-1">Check Announcements</p>
                                </>
                            ) : (
                                <p className="text-xs text-blue-100 italic">No scheduled events found in messages.</p>
                            )}
                        </div>
                        <Link href="/dashboard/announcements" className="block w-full text-center py-3 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-lg shadow-black/5 hover:bg-blue-50 transition-colors">
                            {data.latestEvent ? "View Details" : "All Notices"}
                        </Link>
                    </div>

                    {/* Active Polls */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Society Polls</h3>
                            <Vote className="h-5 w-5 text-gray-300" />
                        </div>
                        <div className="space-y-4">
                            {data.activePolls && data.activePolls.length > 0 ? (
                                data.activePolls.map((poll, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-gray-50 hover:bg-blue-50/50 border border-transparent hover:border-blue-100 transition-all cursor-pointer group" onClick={() => router.push('/dashboard/announcements')}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-bold uppercase">Open</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Ends {new Date(poll.endsAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{poll.question}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex -space-x-1">
                                                <div className="h-5 w-5 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">
                                                    {poll._count.votes}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Participate</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-tighter">
                                    No active polls
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/faqs" className="p-4 rounded-[2rem] bg-indigo-50 border border-indigo-100 text-center hover:bg-indigo-100/50 transition-all cursor-pointer group">
                            <Bell className="h-5 w-5 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold text-indigo-600 uppercase">FAQS</p>
                        </Link>
                        <Link href={isAdmin ? "/dashboard/settings" : "/dashboard/profile"} className="p-4 rounded-[2rem] bg-gray-50 border border-gray-100 text-center hover:bg-gray-100/50 transition-all cursor-pointer group">
                            <Settings className="h-5 w-5 text-gray-600 mx-auto mb-2 group-hover:rotate-45 transition-transform" />
                            <p className="text-xs font-bold text-gray-600 uppercase">Profile</p>
                        </Link>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function MetricCard({ stat }: { stat: StatCard }) {
    const Icon = stat.icon;
    return (
        <div className={`bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)] transition-all duration-500 group overflow-hidden`}>
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-3xl -mr-8 -mt-8 opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="relative z-10">
                <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                        {stat.trend && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                                }`}>
                                {stat.trend === 'up' ? '↑' : '↓'}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">{stat.change}</p>
                </div>
            </div>

            {/* Subtle Arrow */}
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 text-gray-300">
                <ChevronRight className="h-5 w-5" />
            </div>
        </div>
    );
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
    switch (type) {
        case 'BOOKING': return <Calendar className="h-4 w-4" />;
        case 'COMPLAINT': return <FileText className="h-4 w-4" />;
        case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />;
        case 'PAYMENT': return <CreditCard className="h-4 w-4" />;
        default: return <Activity className="h-4 w-4" />;
    }
}
