import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import BottomNav from '../components/Layout/BottomNav';
import StatCard from '../components/StatCard';
import ExpenseRow from '../components/ExpenseRow';
import ExpenseModal from '../components/ExpenseModal';
import ConfirmModal from '../components/ConfirmModal';
import { getDashboardApi, deleteExpenseApi, createExpenseApi } from '../api/expense.api';
import { formatCurrency, getCategoryConfig, CATEGORIES } from '../utils/formatters';

const quickAddSchema = z.object({
  title: z.string().min(2, 'Min 2 chars'),
  amount: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be positive'),
  category: z.enum(['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Education', 'Other']),
});

const BUDGET_KEY = 'spendsense_budget';
const DEFAULT_BUDGET = 40000;
const INCOME_KEY = 'spendsense_income';
const DEFAULT_INCOME = 55000;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg border text-xs"
        style={{
          background: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
        <div className="font-semibold mt-0.5">{formatCurrency(payload[0].value)}</div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [budget, setBudget] = useState(() => {
    const stored = localStorage.getItem(BUDGET_KEY);
    return stored ? parseInt(stored, 10) : DEFAULT_BUDGET;
  });
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [income, setIncome] = useState(() => {
    const stored = localStorage.getItem(INCOME_KEY);
    return stored ? parseInt(stored, 10) : DEFAULT_INCOME;
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isQuickSubmitting },
  } = useForm({
    resolver: zodResolver(quickAddSchema),
    defaultValues: { title: '', amount: '', category: 'Food' },
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getDashboardApi();
      setData(res);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      await deleteExpenseApi(confirmDeleteId);
      toast.success('Expense deleted');
      fetchDashboard();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setModalOpen(true);
  };

  const onQuickAdd = async (values) => {
    try {
      await createExpenseApi({
        title: values.title,
        amount: parseFloat(values.amount),
        category: values.category,
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      toast.success('Expense added!');
      reset();
      fetchDashboard();
    } catch {
      toast.error('Failed to add expense');
    }
  };

  const saveIncome = (val) => {
    setIncome(val);
    localStorage.setItem(INCOME_KEY, val.toString());
    toast.success('Income updated!');
  };

  const saveBudget = () => {
    const val = parseInt(budgetInput, 10);
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      localStorage.setItem(BUDGET_KEY, val.toString());
      toast.success('Budget updated!');
    } else {
      toast.error('Enter a valid amount');
    }
    setEditingBudget(false);
  };

  const spentPercent = data
    ? Math.min(100, Math.round((data.totalThisMonth / budget) * 100))
    : 0;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar onAddExpense={() => { setEditExpense(null); setModalOpen(true); }} />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              isLoading={isLoading}
              title="Spent This Month"
              value={data?.totalThisMonth ?? 0}
              iconBg="rgba(245,102,102,0.15)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F56666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <StatCard
              isLoading={isLoading}
              title="Monthly Income"
              value={income}
              onEdit={saveIncome}
              iconBg="rgba(69,212,154,0.15)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#45D49A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
                  <polyline points="17,6 23,6 23,12" />
                </svg>
              }
            />
            <StatCard
              isLoading={isLoading}
              title="Savings"
              value={income - (data?.totalThisMonth ?? 0)}
              iconBg="rgba(99,179,245,0.15)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#63B3F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
                  <path d="M1 21h22" />
                  <path d="M9 9h6" />
                  <path d="M9 13h6" />
                </svg>
              }
            />
            <StatCard
              isLoading={isLoading}
              title="Transactions"
              value={data?.transactionCount ?? 0}
              isCurrency={false}
              iconBg="rgba(250,191,84,0.15)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FABF54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Hero card */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="w-32 h-4 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
                    <div className="w-48 h-9 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
                    <div className="w-full h-3 rounded-full animate-pulse" style={{ background: 'var(--color-border)' }} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Spent This Month</p>
                        <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(data?.totalThisMonth ?? 0)}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: spentPercent > 80 ? 'rgba(245,102,102,0.15)' : 'rgba(69,212,154,0.15)',
                          color: spentPercent > 80 ? 'var(--color-danger)' : 'var(--color-success)',
                        }}
                      >
                        {spentPercent}% of budget
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {editingBudget ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Budget ₹</span>
                          <input
                            type="number"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveBudget(); if (e.key === 'Escape') setEditingBudget(false); }}
                            autoFocus
                            className="w-28 px-2 py-1 text-xs rounded-lg border outline-none"
                            style={{
                              background: 'var(--color-surface-elevated)',
                              borderColor: 'var(--color-primary)',
                              color: 'var(--color-text-primary)',
                            }}
                          />
                          <button
                            onClick={saveBudget}
                            className="px-2 py-1 rounded-lg text-xs font-medium"
                            style={{ background: 'var(--color-primary)', color: '#12121A' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingBudget(false)}
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          Budget:{' '}
                          <button
                            onClick={() => { setBudgetInput(budget.toString()); setEditingBudget(true); }}
                            className="underline underline-offset-2 transition-colors"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                          >
                            {formatCurrency(budget)}
                          </button>
                          {' '}· Remaining: {formatCurrency(Math.max(0, budget - (data?.totalThisMonth ?? 0)))}
                          {' '}
                          <button
                            onClick={() => { setBudgetInput(budget.toString()); setEditingBudget(true); }}
                            className="ml-1 inline-flex items-center"
                            style={{ color: 'var(--color-text-muted)' }}
                            title="Edit budget"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </p>
                      )}
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: 'var(--color-surface-elevated)' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${spentPercent}%`,
                          background: spentPercent > 80 ? 'var(--color-danger)' : 'var(--color-primary)',
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Bar Chart */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Last 7 Days
                </h3>
                {isLoading ? (
                  <div className="h-40 flex items-end gap-2 px-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t animate-pulse"
                        style={{
                          height: `${30 + Math.random() * 70}%`,
                          background: 'var(--color-border)',
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={data?.monthlyTrend ?? []} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {(data?.monthlyTrend ?? []).map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.isToday ? 'var(--color-primary)' : 'var(--color-surface-elevated)'}
                            stroke={entry.isToday ? 'var(--color-primary)' : 'var(--color-border)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Recent Transactions */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Recent Transactions
                  </h3>
                </div>

                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl animate-pulse"
                        style={{ background: 'var(--color-surface-elevated)' }}
                      />
                    ))}
                  </div>
                ) : data?.recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">💸</div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      No expenses yet. Add your first one!
                    </p>
                    <button
                      onClick={() => { setEditExpense(null); setModalOpen(true); }}
                      className="mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                      style={{ background: 'var(--color-primary)', color: '#12121A' }}
                    >
                      Add Expense
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data?.recentTransactions.map((exp) => (
                      <ExpenseRow
                        key={exp.id}
                        expense={exp}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={deletingId === exp.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Category Breakdown */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Categories This Month
                </h3>

                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="w-20 h-3 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
                        <div className="w-full h-2 rounded-full animate-pulse" style={{ background: 'var(--color-border)' }} />
                      </div>
                    ))}
                  </div>
                ) : data?.categoryBreakdown.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data?.categoryBreakdown.map((item) => {
                      const config = getCategoryConfig(item.category);
                      return (
                        <div key={item.category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                              {config.emoji} {item.category}
                            </span>
                            <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--color-surface-elevated)' }}>
                            <div
                              className="h-1.5 rounded-full transition-all duration-700"
                              style={{ width: `${item.percentage}%`, background: config.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Add */}
              <div
                className="rounded-2xl border p-5 hidden lg:block"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Quick Add
                </h3>
                <form onSubmit={handleSubmit(onQuickAdd)} className="space-y-3">
                  <input
                    {...register('title')}
                    placeholder="Title"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                    style={{
                      background: 'var(--color-surface-elevated)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                  />
                  <div className="flex gap-2">
                    <input
                      {...register('amount')}
                      type="number"
                      step="0.01"
                      placeholder="₹ Amount"
                      className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border outline-none"
                      style={{
                        background: 'var(--color-surface-elevated)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                    />
                    <select
                      {...register('category')}
                      className="px-2 py-2 text-sm rounded-lg border outline-none cursor-pointer"
                      style={{
                        background: 'var(--color-surface-elevated)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.name} value={c.name} style={{ background: 'var(--color-surface)' }}>
                          {c.emoji}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isQuickSubmitting}
                    className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                    style={{ background: 'var(--color-primary)', color: '#12121A' }}
                  >
                    {isQuickSubmitting ? (
                      <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(18,18,26,0.3)', borderTopColor: '#12121A' }} />
                    ) : '+ Add Now'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditExpense(null); }}
        onSuccess={fetchDashboard}
        expense={editExpense}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Expense"
        message="This expense will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        isLoading={!!deletingId}
      />
    </div>
  );
};

export default Dashboard;
