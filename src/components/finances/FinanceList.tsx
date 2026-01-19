
import React from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, Tag, User, ReceiptText } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    { value: "all", label: "All Categories" },
    { value: "electricity", label: "Electricity" },
    { value: "cleaning", label: "Cleaning" },
    { value: "maintenance", label: "Maintenance" },
    { value: "security", label: "Security" },
    { value: "water", label: "Water" },
    { value: "rent", label: "Rent" },
    { value: "event", label: "Event" },
    { value: "salary", label: "Salary" },
    { value: "subscription", label: "Subscription" },
    { value: "other_expense", label: "Other Expense" },
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
    onFilterChange
}: FinanceListProps) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    return (
        <div className="space-y-8">
            {/* Filter Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
                        <ReceiptText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900">Transaction History</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Expenses</p>
                    </div>
                </div>

                <div className="w-full md:w-[250px]">
                    <Select
                        value={filters.category || "all"}
                        onValueChange={(val: string) => onFilterChange({ ...filters, category: val })}
                    >
                        <SelectTrigger className="rounded-2xl border-slate-100 bg-white/50 backdrop-blur-sm h-12 font-bold text-slate-600 focus:ring-slate-200">
                            <SelectValue placeholder="Filter Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100">
                            {CATEGORIES.map(c => (
                                <SelectItem key={c.value} value={c.value} className="font-bold text-slate-600 focus:bg-slate-50">
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
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Date</TableHead>
                            <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Category</TableHead>
                            <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Description</TableHead>
                            <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Amount</TableHead>
                            <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 hidden md:table-cell">Recorded By</TableHead>
                            {isAdmin && (
                                <TableHead className="py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                            <div className="w-8 h-8 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                                            <span className="text-xs font-black uppercase tracking-widest">Syncing...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : finances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="opacity-30 flex flex-col items-center gap-2">
                                            <ReceiptText className="w-10 h-10" />
                                            <span className="text-xs font-black uppercase tracking-widest">No Records Found</span>
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
                                        className="group border-b border-slate-50 hover:bg-slate-50/30 transition-colors"
                                    >
                                        <TableCell className="py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-slate-600">
                                                    {format(new Date(finance.date), "MMM dd, yyyy")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-xl px-4 py-1.5 border-slate-100 bg-white shadow-sm font-bold text-[10px] uppercase tracking-widest text-slate-600">
                                                {finance.category.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            <span className="font-semibold text-slate-500 italic">
                                                {finance.description || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-lg font-[900] tracking-tighter text-rose-600">
                                                -{formatCurrency(finance.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black uppercase">
                                                    {finance.recordedBy?.name?.charAt(0) || "U"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900 leading-none">{finance.recordedBy?.name || "Unknown"}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Operator</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit(finance)}
                                                        className="h-9 w-9 bg-white shadow-sm border border-slate-100 rounded-xl text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onDelete(finance.id)}
                                                        className="h-9 w-9 bg-white shadow-sm border border-slate-100 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50"
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
                        className="rounded-2xl border-slate-100 font-bold px-6 shadow-sm hover:bg-slate-50"
                    >
                        Prev
                    </Button>
                    <div className="px-6 py-2 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-slate-200">
                        {currentPage} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded-2xl border-slate-100 font-bold px-6 shadow-sm hover:bg-slate-50"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
