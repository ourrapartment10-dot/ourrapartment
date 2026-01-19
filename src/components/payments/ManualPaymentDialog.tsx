import { useState } from "react";
import { X, AlertCircle, Banknote, Receipt } from "lucide-react";

interface ManualPaymentDialogProps {
    payment: any;
    onClose: () => void;
    onSubmit: (paymentId: string, data: any) => Promise<void>;
}

export default function ManualPaymentDialog({ payment, onClose, onSubmit }: ManualPaymentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        paymentMethod: "BANK_TRANSFER",
        transactionId: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(payment.id, {
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId || null,
                status: 'PENDING_VERIFICATION'
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
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">

                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-[900] text-gray-900 tracking-tight">Manual Payment</h2>
                            <p className="text-xs text-gray-500 font-medium">Submit offline payment details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="space-y-6">
                        {/* Amount Card */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-center shadow-lg shadow-slate-900/10">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Due</p>
                            <p className="text-3xl font-[900] text-white tracking-tight">{formatCurrency(payment.amount)}</p>
                            <p className="text-slate-400 text-sm mt-1">{payment.description}</p>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-xl flex items-start border border-amber-100">
                            <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 shrink-0" />
                            <p className="text-xs font-medium text-amber-800 leading-relaxed">
                                Payments submitted here require admin approval. Status will show as "Pending Verification" until approved.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Payment Method</label>
                                <select
                                    value={data.paymentMethod}
                                    onChange={(e) => setData({ ...data, paymentMethod: e.target.value })}
                                    className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all cursor-pointer"
                                >
                                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CASH">Cash</option>
                                    <option value="ONLINE">Other Online</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                    Transaction ID / Reference (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.transactionId}
                                    onChange={(e) => setData({ ...data, transactionId: e.target.value })}
                                    className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. UTR12345678 or 'Paid to Admin'"
                                />
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 font-bold text-sm transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-sm shadow-lg shadow-purple-600/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                                >
                                    {loading ? "Submitting..." : "Submit Claim"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
