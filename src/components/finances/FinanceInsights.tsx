import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Finance {
  category: string;
  amount: number;
}

interface FinanceInsightsProps {
  finances: Finance[];
  totalIncome: number;
  totalExpenses: number;
}

export function FinanceInsights({
  finances,
  totalIncome,
  totalExpenses,
}: FinanceInsightsProps) {
  const insights = [];

  const ratio = totalIncome > 0 ? totalExpenses / totalIncome : 1;

  if (totalExpenses > totalIncome) {
    insights.push({
      type: 'warning',
      title: 'Critical Overspending',
      text: 'Expenses currently exceed community income. Review maintenance costs or pending residents dues.',
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    });
  } else if (ratio > 0.8) {
    insights.push({
      type: 'caution',
      title: 'Low Reserve Buffer',
      text: 'Community is spending over 80% of its income. Consider building a larger emergency fund.',
      icon: Info,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    });
  } else {
    insights.push({
      type: 'positive',
      title: 'Excellent Cash Flow',
      text: 'Financial reserves are growing steadily. Community funds are in a very healthy state.',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    });
  }

  const categoryTotals: Record<string, number> = {};
  finances.forEach((f) => {
    categoryTotals[f.category] = (categoryTotals[f.category] || 0) + f.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort(
    ([, a], [, b]) => b - a
  )[0];
  if (topCategory) {
    insights.push({
      type: 'info',
      title: 'Spending Highlight',
      text: `${topCategory[0].replace('_', ' ')} is your highest expense at ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(topCategory[1])}.`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    });
  }

  return (
    <Card className="overflow-hidden rounded-[2.5rem] border-none bg-white/70 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
      <CardHeader className="p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tighter text-slate-900">
              <Sparkles className="h-6 w-6 fill-amber-500 text-amber-500" />
              AI Insights
            </CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Intelligent financial breakdown
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={cn(
                'cursor-default rounded-3xl border p-5 transition-all hover:scale-[1.02]',
                insight.bg,
                insight.border
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'mt-1 shrink-0 rounded-xl bg-white p-2 shadow-sm',
                    insight.color
                  )}
                >
                  <insight.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4
                    className={cn(
                      'text-sm font-black tracking-[0.1em] uppercase',
                      insight.color
                    )}
                  >
                    {insight.title}
                  </h4>
                  <p className="text-[13px] leading-relaxed font-semibold text-slate-600">
                    {insight.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {insights.length === 0 && (
            <div className="py-10 text-center">
              <Lightbulb className="mx-auto mb-4 h-12 w-12 text-slate-200" />
              <p className="text-sm font-bold tracking-tight text-slate-400 capitalize">
                More data needed for analysis
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
