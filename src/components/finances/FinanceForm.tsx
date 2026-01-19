import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Landmark, Calendar, TextQuote, Tag, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Finance {
  id: string;
  amount: number;
  description?: string;
  date: Date | string;
  category: string;
}

interface FinanceFormData {
  amount: string;
  description: string;
  date: string;
  category: string;
}

interface FinanceFormProps {
  finance?: Finance | null;
  onClose: () => void;
  onSubmit: (data: FinanceFormData) => Promise<void>;
  open: boolean;
}

const FINANCE_CATEGORIES = [
  { value: 'electricity', label: 'Electricity' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'security', label: 'Security' },
  { value: 'water', label: 'Water' },
  { value: 'rent', label: 'Rent' },
  { value: 'event', label: 'Event' },
  { value: 'salary', label: 'Salary' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'other_expense', label: 'Other Expense' },
];

export function FinanceForm({
  finance,
  onClose,
  onSubmit,
  open,
}: FinanceFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'other_expense',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (finance) {
      setFormData({
        amount: finance.amount.toString(),
        description: finance.description || '',
        date: new Date(finance.date).toISOString().split('T')[0],
        category: finance.category,
      });
    } else {
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: 'other_expense',
      });
    }
  }, [finance, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (value: string, id: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="shadow-3xl flex max-h-[90vh] flex-col overflow-hidden rounded-[2.5rem] border-none bg-white p-0 sm:max-w-[500px]">
        <div className="relative shrink-0 overflow-hidden bg-slate-900 p-8 text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Landmark className="h-32 w-32" />
          </div>
          <div className="relative space-y-1">
            <DialogHeader>
              <DialogTitle className="text-2xl font-[1000] tracking-tighter">
                {finance ? 'Update Record' : 'New Expenditure'}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400">
                {finance
                  ? 'Modify existing community transaction details'
                  : 'Submit a new verified community expense'}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="custom-scrollbar space-y-6 overflow-y-auto p-8">
            <div className="space-y-6">
              {/* Amount Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="amount"
                  className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
                >
                  <Landmark className="h-3 w-3" /> Entry Amount
                </Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-6 -translate-y-1/2 text-2xl font-black text-slate-300">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="h-16 [appearance:textfield] rounded-2xl border-slate-100 bg-slate-50/50 pl-12 text-2xl font-[1000] tracking-tighter text-slate-900 focus:ring-slate-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Category Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="category"
                  className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
                >
                  <Tag className="h-3 w-3" /> Classification
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: string) =>
                    handleSelectChange(value, 'category')
                  }
                >
                  <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    {FINANCE_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className="py-3 font-bold text-slate-600"
                      >
                        {' '}
                        {cat.label}{' '}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
                >
                  <TextQuote className="h-3 w-3" /> Memo / Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-semibold text-slate-700 placeholder:text-slate-300"
                  placeholder="e.g. Monthly lift maintenance..."
                />
              </div>

              {/* Date Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="date"
                  className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
                >
                  <Calendar className="h-3 w-3" /> Transaction Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-slate-700"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-4 border-t border-slate-100 bg-slate-50/50 p-8 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-14 flex-1 rounded-2xl border-slate-200 text-[10px] font-black tracking-widest uppercase hover:bg-white"
            >
              <X className="mr-2 h-4 w-4" /> Discard
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-14 flex-1 rounded-2xl bg-slate-900 text-[10px] font-black tracking-widest text-white uppercase shadow-xl shadow-slate-200 hover:bg-black"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />{' '}
                  {finance ? 'Update' : 'Commit'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
