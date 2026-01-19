'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Get first day to show (start of week containing first day of month)
  const firstDayToShow = new Date(firstDayOfMonth);
  firstDayToShow.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  // Get last day to show (end of week containing last day of month)
  const lastDayToShow = new Date(lastDayOfMonth);
  lastDayToShow.setDate(
    lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay())
  );

  // Group payments by date
  const paymentsByDate = useMemo(() => {
    const grouped: Record<
      string,
      (Payment & { calendarType: 'due' | 'paid' })[]
    > = {};

    payments.forEach((payment) => {
      const isPaid =
        payment.status?.toUpperCase() === 'COMPLETED' ||
        payment.status?.toUpperCase() === 'PAID';
      // Check paidDate (from API likely) or paidAt (from interface definition)
      const paidDateStr = payment.paidDate || payment.paidAt;

      const targetDateStr = isPaid ? paidDateStr : payment.dueDate;

      if (!targetDateStr) return;

      const targetDate = new Date(targetDateStr);
      const dateKey = targetDate.toDateString();

      if (!grouped[dateKey]) grouped[dateKey] = [];

      grouped[dateKey].push({
        ...payment,
        calendarType: isPaid ? 'paid' : 'due',
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
    setCurrentDate((prev) => {
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
    year: 'numeric',
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-3 shadow-sm sm:p-6">
      {/* Calendar Header */}
      <div className="mb-4 flex flex-col space-y-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {monthYear}
          </h2>
          <button
            onClick={goToToday}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 sm:text-sm"
          >
            Today
          </button>
        </div>

        <div className="flex items-center justify-between space-x-2 sm:justify-end">
          <div className="flex items-center rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="rounded-md p-2 text-slate-600 transition-all hover:bg-white hover:shadow-sm"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="rounded-md p-2 text-slate-600 transition-all hover:bg-white hover:shadow-sm"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') &&
            onCreatePayment && (
              <button
                onClick={onCreatePayment}
                className="ml-2 inline-flex items-center rounded-xl border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-200 transition-colors hover:bg-slate-800 sm:ml-4"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Add Payment</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-semibold tracking-wider text-slate-500 uppercase sm:p-4 sm:text-sm"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.substr(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {calendarDays.map((date, index) => {
            const dateKey = date.toDateString();
            const dayPayments = paymentsByDate[dateKey] || [];
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[5rem] bg-white p-1 transition-colors sm:min-h-[8rem] sm:p-2',
                  !isCurrentMonthDay && 'bg-slate-50/50',
                  isTodayDate && 'bg-blue-50/30'
                )}
              >
                {/* Date Number */}
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-7 sm:w-7 sm:text-sm',
                      !isCurrentMonthDay ? 'text-slate-400' : 'text-slate-700',
                      isTodayDate && 'bg-blue-600 font-bold text-white'
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* Payments */}
                <div className="space-y-1">
                  {dayPayments
                    .slice(0, isMobile ? 1 : 3)
                    .map((payment, idx) => (
                      <div
                        key={`${payment.id}-${payment.calendarType}-${idx}`}
                        onClick={() =>
                          onPaymentClick && onPaymentClick(payment)
                        }
                        className={cn(
                          'cursor-pointer rounded-lg border p-1 text-[10px] transition-all hover:shadow-md sm:p-1.5 sm:text-xs',
                          getPaymentColor(payment)
                        )}
                        title={`${payment.type || 'Payment'} - ${formatCurrency(payment.amount)} (${payment.calendarType === 'paid' ? 'Paid' : payment.status})`}
                      >
                        <div className="mb-0.5 truncate leading-tight font-semibold">
                          <span className="hidden sm:inline">
                            {payment.type || payment.paymentType || 'Payment'}
                          </span>
                          <span className="sm:hidden">
                            {(
                              payment.type ||
                              payment.paymentType ||
                              'Payment'
                            ).substr(0, 8)}
                            ...
                          </span>
                        </div>
                        <div className="flex items-center justify-between opacity-85">
                          <span className="max-w-[60%] truncate leading-tight">
                            {payment.user?.name ||
                              payment.userName ||
                              'Unknown'}
                          </span>
                          <span className="leading-tight font-bold">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Show +X more indicator if there are more payments */}
                  {dayPayments.length > (isMobile ? 1 : 3) && (
                    <div className="py-0.5 text-center text-[10px] font-medium text-slate-500">
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
        <div className="flex items-center rounded-full border border-green-100 bg-green-50 px-3 py-1.5">
          <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
          <span className="font-medium text-green-800">Paid/Completed</span>
        </div>
        <div className="flex items-center rounded-full border border-yellow-100 bg-yellow-50 px-3 py-1.5">
          <div className="mr-2 h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
          <span className="font-medium text-yellow-800">Pending</span>
        </div>
        <div className="flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1.5">
          <div className="mr-2 h-2.5 w-2.5 rounded-full bg-red-500"></div>
          <span className="font-medium text-red-800">Overdue</span>
        </div>
        <div className="flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
          <div className="mr-2 h-2.5 w-2.5 rounded-full bg-blue-500"></div>
          <span className="font-medium text-blue-800">Today</span>
        </div>
      </div>

      {/* Empty State */}
      {payments.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <CalendarIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No payments to display
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-slate-500">
            Payments will appear on this calendar based on their due dates and
            payment dates.
          </p>
        </div>
      )}
    </div>
  );
}
