import { useState, useEffect } from "react";
import { X, CreditCard } from "lucide-react";

interface PaymentFormProps {
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isEditing?: boolean;
}

export default function PaymentForm({ onClose, onSubmit, initialData, isEditing }: PaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        userId: initialData?.userId || "",
        amount: initialData?.amount || "",
        type: initialData?.type || "MAINTENANCE",
        description: initialData?.description || "",
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
    });

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (data.users && Array.isArray(data.users)) {
                    setUsers(data.users);
                } else if (Array.isArray(data)) {
                    setUsers(data);
                }
            })
            .catch(err => console.error("Failed to fetch users", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-[900] text-gray-900 tracking-tight">
                                {isEditing ? "Edit Payment" : "Create Payment"}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">Enter payment details below</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                        {/* User Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">User</label>
                            <select
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer"
                                required
                                disabled={isEditing}
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.property?.unitNumber || 'No Unit'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Payment Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer"
                                required
                            >
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="FACILITY">Facility</option>
                                <option value="EVENT">Event</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400"
                                required
                                min="1"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="block w-full p-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-400 min-h-[100px] resize-none"
                                required
                                placeholder="Enter payment details..."
                            />
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3 shrink-0">
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
                            className="px-8 py-3 rounded-xl bg-slate-900 text-white hover:bg-black font-bold text-sm shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                        >
                            {loading ? "Saving..." : "Save Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
