import { RotateCcw, Filter } from 'lucide-react';

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

export default function PaymentFilters({
  filters,
  onFilterChange,
  onReset,
}: PaymentFiltersProps) {
  const paymentStatuses = [
    'PENDING',
    'PENDING_VERIFICATION',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
  ];
  const paymentTypes = ['MAINTENANCE', 'FACILITY', 'EVENT', 'OTHER'];

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
          Filter Records
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Status Filter */}
        <div className="group relative">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="h-12 w-full cursor-pointer appearance-none rounded-[1.5rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all outline-none hover:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Statuses</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="group relative">
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            className="h-12 w-full cursor-pointer appearance-none rounded-[1.5rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all outline-none hover:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Types</option>
            {paymentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Start */}
        <div className="relative">
          <span className="absolute top-[-8px] left-4 bg-white px-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            From
          </span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="h-12 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Date Range End */}
        <div className="relative">
          <span className="absolute top-[-8px] left-4 bg-white px-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            To
          </span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="h-12 w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Reset Action */}
        <button
          onClick={onReset}
          className="inline-flex h-12 w-full items-center justify-center rounded-[1.5rem] bg-slate-900 px-4 text-xs font-black text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          RESET
        </button>
      </div>
    </div>
  );
}
