"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Users, Building, Shield, TrendingUp, DollarSign, Activity, ArrowUpRight } from "lucide-react";
import { ApartmentConfigForm } from "@/components/admin/ApartmentConfigForm";

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/stats")
            .then(res => res.json())
            .then(data => setStatsData(data))
            .catch(err => console.error("Failed to fetch stats:", err));
    }, []);

    const stats = [
        {
            label: "Total Residents",
            value: statsData?.totalUsers?.toString() || "...",
            change: "Across all blocks",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Occupied Units",
            value: statsData?.totalProperties?.toString() || "...",
            change: statsData?.maxProperties ? `${Math.round((statsData.totalProperties / statsData.maxProperties) * 100)}% Capacity` : "No limit set",
            icon: Building,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Total Units Limit",
            value: statsData?.maxProperties?.toString() || "None",
            change: `${statsData?.maxProperties - statsData?.totalProperties || 0} slots remaining`,
            icon: Activity,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            label: "Blocks Configured",
            value: statsData?.numberOfBlocks?.toString() || "0",
            change: `w/ ${statsData?.numberOfFloors || 0} floors each`,
            icon: Shield,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Super Admin Overview
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Global system insights and platform performance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
                        Last updated: Just now
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    {stat.change.split(' ')[0]}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{stat.value}</h3>
                                <p className="text-gray-400 text-xs mt-1">{stat.change}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Configuration Section */}
            <ApartmentConfigForm />

            {/* Analytics Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-gray-500" />
                        Revenue Growth
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">Chart Visualization Placeholder</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">System Health</h3>
                    <div className="space-y-6">
                        {[
                            { label: "Database Connection", status: "Operational", color: "bg-green-500" },
                            { label: "API Latency", status: "45ms", color: "bg-green-500" },
                            { label: "Storage Usage", status: "24%", color: "bg-blue-500" },
                            { label: "Email Service", status: "Operational", color: "bg-green-500" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{item.status}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
                        View System Logs
                    </button>
                </div>
            </div>
        </div>
    );
}
