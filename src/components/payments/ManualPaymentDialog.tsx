import { useState } from 'react';
import { X, AlertCircle, Banknote, Receipt } from 'lucide-react';

interface ManualPaymentDialogProps {
  payment: any;
  onClose: () => void;
  onSubmit: (paymentId: string, data: any) => Promise<void>;
}

export default function ManualPaymentDialog({
  payment,
  onClose,
  onSubmit,
}: ManualPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    paymentMethod: 'BANK_TRANSFER',
    transactionId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(payment.id, {
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || null,
        status: 'PENDING_VERIFICATION',
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl duration-300">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-[900] tracking-tight text-gray-900">
                Manual Payment
              </h2>
              <p className="text-xs font-medium text-gray-500">
                Submit offline payment details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Amount Card */}
            <div className="rounded-2xl bg-slate-900 p-6 text-center shadow-lg shadow-slate-900/10">
              <p className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                Total Due
              </p>
              <p className="text-3xl font-[900] tracking-tight text-white">
                {formatCurrency(payment.amount)}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {payment.description}
              </p>
            </div>

            <div className="flex items-start rounded-xl border border-amber-100 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed font-medium text-amber-800">
                Payments submitted here require admin approval. Status will show
                as "Pending Verification" until approved.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                  Payment Method
                </label>
                <select
                  value={data.paymentMethod}
                  onChange={(e) =>
                    setData({ ...data, paymentMethod: e.target.value })
                  }
                  className="block h-12 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 transition-all outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Other Online</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                  Transaction ID / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={data.transactionId}
                  onChange={(e) =>
                    setData({ ...data, transactionId: e.target.value })
                  }
                  className="block h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  placeholder="e.g. UTR12345678 or 'Paid to Admin'"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-0.5 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
