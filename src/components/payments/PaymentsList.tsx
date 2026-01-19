import { format } from "date-fns";
import { Eye, Edit2, Trash2, Banknote, CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface Payment {
    id: string;
    amount: number;
    type: string;
    description: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        property?: {
            block: string;
            unitNumber: string;
        } | null;
    };
}

interface PaymentsListProps {
    payments: Payment[];
    loading: boolean;
    userRole?: string;
    currentUserId?: string;
    pagination: {
        page: number;
        pages: number;
        total: number;
    };
    onPageChange: (page: number) => void;
    onView: (payment: Payment) => void;
    onEdit: (payment: Payment) => void;
    onDelete: (id: string) => void;
    onPay: (payment: Payment) => void;
    onManualPay: (payment: Payment) => void;
    onVerify?: (payment: Payment) => void;
}

export default function PaymentsList({
    payments,
    loading,
    userRole,
    currentUserId,
    pagination,
    onPageChange,
    onView,
    onEdit,
    onDelete,
    onPay,
    onManualPay,
    onVerify
}: PaymentsListProps) {

    if (loading) {
        return (
            <div className="p-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading records...</p>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/50 text-center">
                <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-tiny">
                    <Banknote className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-[900] text-slate-900 tracking-tight">No payments found</h3>
                <p className="text-slate-500 mt-2 max-w-sm font-medium">There are no payment records matching your current filters.</p>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-100/80 text-emerald-700 border-emerald-200';
            case 'PENDING': return 'bg-amber-100/80 text-amber-700 border-amber-200';
            case 'PENDING_VERIFICATION': return 'bg-purple-100/80 text-purple-700 border-purple-200';
            case 'FAILED': return 'bg-red-100/80 text-red-700 border-red-200';
            case 'REFUNDED': return 'bg-slate-100/80 text-slate-700 border-slate-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
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
        <div className="space-y-4">
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {payments.map((payment) => (
                    <div
                        key={payment.id}
                        className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-sm space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-black border border-white shadow-sm">
                                    {payment.user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-900 leading-tight">{payment.user.name}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        {payment.user.property
                                            ? `${payment.user.property.block ? payment.user.property.block + '-' : ''}${payment.user.property.unitNumber}`
                                            : 'No Property'}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border ${getStatusStyle(payment.status)}`}>
                                {payment.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-4 border-y border-slate-100/50">
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Details</div>
                                <div className="text-xs font-black text-slate-900 capitalize leading-none">{payment.type.toLowerCase()}</div>
                                <div className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-1">{payment.description}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</div>
                                <div className="text-lg font-[1000] text-slate-900 tracking-tighter leading-none">
                                    {formatCurrency(payment.amount)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created</div>
                                <div className="text-xs font-bold text-slate-700">{format(new Date(payment.createdAt), 'MMM d, yyyy')}</div>
                            </div>
                            {payment.dueDate && (
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Due Date</div>
                                    <div className="text-xs font-black text-red-500">{format(new Date(payment.dueDate), 'MMM d, yyyy')}</div>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                            {/* Actions for Residents/Self */}
                            {(userRole === 'RESIDENT' || payment.user.id === currentUserId) && (payment.status === 'PENDING' || payment.status === 'FAILED') && (
                                <>
                                    <button
                                        onClick={() => onPay(payment)}
                                        className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"
                                    >
                                        Pay Now
                                    </button>
                                    <button
                                        onClick={() => onManualPay(payment)}
                                        className="p-3 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl hover:shadow-sm"
                                        title="Manual Payment"
                                    >
                                        <Banknote className="w-4 h-4" />
                                    </button>
                                </>
                            )}

                            {/* Verification for Admins */}
                            {userRole !== 'RESIDENT' && payment.status === 'PENDING_VERIFICATION' && onVerify && (
                                <button
                                    onClick={() => onVerify(payment)}
                                    className="w-full py-3 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:bg-purple-700 transition-all shadow-lg"
                                >
                                    Verify Transaction
                                </button>
                            )}

                            {/* Admin Actions */}
                            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(payment)}
                                        disabled={payment.status === 'COMPLETED'}
                                        className={`p-3 rounded-xl transition-all border ${payment.status === 'COMPLETED' ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-slate-200'}`}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(payment.id)}
                                        disabled={payment.status === 'COMPLETED'}
                                        className={`p-3 rounded-xl transition-all border ${payment.status === 'COMPLETED' ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200'}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Recipient / Source
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Transaction Details
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Settlement
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Verification
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Timeline
                                </th>
                                <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Administrative
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-blue-50/20 transition-all group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-11 w-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 font-black border-2 border-white shadow-sm group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600 transition-colors">
                                                {payment.user.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-[900] text-slate-900 tracking-tight">{payment.user.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                    {payment.user.property
                                                        ? `${payment.user.property.block ? payment.user.property.block + '-' : ''}${payment.user.property.unitNumber}`
                                                        : 'No Property'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-xs font-black text-slate-800 uppercase tracking-[0.1em]">
                                            {payment.type}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 truncate max-w-[200px] mt-1" title={payment.description}>
                                            {payment.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="text-base font-[1000] text-slate-900 tracking-tighter">
                                            {formatCurrency(payment.amount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 inline-flex text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border ${getStatusStyle(payment.status)}`}>
                                            {payment.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-700">{format(new Date(payment.createdAt), 'MMM d, yyyy')}</span>
                                            {payment.dueDate && (
                                                <span className="text-[10px] font-black text-red-500/80 flex items-center mt-1.5 uppercase tracking-wider">
                                                    <Clock className="w-3 h-3 mr-1" /> Due: {format(new Date(payment.dueDate), 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            {/* Resident Pay Logic */}
                                            {(userRole === 'RESIDENT' || payment.user.id === currentUserId) && (payment.status === 'PENDING' || payment.status === 'FAILED') && (
                                                <>
                                                    <button
                                                        onClick={() => onPay(payment)}
                                                        className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"
                                                    >
                                                        Pay Now
                                                    </button>
                                                    <button
                                                        onClick={() => onManualPay(payment)}
                                                        className="p-2.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-all"
                                                        title="Manual Entry"
                                                    >
                                                        <Banknote className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}

                                            {/* Admin Verification Logic */}
                                            {userRole !== 'RESIDENT' && payment.status === 'PENDING_VERIFICATION' && onVerify && (
                                                <button
                                                    onClick={() => onVerify(payment)}
                                                    className="px-5 py-2.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all shadow-lg"
                                                >
                                                    Verify
                                                </button>
                                            )}

                                            {/* Admin Edit/Delete */}
                                            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                                                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                                    <button
                                                        onClick={() => onEdit(payment)}
                                                        disabled={payment.status === 'COMPLETED'}
                                                        className={`p-2 rounded-lg transition-all ${payment.status === 'COMPLETED' ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm'}`}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(payment.id)}
                                                        disabled={payment.status === 'COMPLETED'}
                                                        className={`p-2 rounded-lg transition-all ${payment.status === 'COMPLETED' ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-sm'}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
                <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/50">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Displaying Results</span>
                        <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">
                            {pagination.page} / {pagination.pages} Units
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                            disabled={pagination.page === 1}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
                            disabled={pagination.page === pagination.pages}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
