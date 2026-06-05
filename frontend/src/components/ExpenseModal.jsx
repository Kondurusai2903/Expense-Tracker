import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { createExpenseApi, updateExpenseApi } from '../api/expense.api';
import { CATEGORIES } from '../utils/formatters';

const expenseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must be under 100 characters'),
  amount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be positive')
    .refine((v) => parseFloat(v) <= 1000000, 'Amount cannot exceed ₹10,00,000'),
  category: z.enum([
    'Food', 'Transport', 'Shopping', 'Health',
    'Entertainment', 'Utilities', 'Education', 'Other',
  ]),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500, 'Description max 500 characters').optional(),
});

const ExpenseModal = ({ isOpen, onClose, onSuccess, expense }) => {
  const isEdit = !!expense;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: 'Food',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
        description: expense.description ?? '',
      });
    } else {
      reset({
        title: '',
        amount: '',
        category: 'Food',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
      });
    }
  }, [expense, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
      };

      if (isEdit && expense) {
        await updateExpenseApi(expense.id, payload);
        toast.success('Expense updated!');
      } else {
        await createExpenseApi(payload);
        toast.success('Expense added!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg ?? 'Something went wrong');
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: 'var(--radius-sm)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl border overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {isEdit ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Title
            </label>
            <input
              {...register('title')}
              placeholder="e.g. Lunch at Zomato"
              className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
            {errors.title && (
              <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Amount (₹)
              </label>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
              />
              {errors.amount && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2.5 text-sm outline-none transition-colors appearance-none cursor-pointer"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name} style={{ background: 'var(--color-surface)' }}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.category.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Date
            </label>
            <input
              {...register('date')}
              type="date"
              className="w-full px-3 py-2.5 text-sm outline-none transition-colors"
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
            {errors.date && (
              <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              Description <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
            </label>
            <textarea
              {...register('description')}
              placeholder="Add a note..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm outline-none resize-none transition-colors"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
            {errors.description && (
              <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
              style={{
                background: 'var(--color-primary)',
                color: '#12121A',
              }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(18,18,26,0.3)', borderTopColor: '#12121A' }} />
              ) : (
                isEdit ? 'Update' : 'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
