import { RotateCcw, Filter } from "lucide-react";

interface PaymentFiltersProps {
    filters: {
        status: string;
        type: string;
        startDate: string;
        endDate: string;
    };
    onFilterChange: (filters: any) => void;
    onReset: () => void;
}

export default function PaymentFilters({ filters, onFilterChange, onReset }: PaymentFiltersProps) {
    const paymentStatuses = ['PENDING', 'PENDING_VERIFICATION', 'COMPLETED', 'FAILED', 'REFUNDED'];
    const paymentTypes = ['MAINTENANCE', 'FACILITY', 'EVENT', 'OTHER'];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filter Records</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Status Filter */}
                <div className="relative group">
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ status: e.target.value })}
                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all cursor-pointer hover:bg-slate-50"
                    >
                        <option value="">All Statuses</option>
                        {paymentStatuses.map(status => (
                            <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* Type Filter */}
                <div className="relative group">
                    <select
                        value={filters.type}
                        onChange={(e) => onFilterChange({ type: e.target.value })}
                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all cursor-pointer hover:bg-slate-50"
                    >
                        <option value="">All Types</option>
                        {paymentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Date Range Start */}
                <div className="relative">
                    <span className="absolute top-[-8px] left-4 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">From</span>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => onFilterChange({ startDate: e.target.value })}
                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Date Range End */}
                <div className="relative">
                    <span className="absolute top-[-8px] left-4 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</span>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => onFilterChange({ endDate: e.target.value })}
                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Reset Action */}
                <button
                    onClick={onReset}
                    className="w-full h-12 inline-flex justify-center items-center px-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs hover:bg-black transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/10"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    RESET
                </button>
            </div>
        </div>
    );
}
