'use client';

import { useAuth } from '@/components/auth/AuthContext';
import {
  Users,
  Building,
  AlertCircle,
  Calendar,
  CreditCard,
  Activity,
  CheckCircle,
  Wallet,
  FileText,
  Megaphone,
  Plus,
  ArrowUpRight,
  TrendingUp,
  HandCoins,
  Timer,
  Vote,
  ChevronRight,
  Bell,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useRouter } from 'next/navigation';

interface StatCard {
  label: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
  bg: string;
  link?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface ActivityItem {
  id: string;
  type: 'BOOKING' | 'COMPLAINT' | 'ANNOUNCEMENT' | 'PAYMENT';
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
        console.error('Failed to fetch dashboard stats', error);
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p className="animate-pulse font-medium text-gray-500">
          Syncing community data...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const isAdmin = data.role === 'ADMIN' || data.role === 'SUPER_ADMIN';

  const adminCards: StatCard[] = [
    {
      label: 'Residents',
      value: data.stats.totalResidents || 0,
      change: 'Active Members',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50/50',
      trend: 'up',
      link: '/dashboard/admin/residents',
    },
    {
      label: 'Occupancy',
      value: `${Math.round(((data.stats.occupiedProperties || 0) / (data.stats.totalProperties || 1)) * 100)}%`,
      change: `${data.stats.occupiedProperties}/${data.stats.totalProperties} Units`,
      icon: Building,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/50',
      link: '/dashboard/admin/properties',
    },
    {
      label: 'Revenue',
      value: `₹${(data.stats.totalRevenue || 0).toLocaleString()}`,
      change: 'Total Collections',
      icon: Wallet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      trend: 'up',
      link: '/dashboard/finances',
    },
    {
      label: 'Complaints',
      value: data.stats.pendingComplaints || 0,
      change: 'Pending Resolution',
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50/50',
      trend: 'down',
      link: '/dashboard/complaints',
    },
  ];

  const residentCards: StatCard[] = [
    {
      label: 'My Dues',
      value: `₹${(data.stats.pendingPayments * 2500).toLocaleString()}`, // Approximate for UI
      change: `${data.stats.pendingPayments} Pending Bills`,
      icon: CreditCard,
      color: 'text-red-600',
      bg: 'bg-red-50/50',
      link: '/dashboard/payments',
    },
    {
      label: 'Complaints',
      value: data.stats.openComplaints || 0,
      change: 'Status Tracker',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50/50',
      link: '/dashboard/complaints',
    },
    {
      label: 'Facility Bookings',
      value: data.stats.upcomingBookings || 0,
      change: 'Upcoming Events',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50/50',
      link: '/dashboard/facilities',
    },
  ];

  const cards = isAdmin ? adminCards : residentCards;

  return (
    <div className="space-y-8 pb-10">
      {/* --- Header Section --- */}
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Hi, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-1 font-medium text-gray-500 italic">
            {isAdmin
              ? 'The community is running smoothly today.'
              : 'Everything you need to manage your home is here.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Link
                href="/dashboard/announcements"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" /> Announcement
              </Link>
              <Link
                href="/dashboard/finances"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
              >
                <TrendingUp className="h-4 w-4" /> Reports
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/facilities"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-nowrap text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4" /> Book Facility
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* --- Key Metrics Grid --- */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}
      >
        {cards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="group relative"
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Visual Data Section */}
        <div className="space-y-8 lg:col-span-2">
          {/* Insights / Charts */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isAdmin ? 'Revenue Overview' : 'Maintenance Trends'}
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  Monthly collection history
                </p>
              </div>
              <select className="rounded-lg border-none bg-gray-50 px-3 py-1.5 text-sm font-bold text-gray-600 outline-none">
                <option>Last 6 Months</option>
              </select>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={isAdmin ? data.charts.revenue : data.charts.payments}
                >
                  <defs>
                    <linearGradient
                      id="colorAmount"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
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
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* activity */}
            <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Updates
                </h3>
                <Link
                  href="/dashboard/announcements"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Activity className="h-5 w-5" />
                </Link>
              </div>
              <div className="space-y-5">
                {data.activities.length > 0 ? (
                  data.activities.slice(0, 5).map((activity, i) => (
                    <div
                      key={i}
                      className="group flex cursor-pointer items-start gap-4 rounded-lg p-1 transition-colors hover:bg-gray-50"
                      onClick={() => {
                        if (activity.type === 'COMPLAINT')
                          router.push('/dashboard/complaints');
                        if (activity.type === 'BOOKING')
                          router.push('/dashboard/facilities');
                        if (activity.type === 'ANNOUNCEMENT')
                          router.push('/dashboard/announcements');
                        if (activity.type === 'PAYMENT')
                          router.push('/dashboard/payments');
                      }}
                    >
                      <div
                        className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          activity.type === 'BOOKING'
                            ? 'bg-purple-50 text-purple-600'
                            : activity.type === 'COMPLAINT'
                              ? 'bg-orange-50 text-orange-600'
                              : activity.type === 'PAYMENT'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                          {activity.title}
                        </p>
                        <p className="text-[11px] font-medium text-gray-500">
                          {new Date(activity.date).toLocaleDateString()} •{' '}
                          {activity.subtitle}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-10 text-center text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    No recent records
                  </p>
                )}
              </div>
            </div>

            {/* Performance / Quick Links */}
            <div className="group relative overflow-hidden rounded-[2rem] bg-gray-900 p-6 text-white">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl transition-all duration-700 group-hover:bg-blue-500/30" />

              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                {isAdmin ? 'Community Status' : 'Property Details'}
              </h3>

              {isAdmin ? (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                    <p className="mb-3 text-xs font-bold text-gray-400 uppercase">
                      Service Level
                    </p>
                    <div className="mb-2 flex items-end justify-between">
                      <span className="text-2xl font-black">
                        {data.performance?.totalComplaints
                          ? Math.round(
                              (data.performance.resolvedComplaints /
                                data.performance.totalComplaints) *
                                100
                            )
                          : 0}
                        %
                      </span>
                      <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                        Resolution
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${data.performance?.totalComplaints ? (data.performance.resolvedComplaints / data.performance.totalComplaints) * 100 : 0}%`,
                        }}
                        className="h-full rounded-full bg-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/dashboard/settings"
                      className="rounded-xl bg-white/5 p-3 text-center text-xs font-bold transition-colors hover:bg-white/10"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/dashboard/subscription"
                      className="rounded-xl bg-white/5 p-3 text-center text-xs font-bold transition-colors hover:bg-white/10"
                    >
                      Billing
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                    <p className="mb-2 text-xs font-bold text-gray-400 uppercase">
                      My Unit
                    </p>
                    <p className="text-xl font-bold">
                      {data.stats.property
                        ? `${data.stats.property.block}-${data.stats.property.flatNumber}`
                        : 'Not Assigned'}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-gray-400 uppercase">
                      {data.stats.property
                        ? `Floor ${data.stats.property.floor}`
                        : 'Contact Admin'}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/complaints"
                    className="group flex w-full items-center justify-between rounded-2xl bg-blue-600 p-4 transition-colors hover:bg-blue-700"
                  >
                    <span className="text-sm font-bold">
                      Raise Help Request
                    </span>
                    <ArrowUpRight className="h-5 w-5 transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Notifications & Polls */}
        <aside className="space-y-8">
          {/* Calendar / Reminder Card */}
          <div className="rounded-[2rem] bg-blue-600 p-6 text-white shadow-xl shadow-blue-200">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Timer className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="truncate font-bold">
                  {data.latestEvent ? 'Important Update' : 'No Next Event'}
                </h4>
                <p className="truncate text-xs font-medium text-blue-100">
                  {data.latestEvent?.title || 'Stay tuned for updates'}
                </p>
              </div>
            </div>
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/10 p-4">
              {data.latestEvent ? (
                <>
                  <p className="text-lg font-black">
                    {new Date(data.latestEvent.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-[10px] font-bold tracking-widest text-blue-200 uppercase">
                    Check Announcements
                  </p>
                </>
              ) : (
                <p className="text-xs text-blue-100 italic">
                  No scheduled events found in messages.
                </p>
              )}
            </div>
            <Link
              href="/dashboard/announcements"
              className="block w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-blue-600 shadow-lg shadow-black/5 transition-colors hover:bg-blue-50"
            >
              {data.latestEvent ? 'View Details' : 'All Notices'}
            </Link>
          </div>

          {/* Active Polls */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Society Polls</h3>
              <Vote className="h-5 w-5 text-gray-300" />
            </div>
            <div className="space-y-4">
              {data.activePolls && data.activePolls.length > 0 ? (
                data.activePolls.map((poll, i) => (
                  <div
                    key={i}
                    className="group cursor-pointer rounded-2xl border border-transparent bg-gray-50 p-4 transition-all hover:border-blue-100 hover:bg-blue-50/50"
                    onClick={() => router.push('/dashboard/announcements')}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                        Open
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Ends {new Date(poll.endsAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-700">
                      {poll.question}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex -space-x-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[8px] font-bold text-blue-600">
                          {poll._count.votes}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Participate
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs font-bold tracking-tighter text-gray-400 uppercase">
                  No active polls
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/dashboard/faqs"
              className="group cursor-pointer rounded-[2rem] border border-indigo-100 bg-indigo-50 p-4 text-center transition-all hover:bg-indigo-100/50"
            >
              <Bell className="mx-auto mb-2 h-5 w-5 text-indigo-600 transition-transform group-hover:scale-110" />
              <p className="text-xs font-bold text-indigo-600 uppercase">
                FAQS
              </p>
            </Link>
            <Link
              href={isAdmin ? '/dashboard/settings' : '/dashboard/profile'}
              className="group cursor-pointer rounded-[2rem] border border-gray-100 bg-gray-50 p-4 text-center transition-all hover:bg-gray-100/50"
            >
              <Settings className="mx-auto mb-2 h-5 w-5 text-gray-600 transition-transform group-hover:rotate-45" />
              <p className="text-xs font-bold text-gray-600 uppercase">
                Profile
              </p>
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
    <div
      className={`group overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-[0_15px_40px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)]`}
    >
      {/* Background Accent */}
      <div
        className={`absolute top-0 right-0 h-24 w-24 ${stat.bg} -mt-8 -mr-8 rounded-full opacity-50 blur-3xl transition-opacity group-hover:opacity-100`}
      />

      <div className="relative z-10">
        <div
          className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} mb-6 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black tracking-tighter text-gray-900">
              {stat.value}
            </h3>
            {stat.trend && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                  stat.trend === 'up'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {stat.trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-gray-500">{stat.change}</p>
        </div>
      </div>

      {/* Subtle Arrow */}
      <div className="absolute right-6 bottom-6 translate-x-4 transform text-gray-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
        <ChevronRight className="h-5 w-5" />
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  switch (type) {
    case 'BOOKING':
      return <Calendar className="h-4 w-4" />;
    case 'COMPLAINT':
      return <FileText className="h-4 w-4" />;
    case 'ANNOUNCEMENT':
      return <Megaphone className="h-4 w-4" />;
    case 'PAYMENT':
      return <CreditCard className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}
