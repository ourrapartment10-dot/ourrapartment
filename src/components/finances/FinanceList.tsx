import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Calendar, Tag, User, ReceiptText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Finance {
  id: string;
  amount: number;
  category: string;
  description?: string;
  date: Date;
  recordedBy: {
    name: string;
    email: string;
  };
}

interface FinanceFilters {
  category: string;
  startDate: string;
  endDate: string;
  [key: string]: string;
}

interface FinanceListProps {
  finances: Finance[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onEdit: (finance: Finance) => void;
  onDelete: (id: string) => void;
  userRole?: string;
  filters: FinanceFilters;
  onFilterChange: (filters: FinanceFilters) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'security', label: 'Security' },
  { value: 'water', label: 'Water' },
  { value: 'rent', label: 'Rent' },
  { value: 'event', label: 'Event' },
  { value: 'salary', label: 'Salary' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'other_expense', label: 'Other Expense' },
];

export function FinanceList({
  finances,
  loading,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  onEdit,
  onDelete,
  userRole,
  filters,
  onFilterChange,
}: FinanceListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  return (
    <div className="space-y-8">
      {/* Filter Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-slate-900 p-3 shadow-lg">
            <ReceiptText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-900">
              Transaction History
            </h3>
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Recent Expenses
            </p>
          </div>
        </div>

        <div className="w-full md:w-[250px]">
          <Select
            value={filters.category || 'all'}
            onValueChange={(val: string) =>
              onFilterChange({ ...filters, category: val })
            }
          >
            <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-white/50 font-bold text-slate-600 backdrop-blur-sm focus:ring-slate-200">
              <SelectValue placeholder="Filter Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              {CATEGORIES.map((c) => (
                <SelectItem
                  key={c.value}
                  value={c.value}
                  className="font-bold text-slate-600 focus:bg-slate-50"
                >
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Date
              </TableHead>
              <TableHead className="py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Category
              </TableHead>
              <TableHead className="py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Description
              </TableHead>
              <TableHead className="py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Amount
              </TableHead>
              <TableHead className="hidden py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase md:table-cell">
                Recorded By
              </TableHead>
              {isAdmin && (
                <TableHead className="py-5 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      <span className="text-xs font-black tracking-widest uppercase">
                        Syncing...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : finances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <ReceiptText className="h-10 w-10" />
                      <span className="text-xs font-black tracking-widest uppercase">
                        No Records Found
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                finances.map((finance, idx) => (
                  <motion.tr
                    key={finance.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group border-b border-slate-50 transition-colors hover:bg-slate-50/30"
                  >
                    <TableCell className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2 text-slate-400 transition-colors group-hover:bg-white group-hover:text-slate-900">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-600">
                          {format(new Date(finance.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-xl border-slate-100 bg-white px-4 py-1.5 text-[10px] font-bold tracking-widest text-slate-600 uppercase shadow-sm"
                      >
                        {finance.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <span className="font-semibold text-slate-500 italic">
                        {finance.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-lg font-[900] tracking-tighter text-rose-600">
                        -{formatCurrency(finance.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-black text-indigo-600 uppercase">
                          {finance.recordedBy?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs leading-none font-bold text-slate-900">
                            {finance.recordedBy?.name || 'Unknown'}
                          </span>
                          <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                            Operator
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(finance)}
                            className="h-9 w-9 rounded-xl border border-slate-100 bg-white text-indigo-500 shadow-sm hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(finance.id)}
                            className="h-9 w-9 rounded-xl border border-slate-100 bg-white text-rose-500 shadow-sm hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-3 py-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-2xl border-slate-100 px-6 font-bold shadow-sm hover:bg-slate-50"
          >
            Prev
          </Button>
          <div className="rounded-2xl bg-slate-900 px-6 py-2 text-[10px] font-black tracking-[0.2em] text-white uppercase shadow-lg shadow-slate-200">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-2xl border-slate-100 px-6 font-bold shadow-sm hover:bg-slate-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
