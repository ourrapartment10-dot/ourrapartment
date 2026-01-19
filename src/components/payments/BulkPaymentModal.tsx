import { useState, useEffect, useMemo } from 'react';
import { X, Search, CheckSquare, Square, Users, Upload } from 'lucide-react';

interface BulkPaymentModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function BulkPaymentModal({
  onClose,
  onSubmit,
}: BulkPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const [details, setDetails] = useState({
    amount: '',
    type: 'MAINTENANCE',
    description: '',
    dueDate: '',
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        const list = data.users || data || [];
        setUsers(
          list.filter((u: any) =>
            ['RESIDENT', 'ADMIN', 'SUPER_ADMIN'].includes(u.role)
          )
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.property?.unitNumber || '')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
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
      filteredUsers.forEach((u) => newSet.add(u.id));
      setSelectedIds(newSet);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    try {
      const payments = Array.from(selectedIds).map((userId) => ({
        userId,
        ...details,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-[900] tracking-tight text-gray-900">
                Bulk Payment Creation
              </h2>
              <p className="text-sm font-medium text-gray-500">
                Issue bills to multiple users efficiently
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* Left: Details Panel */}
          <div className="w-full overflow-y-auto border-r border-gray-100 bg-gray-50/30 p-8 md:w-[350px]">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-sm font-bold tracking-wide text-gray-900 uppercase">
                Payment Details
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                  Type
                </label>
                <select
                  value={details.type}
                  onChange={(e) =>
                    setDetails({ ...details, type: e.target.value })
                  }
                  className="block h-12 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="FACILITY">Facility</option>
                  <option value="EVENT">Event</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={details.amount}
                  onChange={(e) =>
                    setDetails({ ...details, amount: e.target.value })
                  }
                  className="block h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                  Description
                </label>
                <textarea
                  value={details.description}
                  onChange={(e) =>
                    setDetails({ ...details, description: e.target.value })
                  }
                  className="block min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. October Maintenance"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                  Due Date
                </label>
                <input
                  type="date"
                  value={details.dueDate}
                  onChange={(e) =>
                    setDetails({ ...details, dueDate: e.target.value })
                  }
                  className="block h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          {/* Right: User Selection */}
          <div className="flex flex-1 flex-col overflow-hidden bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  2
                </span>
                <h3 className="text-sm font-bold tracking-wide text-gray-900 uppercase">
                  Select Recipients
                </h3>
                <span className="ml-2 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {selectedIds.size} selected
                </span>
              </div>
              <div className="relative">
                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-56 rounded-xl border border-gray-200 pr-4 pl-9 text-sm font-medium transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                <span className="text-sm font-medium">
                  Loading users list...
                </span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-slate-50/50 shadow-inner">
                <table className="min-w-full">
                  <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr>
                      <th className="w-16 border-b border-gray-200 px-6 py-4 text-left">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center justify-center transition-opacity hover:opacity-80"
                        >
                          {selectedIds.size === filteredUsers.length &&
                          filteredUsers.length > 0 ? (
                            <CheckSquare className="h-5 w-5 text-indigo-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Name
                      </th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Role
                      </th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={`cursor-pointer transition-colors ${selectedIds.has(user.id) ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-gray-50'}`}
                        onClick={() => handleToggle(user.id)}
                      >
                        <td className="px-6 py-4">
                          {selectedIds.has(user.id) ? (
                            <CheckSquare className="h-5 w-5 text-indigo-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-300" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${selectedIds.has(user.id) ? 'text-indigo-900' : 'text-gray-700'}`}
                          >
                            {user.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              user.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : user.role === 'SUPER_ADMIN'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">
                          {user.property?.unitNumber || '-'}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-gray-400"
                        >
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
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 p-6">
          <div className="text-xs font-bold tracking-wide text-gray-400 uppercase">
            {selectedIds.size > 0
              ? `${selectedIds.size} recipients targeted`
              : 'No recipients selected'}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                selectedIds.size === 0 ||
                !details.amount ||
                !details.description
              }
              className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Processing...' : 'Issue Payments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
