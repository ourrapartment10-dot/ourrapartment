import { DollarSign, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

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
            maximumFractionDigits: 0
        }).format(amount);
    };

    const pendingStats = statistics.statusBreakdown.find(s => s.status === 'PENDING') || { count: 0, amount: 0 };
    const completedStats = statistics.statusBreakdown.find(s => s.status === 'COMPLETED') || { count: 0, amount: 0 };
    const verificationStats = statistics.statusBreakdown.find(s => s.status === 'PENDING_VERIFICATION') || { count: 0, amount: 0 };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Collected */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <DollarSign className="h-7 w-7" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collected (Mo)</p>
                    <p className="text-2xl font-[900] text-slate-900">{formatCurrency(statistics.monthlyTotal)}</p>
                </div>
            </div>

            {/* Pending */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertCircle className="h-7 w-7" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pending</p>
                    <p className="text-2xl font-[900] text-slate-900">{formatCurrency(pendingStats.amount)}</p>
                    <p className="text-xs font-bold text-amber-600">{pendingStats.count} requests</p>
                </div>
            </div>

            {/* Completed */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle className="h-7 w-7" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
                    <p className="text-2xl font-[900] text-slate-900">{formatCurrency(completedStats.amount)}</p>
                    <p className="text-xs font-bold text-emerald-600">{completedStats.count} paid</p>
                </div>
            </div>

            {/* To Verify (Conditional or always?) - Keep conditional to save space or layout balance? */}
            {/* If verifying is 0, we can show total records or something else? Or just hide. 4th slot nice for grid. */}
            {/* Let's show total requests processed instead */}
            <div className={cn(
                "bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm flex items-center gap-4",
                verificationStats.count > 0 && "ring-2 ring-purple-500/20 bg-purple-50/50"
            )}>
                <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
                    verificationStats.count > 0 ? "bg-purple-100 text-purple-600" : "bg-slate-50 text-slate-400"
                )}>
                    <FileText className="h-7 w-7" />
                </div>
                <div>
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        verificationStats.count > 0 ? "text-purple-600" : "text-slate-400"
                    )}>
                        Needs Action
                    </p>
                    <p className="text-2xl font-[900] text-slate-900">{verificationStats.count}</p>
                    <p className="text-xs font-medium text-slate-400">Manual Claims</p>
                </div>
            </div>
        </div>
    );
}
