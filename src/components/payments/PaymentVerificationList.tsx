import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Check, X, Clock, AlertOctagon } from "lucide-react";
import { toast } from "react-hot-toast";

interface PaymentVerificationListProps {
    onVerificationComplete: () => void;
}

export default function PaymentVerificationList({ onVerificationComplete }: PaymentVerificationListProps) {
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

    const handleAction = async (paymentId: string, action: 'APPROVE' | 'REJECT') => {
        setProcessingId(paymentId);
        try {
            const status = action === 'APPROVE' ? 'COMPLETED' : 'FAILED';

            const res = await fetch(`/api/payments/${paymentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error("Failed to update status");

            toast.success(`Payment ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`);
            fetchQueue();
            onVerificationComplete();
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) return <div className="p-8 text-center text-purple-600 font-medium animate-pulse">Checking for pending claims...</div>;

    if (payments.length === 0) {
        return (
            <div className="p-8 text-center bg-white/50 rounded-2xl border border-purple-100 border-dashed">
                <AlertOctagon className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <p className="text-purple-800 font-medium">No pending verifications found.</p>
                <p className="text-purple-500 text-xs">All manual payment claims have been processed.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <div className="w-24 h-24 bg-purple-600 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    </div>

                    <div className="flex justify-between items-start mb-4 relative">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Resident</p>
                            <p className="font-bold text-slate-900">{payment.user.name}</p>
                            <p className="text-xs text-slate-500">{payment.user.property?.unitNumber || "No Unit"}</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                            Manual
                        </span>
                    </div>

                    <div className="space-y-3 mb-6 relative">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm font-medium text-slate-500">Amount</span>
                            <span className="text-lg font-[900] text-slate-900">{formatCurrency(payment.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-medium text-slate-500">Method</span>
                            <span className="text-xs font-bold text-slate-700">{payment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-medium text-slate-500">Reference</span>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{payment.transactionId || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2">
                            <Clock className="w-3 h-3" />
                            Submitted {format(new Date(payment.updatedAt), 'MMM d, h:mm a')}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 relative">
                        <button
                            onClick={() => handleAction(payment.id, 'REJECT')}
                            disabled={processingId === payment.id}
                            className="flex items-center justify-center px-4 py-3 border border-red-100 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <X className="w-4 h-4 mr-1.5" />
                            Reject
                        </button>
                        <button
                            onClick={() => handleAction(payment.id, 'APPROVE')}
                            disabled={processingId === payment.id}
                            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            <Check className="w-4 h-4 mr-1.5" />
                            Approve
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
