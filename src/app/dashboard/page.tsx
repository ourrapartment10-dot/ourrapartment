'use client';

import { useAuth } from '@/components/auth/AuthContext';
import {
  Users,
  Building,
  AlertCircle,
  Calendar,
  Wallet,
  FileText,
  Megaphone,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Timer,
  Vote,
  MoreHorizontal,
  Activity,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Wrench,
  Search,
  Filter,
} from 'lucide-react';
import { useEffect, useState, Suspense, lazy, memo, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load Recharts to reduce initial bundle size
const AreaChart = dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart })), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const Area = dynamic(() => import('recharts').then(mod => ({ default: mod.Area })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => ({ default: mod.Pie })), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false });

// Chart loading skeleton
function ChartSkeleton() {
  return (
    <div className="h-full w-full animate-pulse rounded-xl bg-slate-100">
      <div className="flex h-full items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    </div>
  );
}

// --- Types ---
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
    occupancyRate?: number;
  };
  charts: {
    revenue?: { month: string; amount: number }[];
    payments?: { month: string; amount: number }[];
  };
  activePolls?: any[];
  latestEvent?: any;
  activities: any[];
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
          // Calculate occupancy rate if missing (mock logic or derived)
          if (jsonData.stats.totalProperties > 0 && !jsonData.stats.occupancyRate) {
            jsonData.stats.occupancyRate = Math.round(
              (jsonData.stats.occupiedProperties / jsonData.stats.totalProperties) * 100
            );
          }
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

  // Memoize expensive calculations (must be before conditional returns)
  const isAdmin = useMemo(
    () => data?.role === 'ADMIN' || data?.role === 'SUPER_ADMIN',
    [data?.role]
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-xl bg-slate-900"></div>
        <p className="animate-pulse font-bold text-slate-400">Loading Dashboard...</p>
      </div>
    );
  }

  if (!data) return null;

  // --- Components ---

  // Memoized components to prevent unnecessary re-renders
  const StatTile = memo(({ label, value, icon: Icon, color, trend }: any) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md"
    >
      <div className={`absolute top-4 right-4 rounded-xl p-2 ${color} bg-opacity-10`}>
        <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="mt-2">
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">{label}</p>
        <h3 className="mt-1 text-3xl font-black text-slate-900">{value}</h3>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className="flex items-center text-xs font-bold text-emerald-600">
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </span>
          <span className="text-[10px] font-medium text-slate-400">vs last month</span>
        </div>
      )}
    </motion.div>
  ));
  StatTile.displayName = 'StatTile';

  const ActionButton = memo(({ label, icon: Icon, href, colorClass }: any) => (
    <Link
      href={href}
      className={`group flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 transition-all hover:border-solid hover:bg-white hover:shadow-md ${colorClass} hover:border-current`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-black tracking-wide uppercase">{label}</span>
    </Link>
  ));
  ActionButton.displayName = 'ActionButton';

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="relative pt-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex w-fit items-center gap-3 rounded-2xl bg-indigo-600/10 px-4 py-2 text-indigo-600"
            >
              <Activity className="h-4 w-4" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                Dashboard Overview
              </span>
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl leading-[0.9] font-[900] tracking-tighter text-slate-900 lg:text-7xl"
              >
                Welcome, <br />
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0]} 👋
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-lg text-lg leading-relaxed font-medium text-slate-500 lg:text-xl"
              >
                Here&apos;s what&apos;s happening in your community today.
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-2">
            <span className="hidden text-xs font-bold text-slate-400 sm:inline-block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* --- BENTO GRID LAYOUT --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-4 lg:grid-rows-[auto_auto_auto]">

        {/* ROW 1: Quick Stats (Span 4) */}
        {isAdmin ? (
          <>
            <StatTile
              label="Total Revenue"
              value={`₹${(data.stats.totalRevenue || 0).toLocaleString()}`}
              icon={DollarSign}
              color="bg-emerald-500 text-emerald-600"
              trend="+12%"
            />
            <StatTile
              label="Active Residents"
              value={data.stats.totalResidents || 0}
              icon={Users}
              color="bg-blue-500 text-blue-600"
              trend="+5"
            />
            <StatTile
              label="Occupancy Rate"
              value={`${data.stats.occupancyRate || 0}%`}
              icon={Building}
              color="bg-violet-500 text-violet-600"
            />
            <StatTile
              label="Open Issues"
              value={data.stats.pendingComplaints || 0}
              icon={AlertCircle}
              color="bg-orange-500 text-orange-600"
            />
          </>
        ) : (
          <>
            <StatTile
              label="My Due Amount"
              value={`₹${(data.stats.pendingPayments || 0).toLocaleString()}`}
              icon={Wallet}
              color="bg-rose-500 text-rose-600"
            />
            <StatTile
              label="Active Complaints"
              value={data.stats.openComplaints || 0}
              icon={Wrench}
              color="bg-orange-500 text-orange-600"
            />
            <StatTile
              label="Next Booking"
              value={data.stats.upcomingBookings || 0}
              icon={Calendar}
              color="bg-purple-500 text-purple-600"
            />
            <StatTile
              label="Notifications"
              value="3" // Mock for now
              icon={Megaphone}
              color="bg-blue-500 text-blue-600"
            />
          </>
        )}

        {/* ROW 2: Main Content */}

        {/* BIG CHART WIDGET (Span 2/4 on Desktop) */}
        <div className="col-span-1 min-h-[320px] rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 md:col-span-2 lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {isAdmin ? 'Financial Performance' : 'Spending History'}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Last 6 Months
              </p>
            </div>
            <button className="rounded-xl bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={isAdmin ? data.charts.revenue : data.charts.payments}>
                <defs>
                  <linearGradient id="colorGraph" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, 'Amount']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0f172a"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorGraph)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTION CENTER (Span 1) */}
        <div className="col-span-1 flex flex-col gap-4 md:col-span-2 lg:col-span-1">
          <div className="flex-1 rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {isAdmin ? (
                <>
                  <Link href="/dashboard/announcements" className="rounded-xl bg-white/10 p-4 text-center text-xs font-bold transition-colors hover:bg-white/20">
                    Post Notice
                  </Link>
                  <Link href="/dashboard/admin/residents" className="rounded-xl bg-white/10 p-4 text-center text-xs font-bold transition-colors hover:bg-white/20">
                    Add User
                  </Link>
                  <Link href="/dashboard/finances" className="rounded-xl bg-white/10 p-4 text-center text-xs font-bold transition-colors hover:bg-white/20">
                    Record Pay
                  </Link>
                  <Link href="/dashboard/complaints" className="rounded-xl bg-white/10 p-4 text-center text-xs font-bold transition-colors hover:bg-white/20">
                    Resolve
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard/facilities" className="rounded-xl bg-white/10 p-4 text-center text-xs font-bold transition-colors hover:bg-white/20">
                    Book Now
                  </Link>
                  <Link href="/dashboard/payments" className="rounded-xl bg-white/10 p-4 text-center text-xs font-bold transition-colors hover:bg-white/20">
                    Pay Due
                  </Link>
                  <Link href="/dashboard/complaints" className="rounded-xl bg-white/10 p-4 text-center text-xs font-bold transition-colors hover:bg-white/20">
                    Get Help
                  </Link>
                  <Link href="/dashboard/connect" className="rounded-xl bg-white/10 p-4 text-center text-xs font-bold transition-colors hover:bg-white/20">
                    Chat
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* COMMUNITY PULSE / POLLS (Span 1) */}
        <div className="col-span-1 rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:col-span-1">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Live Pulse</h3>
            <Vote className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {data.activePolls && data.activePolls.length > 0 ? (
              <div className="flex flex-col justify-between rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 transition-all hover:shadow-md h-full">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full bg-indigo-100 px-2 py-1">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Active</span>
                    </div>
                    {data.activePolls[0].endsAt && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Timer className="h-3 w-3" />
                        <span>
                          {(() => {
                            const diff = new Date(data.activePolls[0].endsAt).getTime() - new Date().getTime();
                            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                            return days > 0 ? `${days}d left` : 'Ending soon';
                          })()}
                        </span>
                      </div>
                    )}
                  </div>

                  <h4 className="mb-2 text-sm font-black text-slate-900 leading-snug line-clamp-3">
                    {data.activePolls[0].question}
                  </h4>
                  <p className="mb-6 text-xs font-medium text-slate-500">
                    Make your voice heard in the community.
                  </p>
                </div>

                <Link
                  href="/dashboard/announcements"
                  className="block w-full rounded-xl bg-indigo-600 py-3 text-center text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
                >
                  Cast Vote
                </Link>
              </div>
            ) : (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-6 text-center">
                <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                  <Vote className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-400">No active polls right now</p>
                <p className="mt-1 text-[10px] font-medium text-slate-300">New polls will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: Dense Lists */}

        {/* RECENT ACTIVITY (Span 2) */}
        <div className="col-span-1 flex flex-col rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 md:col-span-2 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Top Highlights</h3>
            <Link href="/dashboard/announcements" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
            {data.activities.length > 0 ? (
              data.activities.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-start gap-4 rounded-2xl p-2 transition-colors hover:bg-slate-50">
                  <div className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-black text-xs ${item.type === 'PAYMENT' ? 'bg-emerald-100 text-emerald-700' :
                    item.type === 'COMPLAINT' ? 'bg-orange-100 text-orange-700' :
                      item.type === 'BOOKING' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {item.type[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs font-medium text-slate-500 line-clamp-1">{item.subtitle}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-300 uppercase">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm font-bold text-slate-300">Quiet day in the community</p>
              </div>
            )}
          </div>
        </div>

        {/* CONTEXT WIDGET: Unit Details or Occupancy Chart (Span 1) */}
        <div className="col-span-1 rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-slate-100 md:col-span-2 lg:col-span-1 lg:col-start-3">
          {isAdmin ? (
            <div className="flex flex-col h-full">
              <h3 className="mb-6 text-lg font-black text-slate-900">Occupancy</h3>
              <div className="flex flex-1 items-center justify-center relative">
                <div className="h-40 w-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Occupied', value: data.stats.occupancyRate || 0 },
                          { name: 'Vacant', value: 100 - (data.stats.occupancyRate || 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        cornerRadius={10}
                      >
                        <Cell fill="#0f172a" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-black text-slate-900">{data.stats.occupancyRate}%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Filled</span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/admin/properties" className="mt-4 text-center text-xs font-bold text-blue-600 hover:underline">
                Manage Units
              </Link>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <h3 className="mb-6 text-lg font-black text-slate-900">My Unit</h3>
              <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-3xl bg-slate-50 p-6 border border-slate-100">
                <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-white shadow-sm text-slate-900 font-black text-2xl">
                  {data.stats.property?.block || 'A'}
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{data.stats.property ? `${data.stats.property.block}-${data.stats.property.flatNumber}` : 'N/A'}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resident Owner</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* UPCOMING EVENT (Span 1) */}
        <div className="col-span-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-indigo-200 md:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between mb-8">
            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/10">
              <Calendar className="h-6 w-6" />
            </div>
            {data.latestEvent && <span className="rounded-lg bg-green-400/20 px-2 py-1 text-[10px] font-black uppercase text-green-300 border border-green-400/20">New</span>}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Next Priority</p>
              <h3 className="mt-2 text-xl font-black leading-tight">
                {data.latestEvent ? data.latestEvent.title : 'No upcoming events'}
              </h3>
            </div>
            <p className="text-xs font-medium text-indigo-100 line-clamp-2 opacity-80">
              {data.latestEvent ? 'Check the announcements page for full details regarding this event.' : 'Enjoy your day! We will notify you when something comes up.'}
            </p>

            <Link
              href="/dashboard/announcements"
              className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white hover:text-indigo-200"
            >
              Read More <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
