import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FinanceStatsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export function FinanceStats({
  totalIncome,
  totalExpenses,
  netBalance,
}: FinanceStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Income',
      value: totalIncome,
      desc: 'From verified payments',
      icon: TrendingUp,
      actionIcon: ArrowUpRight,
      color: 'emerald',
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      desc: 'Recorded community spending',
      icon: TrendingDown,
      actionIcon: ArrowDownRight,
      color: 'rose',
      gradient: 'from-rose-500/10 to-rose-500/5',
      border: 'border-rose-100',
      text: 'text-rose-600',
    },
    {
      title: 'Net Balance',
      value: netBalance,
      desc: 'Available community funds',
      icon: Wallet,
      actionIcon: CreditCard,
      color: 'indigo',
      gradient: 'from-indigo-500/10 to-indigo-500/5',
      border: 'border-indigo-100',
      text: 'text-indigo-600',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * index }}
        >
          <Card
            className={cn(
              'group relative overflow-hidden border-none bg-white/70 shadow-2xl shadow-slate-200/50 backdrop-blur-xl',
              'hover:shadow-3xl transition-all duration-500'
            )}
          >
            {/* Decorative Gradient Background */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                stat.gradient
              )}
            />

            <CardContent className="relative space-y-4 p-8">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'rounded-[1.2rem] bg-slate-50 p-4 shadow-sm transition-colors duration-500 group-hover:bg-white',
                    stat.text
                  )}
                >
                  <stat.icon className="h-6 w-6 stroke-[2.5]" />
                </div>
                <stat.actionIcon className="h-5 w-5 text-slate-300 transition-colors group-hover:text-slate-900" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                  {stat.title}
                </p>
                <h3
                  className={cn(
                    'text-4xl font-[900] tracking-tighter',
                    stat.text
                  )}
                >
                  {formatCurrency(stat.value)}
                </h3>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    stat.text.replace('text', 'bg')
                  )}
                />
                <p className="text-xs font-semibold text-slate-500 italic">
                  {stat.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
