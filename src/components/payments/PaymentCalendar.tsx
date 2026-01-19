"use client";

import { useState, useMemo, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
    id: string;
    amount: number;
    status: string;
    type?: string;
    paymentType?: string; // In case API returns enum or object
    description?: string;
    date?: string;
    dueDate?: string | Date;
    paidAt?: string | Date; // created_at or paid_date
    paidDate?: string | Date; // alternative field from key
    createdAt?: string | Date;
    user?: {
        name: string;
        email?: string;
    };
    userName?: string; // fallback
}

interface PaymentCalendarProps {
    payments?: Payment[];
    onPaymentClick?: (payment: Payment) => void;
    onCreatePayment?: () => void;
    userRole?: string;
}

export default function PaymentCalendar({
    payments = [],
    onPaymentClick,
    onCreatePayment,
    userRole,
}: PaymentCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);

    // Handle mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Get first day of current month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get first day to show (start of week containing first day of month)
    const firstDayToShow = new Date(firstDayOfMonth);
    firstDayToShow.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    // Get last day to show (end of week containing last day of month)
    const lastDayToShow = new Date(lastDayOfMonth);
    lastDayToShow.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

    // Group payments by date
    const paymentsByDate = useMemo(() => {
        const grouped: Record<string, (Payment & { calendarType: 'due' | 'paid' })[]> = {};

        payments.forEach(payment => {
            const isPaid = payment.status?.toUpperCase() === 'COMPLETED' || payment.status?.toUpperCase() === 'PAID';
            // Check paidDate (from API likely) or paidAt (from interface definition)
            const paidDateStr = payment.paidDate || payment.paidAt;

            const targetDateStr = isPaid ? paidDateStr : payment.dueDate;

            if (!targetDateStr) return;

            const targetDate = new Date(targetDateStr);
            const dateKey = targetDate.toDateString();

            if (!grouped[dateKey]) grouped[dateKey] = [];

            grouped[dateKey].push({
                ...payment,
                calendarType: isPaid ? 'paid' : 'due'
            });
        });

        return grouped;
    }, [payments]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const days: Date[] = [];
        const current = new Date(firstDayToShow);

        while (current <= lastDayToShow) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    }, [firstDayToShow, lastDayToShow]);

    const navigateMonth = (direction: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getPaymentColor = (payment: Payment & { calendarType: string }) => {
        if (payment.calendarType === 'paid') {
            return 'bg-green-100 text-green-800 border-green-200';
        }

        switch (payment.status?.toLowerCase()) {
            case 'completed':
            case 'paid':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'overdue':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const monthYear = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-3 sm:p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            {/* Calendar Header */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{monthYear}</h2>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 text-xs sm:text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 font-medium transition-colors"
                    >
                        Today
                    </button>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600"
                        >
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600"
                        >
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                    </div>

                    {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && onCreatePayment && (
                        <button
                            onClick={onCreatePayment}
                            className="ml-2 sm:ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            <span className="hidden sm:inline">Add Payment</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {/* Week Day Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
                    {weekDays.map(day => (
                        <div key={day} className="p-2 sm:p-4 text-center text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.substr(0, 1)}</span>
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 bg-slate-200 gap-px">
                    {calendarDays.map((date, index) => {
                        const dateKey = date.toDateString();
                        const dayPayments = paymentsByDate[dateKey] || [];
                        const isCurrentMonthDay = isCurrentMonth(date);
                        const isTodayDate = isToday(date);

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "min-h-[5rem] sm:min-h-[8rem] bg-white p-1 sm:p-2 transition-colors",
                                    !isCurrentMonthDay && "bg-slate-50/50",
                                    isTodayDate && "bg-blue-50/30"
                                )}
                            >
                                {/* Date Number */}
                                <div className="flex items-center justify-between mb-1">
                                    <span
                                        className={cn(
                                            "text-xs sm:text-sm font-medium rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center",
                                            !isCurrentMonthDay ? "text-slate-400" : "text-slate-700",
                                            isTodayDate && "bg-blue-600 text-white font-bold"
                                        )}
                                    >
                                        {date.getDate()}
                                    </span>
                                </div>

                                {/* Payments */}
                                <div className="space-y-1">
                                    {dayPayments.slice(0, isMobile ? 1 : 3).map((payment, idx) => (
                                        <div
                                            key={`${payment.id}-${payment.calendarType}-${idx}`}
                                            onClick={() => onPaymentClick && onPaymentClick(payment)}
                                            className={cn(
                                                "text-[10px] sm:text-xs p-1 sm:p-1.5 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                                                getPaymentColor(payment)
                                            )}
                                            title={`${payment.type || 'Payment'} - ${formatCurrency(payment.amount)} (${payment.calendarType === 'paid' ? 'Paid' : payment.status})`}
                                        >
                                            <div className="truncate font-semibold leading-tight mb-0.5">
                                                <span className="hidden sm:inline">{payment.type || payment.paymentType || 'Payment'}</span>
                                                <span className="sm:hidden">{(payment.type || payment.paymentType || 'Payment').substr(0, 8)}...</span>
                                            </div>
                                            <div className="flex items-center justify-between opacity-85">
                                                <span className="truncate leading-tight max-w-[60%]">
                                                    {payment.user?.name || payment.userName || 'Unknown'}
                                                </span>
                                                <span className="font-bold leading-tight">
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Show +X more indicator if there are more payments */}
                                    {dayPayments.length > (isMobile ? 1 : 3) && (
                                        <div className="text-[10px] text-slate-500 text-center py-0.5 font-medium">
                                            +{dayPayments.length - (isMobile ? 1 : 3)} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm">
                <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-800 font-medium">Paid/Completed</span>
                </div>
                <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-yellow-800 font-medium">Pending</span>
                </div>
                <div className="flex items-center bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-red-800 font-medium">Overdue</span>
                </div>
                <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-blue-800 font-medium">Today</span>
                </div>
            </div>

            {/* Empty State */}
            {payments.length === 0 && (
                <div className="text-center py-16">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No payments to display</h3>
                    <p className="mt-1 text-slate-500 max-w-sm mx-auto">
                        Payments will appear on this calendar based on their due dates and payment dates.
                    </p>
                </div>
            )}
        </div>
    );
}
