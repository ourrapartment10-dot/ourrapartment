'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import {
  Users,
  Building,
  Shield,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { ApartmentConfigForm } from '@/components/admin/ApartmentConfigForm';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStatsData(data))
      .catch((err) => console.error('Failed to fetch stats:', err));
  }, []);

  const stats = [
    {
      label: 'Total Residents',
      value: statsData?.totalUsers?.toString() || '...',
      change: 'Across all blocks',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Occupied Units',
      value: statsData?.totalProperties?.toString() || '...',
      change: statsData?.maxProperties
        ? `${Math.round((statsData.totalProperties / statsData.maxProperties) * 100)}% Capacity`
        : 'No limit set',
      icon: Building,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Units Limit',
      value: statsData?.maxProperties?.toString() || 'None',
      change: `${statsData?.maxProperties - statsData?.totalProperties || 0} slots remaining`,
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Blocks Configured',
      value: statsData?.numberOfBlocks?.toString() || '0',
      change: `w/ ${statsData?.numberOfFloors || 0} floors each`,
      icon: Shield,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Super Admin Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Global system insights and platform performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
            Last updated: Just now
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`rounded-xl p-3 ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  {stat.change.split(' ')[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <h3 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                  {stat.value}
                </h3>
                <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Section */}
      <ApartmentConfigForm />

      {/* Analytics Placeholder */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            Revenue Growth
          </h3>
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-400">
              Chart Visualization Placeholder
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">
            System Health
          </h3>
          <div className="space-y-6">
            {[
              {
                label: 'Database Connection',
                status: 'Operational',
                color: 'bg-green-500',
              },
              { label: 'API Latency', status: '45ms', color: 'bg-green-500' },
              { label: 'Storage Usage', status: '24%', color: 'bg-blue-500' },
              {
                label: 'Email Service',
                status: 'Operational',
                color: 'bg-green-500',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <span className="rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-900">
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-gray-800">
            View System Logs
          </button>
        </div>
      </div>
    </div>
  );
}
