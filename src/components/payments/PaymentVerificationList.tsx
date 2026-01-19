import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, X, Clock, AlertOctagon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentVerificationListProps {
  onVerificationComplete: () => void;
}

export default function PaymentVerificationList({
  onVerificationComplete,
}: PaymentVerificationListProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/pending-verification');
      const data = await res.json();
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (
    paymentId: string,
    action: 'APPROVE' | 'REJECT'
  ) => {
    setProcessingId(paymentId);
    try {
      const status = action === 'APPROVE' ? 'COMPLETED' : 'FAILED';

      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(
        `Payment ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`
      );
      fetchQueue();
      onVerificationComplete();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading)
    return (
      <div className="animate-pulse p-8 text-center font-medium text-purple-600">
        Checking for pending claims...
      </div>
    );

  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-purple-100 bg-white/50 p-8 text-center">
        <AlertOctagon className="mx-auto mb-2 h-8 w-8 text-purple-300" />
        <p className="font-medium text-purple-800">
          No pending verifications found.
        </p>
        <p className="text-xs text-purple-500">
          All manual payment claims have been processed.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="group relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <div className="-mt-10 -mr-10 h-24 w-24 rounded-full bg-purple-600 blur-2xl"></div>
          </div>

          <div className="relative mb-4 flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                Resident
              </p>
              <p className="font-bold text-slate-900">{payment.user.name}</p>
              <p className="text-xs text-slate-500">
                {payment.user.property?.unitNumber || 'No Unit'}
              </p>
            </div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-black tracking-wider text-purple-700 uppercase">
              Manual
            </span>
          </div>

          <div className="relative mb-6 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-50 py-2">
              <span className="text-sm font-medium text-slate-500">Amount</span>
              <span className="text-lg font-[900] text-slate-900">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-medium text-slate-500">Method</span>
              <span className="text-xs font-bold text-slate-700">
                {payment.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-medium text-slate-500">
                Reference
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                {payment.transactionId || 'N/A'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
              <Clock className="h-3 w-3" />
              Submitted {format(new Date(payment.updatedAt), 'MMM d, h:mm a')}
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction(payment.id, 'REJECT')}
              disabled={processingId === payment.id}
              className="flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              <X className="mr-1.5 h-4 w-4" />
              Reject
            </button>
            <button
              onClick={() => handleAction(payment.id, 'APPROVE')}
              disabled={processingId === payment.id}
              className="flex items-center justify-center rounded-xl bg-purple-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-0.5 hover:bg-purple-700 disabled:opacity-50"
            >
              <Check className="mr-1.5 h-4 w-4" />
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
