"use client";

import { useState, useEffect, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
    ComposedChart
} from 'recharts';
import {
    DollarSign,
    TrendingUp,
    PieChart as PieChartIcon,
    CalendarDays,
    Activity
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Color palette for charts
const COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

// Status-specific colors
const STATUS_COLORS: Record<string, string> = {
    'PENDING': '#F59E0B',     // Yellow/Orange
    'COMPLETED': '#10B981',   // Green
    'PAID': '#10B981',        // Green
    'FAILED': '#EF4444',      // Red
    'CANCELLED': '#6B7280',   // Gray
    'OVERDUE': '#DC2626',     // Dark red
    'PROCESSING': '#3B82F6',  // Blue
    'Unknown': '#9CA3AF'      // Light gray
};

interface Payment {
    amount: number;
    status: string;
    type?: string;
    paymentType?: string;
    createdAt?: string | Date;
    date?: string | Date;
    paidAt?: string | Date;
    dueDate?: string | Date;
    userId?: string;
    user?: {
        name: string;
        email?: string;
    };
}

interface PaymentChartsProps {
    payments: Payment[];
    userRole?: string;
    userId?: string;
}

export default function PaymentCharts({ payments, userRole, userId }: PaymentChartsProps) {
    const [selectedChart, setSelectedChart] = useState('overview');
    const [monthsToShow, setMonthsToShow] = useState(6);
    const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'community'
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const normalizeDate = (dateInput: string | Date | undefined) => {
        if (!dateInput) return null;
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
    };

    const getPaymentDate = (payment: Payment) => {
        // Prefer paid date for revenue, created for others
        return payment.createdAt || payment.date || payment.paidAt || payment.dueDate;
    };

    const getStatusColor = (status: string) => {
        return STATUS_COLORS[status?.toUpperCase()] || STATUS_COLORS['Unknown'];
    };

    const currentPayments = useMemo(() => {
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            return payments;
        }
        if (viewMode === 'personal') {
            return payments.filter(p => p.userId === userId);
        }
        return payments; // Community view for residents
    }, [payments, userRole, viewMode, userId]);


    // Process data for Revenue by Payment Type
    const revenueByType = useMemo(() => {
        if (!currentPayments.length) return [];

        const typeRevenue: Record<string, number> = {};
        const typeCount: Record<string, number> = {};

        currentPayments.forEach(payment => {
            const type = String(payment.type || payment.paymentType || 'Other').replace(/_/g, ' ');
            const isCompleted = payment.status === 'COMPLETED' || payment.status === 'PAID';

            if (!typeRevenue[type]) typeRevenue[type] = 0;
            if (!typeCount[type]) typeCount[type] = 0;

            if (isCompleted) {
                typeRevenue[type] += Number(payment.amount) || 0;
                typeCount[type] += 1; // Count only completed? Or all? Reference logic implies counting strictly valid payments for revenue.
            }
        });

        return Object.entries(typeRevenue)
            .map(([type, revenue]) => ({
                type,
                name: type,
                revenue: Math.round(revenue * 100) / 100,
                count: typeCount[type]
            }))
            .filter(item => item.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue);
    }, [currentPayments]);

    // Monthly Trend
    const monthlyRevenue = useMemo(() => {
        if (!isClient || !currentPayments.length) return [];

        const monthsArray = Array.from({ length: monthsToShow }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (monthsToShow - 1 - i));
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

            return {
                month: monthName,
                totalAmount: 0,
                completedAmount: 0,
                totalCount: 0,
                completedCount: 0,
                pendingCount: 0,
                sortKey: monthKey
            };
        });

        currentPayments.forEach(payment => {
            const dateInput = getPaymentDate(payment);
            if (!dateInput) return;

            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return;

            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthData = monthsArray.find(m => m.sortKey === monthKey);

            if (monthData) {
                const amount = Number(payment.amount) || 0;
                const isCompleted = payment.status === 'COMPLETED' || payment.status === 'PAID';

                monthData.totalAmount += amount;
                monthData.completedAmount += isCompleted ? amount : 0;
                monthData.totalCount += 1;
                monthData.completedCount += isCompleted ? 1 : 0;
                monthData.pendingCount += !isCompleted ? 1 : 0;
            }
        });

        return monthsArray.map(item => ({
            ...item,
            totalAmount: Math.round(item.totalAmount * 100) / 100,
            completedAmount: Math.round(item.completedAmount * 100) / 100
        })).filter(m => monthsToShow <= 6 || m.totalCount > 0);
    }, [isClient, currentPayments, monthsToShow]);

    // Status Distribution
    const statusDistribution = useMemo(() => {
        if (!currentPayments.length) return [];

        const statusStats: Record<string, number> = {};

        currentPayments.forEach(payment => {
            const status = payment.status || 'Unknown';
            statusStats[status] = (statusStats[status] || 0) + 1;
        });

        return Object.entries(statusStats).map(([status, count]) => ({
            status: status.replace(/_/g, ' '),
            count,
            fill: getStatusColor(status)
        }));
    }, [currentPayments]);

    const dailyRevenue = useMemo(() => {
        if (!isClient || !currentPayments.length) return [];

        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
                date: date.toISOString().split('T')[0],
                displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: 0,
                count: 0
            };
        });

        currentPayments.forEach(payment => {
            const isCompleted = payment.status === 'COMPLETED' || payment.status === 'PAID';
            if (isCompleted) {
                const dateInput = getPaymentDate(payment);
                const pDate = normalizeDate(dateInput);
                const dayData = last30Days.find(d => d.date === pDate);
                if (dayData) {
                    dayData.revenue += Number(payment.amount) || 0;
                    dayData.count += 1;
                }
            }
        });

        return last30Days;
    }, [isClient, currentPayments]);

    const chartOptions = [
        { id: 'overview', name: 'Overview', icon: PieChartIcon },
        { id: 'revenue-type', name: 'Revenue by Type', icon: DollarSign },
        { id: 'monthly-trend', name: 'Monthly Trend', icon: TrendingUp },
        { id: 'daily-trend', name: '30-Day Activity', icon: Activity }
    ];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md p-3 border border-slate-100 rounded-lg shadow-xl text-sm z-50">
                    <p className="font-bold text-slate-900 mb-1">{label}</p>
                    {payload.map((pld: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-0.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.color }}></div>
                            <span className="text-slate-600 capitalize">{pld.name}:</span>
                            <span className="font-semibold text-slate-900">
                                {pld.name.toLowerCase().includes('amount') || pld.name.toLowerCase().includes('revenue')
                                    ? formatCurrency(pld.value)
                                    : pld.value}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (!isClient) {
        return <div className="h-96 animate-pulse bg-slate-100 rounded-2xl"></div>;
    }

    return (
        <div className="space-y-6">
            {userRole === 'RESIDENT' && (
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Analytics Scope</h3>
                        <p className="text-xs text-slate-500">Toggle between personal and community data</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('personal')}
                            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'personal' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            Personal
                        </button>
                        <button
                            onClick={() => setViewMode('community')}
                            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", viewMode === 'community' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            Community
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-3xl border border-blue-100/60">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">
                            {formatCurrency(currentPayments.filter(p => p.status === 'COMPLETED' || p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount || 0), 0))}
                        </h4>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-3xl border border-green-100/60">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-green-500/10 rounded-xl text-green-600">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-slate-500">Successful Payments</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">
                            {currentPayments.filter(p => p.status === 'COMPLETED' || p.status === 'PAID').length}
                        </h4>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-3xl border border-amber-100/60">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-slate-500">Pending</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">
                            {currentPayments.filter(p => p.status === 'PENDING').length}
                        </h4>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-100">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                            <PieChartIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-medium text-slate-500">Total Transactions</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">
                            {currentPayments.length}
                        </h4>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
                {chartOptions.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setSelectedChart(option.id)}
                        className={cn(
                            "flex items-center px-4 py-2.5 text-sm font-bold rounded-t-2xl transition-all",
                            selectedChart === option.id
                                ? "bg-slate-900 text-white shadow-lg translate-y-[1px]"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        )}
                    >
                        <option.icon className="w-4 h-4 mr-2" />
                        {option.name}
                    </button>
                ))}
            </div>

            {/* Chart View */}
            <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 border border-slate-100 shadow-sm min-h-[400px]">
                {selectedChart === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-50/50 rounded-2xl p-4">
                            <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Revenue Distribution</h4>
                            {revenueByType.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={revenueByType}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="revenue"
                                        >
                                            {revenueByType.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-400">No Data Available</div>
                            )}
                        </div>

                        <div className="bg-slate-50/50 rounded-2xl p-4">
                            <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Status Distribution</h4>
                            {statusDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={statusDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {statusDistribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-400">No Data Available</div>
                            )}
                        </div>
                    </div>
                )}

                {selectedChart === 'revenue-type' && (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByType} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="type" />
                                <YAxis tickFormatter={(val) => `₹${val}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {selectedChart === 'monthly-trend' && (
                    <div className="h-[400px] w-full">
                        <div className="flex justify-end mb-4">
                            <select
                                title="Months to show"
                                value={monthsToShow}
                                onChange={(e) => setMonthsToShow(Number(e.target.value))}
                                className="text-sm border-slate-200 rounded-lg"
                            >
                                <option value={3}>3 Months</option>
                                <option value={6}>6 Months</option>
                                <option value={12}>1 Year</option>
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" tickFormatter={(val) => `₹${val}`} />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="totalAmount" name="Total Revenue" fill="#EEF2FF" stroke="#6366F1" />
                                <Line yAxisId="right" type="monotone" dataKey="totalCount" name="Total Payments" stroke="#10B981" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {selectedChart === 'daily-trend' && (
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="displayDate" minTickGap={30} />
                                <YAxis tickFormatter={(val) => `₹${val}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
