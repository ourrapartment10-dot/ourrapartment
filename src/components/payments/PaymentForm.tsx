import { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';

interface PaymentFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

export default function PaymentForm({
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    userId: initialData?.userId || '',
    amount: initialData?.amount || '',
    type: initialData?.type || 'MAINTENANCE',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split('T')[0]
      : '',
  });

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((err) => console.error('Failed to fetch users', err));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl duration-300">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-[900] tracking-tight text-gray-900">
                {isEditing ? 'Edit Payment' : 'Create Payment'}
              </h2>
              <p className="text-xs font-medium text-gray-500">
                Enter payment details below
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

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="custom-scrollbar space-y-5 overflow-y-auto p-6">
            {/* User Selection */}
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                User
              </label>
              <select
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className="block h-12 w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-sm font-medium text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
                disabled={isEditing}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.property?.unitNumber || 'No Unit'})
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                Payment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="block h-12 w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-sm font-medium text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                Amount (₹)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="block h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
                min="1"
                placeholder="0.00"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="block min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
                placeholder="Enter payment details..."
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-widest text-gray-500 uppercase">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="block h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-sm font-medium text-gray-900 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex shrink-0 justify-end space-x-3 border-t border-gray-100 bg-gray-50/50 p-6">
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
              className="rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
