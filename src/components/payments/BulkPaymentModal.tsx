import { useState, useEffect, useMemo } from "react";
import { X, Search, CheckSquare, Square, Users, Upload } from "lucide-react";

interface BulkPaymentModalProps {
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function BulkPaymentModal({ onClose, onSubmit }: BulkPaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const [details, setDetails] = useState({
        amount: "",
        type: "MAINTENANCE",
        description: "",
        dueDate: "",
    });

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setLoading(true);
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                const list = data.users || data || [];
                setUsers(list.filter((u: any) => ['RESIDENT', 'ADMIN', 'SUPER_ADMIN'].includes(u.role)));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            (u.property?.unitNumber || "").toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    const handleToggle = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredUsers.length) {
            setSelectedIds(new Set());
        } else {
            const newSet = new Set(selectedIds);
            filteredUsers.forEach(u => newSet.add(u.id));
            setSelectedIds(newSet);
        }
    };

    const handleSubmit = async () => {
        if (selectedIds.size === 0) return;
        setSubmitting(true);
        try {
            const payments = Array.from(selectedIds).map(userId => ({
                userId,
                ...details
            }));

            await onSubmit({ operation: 'create', payments });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-[900] text-gray-900 tracking-tight">Bulk Payment Creation</h2>
                            <p className="text-sm text-gray-500 font-medium">Issue bills to multiple users efficiently</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Details Panel */}
                    <div className="w-full md:w-[350px] p-8 border-r border-gray-100 overflow-y-auto bg-gray-50/30">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Payment Details</h3>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Type</label>
                                <select
                                    value={details.type}
                                    onChange={(e) => setDetails({ ...details, type: e.target.value })}
                                    className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all cursor-pointer"
                                >
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="FACILITY">Facility</option>
                                    <option value="EVENT">Event</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={details.amount}
                                    onChange={(e) => setDetails({ ...details, amount: e.target.value })}
                                    className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea
                                    value={details.description}
                                    onChange={(e) => setDetails({ ...details, description: e.target.value })}
                                    className="block w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-400 min-h-[100px] resize-none"
                                    placeholder="e.g. October Maintenance"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Due Date</label>
                                <input
                                    type="date"
                                    value={details.dueDate}
                                    onChange={(e) => setDetails({ ...details, dueDate: e.target.value })}
                                    className="block w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: User Selection */}
                    <div className="flex-1 p-8 flex flex-col overflow-hidden bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Select Recipients</h3>
                                <span className="ml-2 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                                    {selectedIds.size} selected
                                </span>
                            </div>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 h-10 border border-gray-200 rounded-xl text-sm font-medium w-56 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                <span className="text-sm font-medium">Loading users list...</span>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-2xl shadow-inner bg-slate-50/50">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-left w-16 border-b border-gray-200">
                                                <button onClick={handleSelectAll} className="flex items-center justify-center hover:opacity-80 transition-opacity">
                                                    {selectedIds.size === filteredUsers.length && filteredUsers.length > 0 ?
                                                        <CheckSquare className="w-5 h-5 text-indigo-600" /> :
                                                        <Square className="w-5 h-5 text-gray-400" />
                                                    }
                                                </button>
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">Name</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">Role</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-50">
                                        {filteredUsers.map(user => (
                                            <tr
                                                key={user.id}
                                                className={`cursor-pointer transition-colors ${selectedIds.has(user.id) ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-gray-50'}`}
                                                onClick={() => handleToggle(user.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    {selectedIds.has(user.id) ?
                                                        <CheckSquare className="w-5 h-5 text-indigo-600" /> :
                                                        <Square className="w-5 h-5 text-gray-300" />
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-bold ${selectedIds.has(user.id) ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                        {user.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'SUPER_ADMIN' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                                    {user.property?.unitNumber || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                                    No users found matching "{search}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {selectedIds.size > 0 ? `${selectedIds.size} recipients targeted` : "No recipients selected"}
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 font-bold text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || selectedIds.size === 0 || !details.amount || !details.description}
                            className="px-8 py-3 rounded-xl bg-slate-900 text-white hover:bg-black font-bold text-sm shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                        >
                            {submitting ? "Processing..." : "Issue Payments"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
