import { DollarSign, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsProps {
  statistics: {
    monthlyTotal: number;
    monthlyCount: number;
    statusBreakdown: Array<{ status: string; amount: number; count: number }>;
    typeBreakdown: Array<{ type: string; amount: number; count: number }>;
  };
}

export default function PaymentStats({ statistics }: StatsProps) {
  if (!statistics) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const pendingStats = statistics.statusBreakdown.find(
    (s) => s.status === 'PENDING'
  ) || { count: 0, amount: 0 };
  const completedStats = statistics.statusBreakdown.find(
    (s) => s.status === 'COMPLETED'
  ) || { count: 0, amount: 0 };
  const verificationStats = statistics.statusBreakdown.find(
    (s) => s.status === 'PENDING_VERIFICATION'
  ) || { count: 0, amount: 0 };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
      {/* Collected */}
      <div className="flex items-center gap-4 rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <DollarSign className="h-7 w-7" />
        </div>
        <div>
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Collected (Mo)
          </p>
          <p className="text-2xl font-[900] text-slate-900">
            {formatCurrency(statistics.monthlyTotal)}
          </p>
        </div>
      </div>

      {/* Pending */}
      <div className="flex items-center gap-4 rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div>
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Total Pending
          </p>
          <p className="text-2xl font-[900] text-slate-900">
            {formatCurrency(pendingStats.amount)}
          </p>
          <p className="text-xs font-bold text-amber-600">
            {pendingStats.count} requests
          </p>
        </div>
      </div>

      {/* Completed */}
      <div className="flex items-center gap-4 rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle className="h-7 w-7" />
        </div>
        <div>
          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Completed
          </p>
          <p className="text-2xl font-[900] text-slate-900">
            {formatCurrency(completedStats.amount)}
          </p>
          <p className="text-xs font-bold text-emerald-600">
            {completedStats.count} paid
          </p>
        </div>
      </div>

      {/* To Verify (Conditional or always?) - Keep conditional to save space or layout balance? */}
      {/* If verifying is 0, we can show total records or something else? Or just hide. 4th slot nice for grid. */}
      {/* Let's show total requests processed instead */}
      <div
        className={cn(
          'flex items-center gap-4 rounded-[2rem] border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-md',
          verificationStats.count > 0 &&
            'bg-purple-50/50 ring-2 ring-purple-500/20'
        )}
      >
        <div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
            verificationStats.count > 0
              ? 'bg-purple-100 text-purple-600'
              : 'bg-slate-50 text-slate-400'
          )}
        >
          <FileText className="h-7 w-7" />
        </div>
        <div>
          <p
            className={cn(
              'text-[10px] font-black tracking-widest uppercase',
              verificationStats.count > 0 ? 'text-purple-600' : 'text-slate-400'
            )}
          >
            Needs Action
          </p>
          <p className="text-2xl font-[900] text-slate-900">
            {verificationStats.count}
          </p>
          <p className="text-xs font-medium text-slate-400">Manual Claims</p>
        </div>
      </div>
    </div>
  );
}
