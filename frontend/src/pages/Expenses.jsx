import React, { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import BottomNav from '../components/Layout/BottomNav';
import ExpenseRow from '../components/ExpenseRow';
import ExpenseModal from '../components/ExpenseModal';
import ConfirmModal from '../components/ConfirmModal';
import { getExpensesApi, deleteExpenseApi } from '../api/expense.api';
import { CATEGORIES } from '../utils/formatters';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const searchDebounceRef = useRef(null);

  const fetchExpenses = useCallback(async (currentPage = 1, searchVal = search) => {
    setIsLoading(true);
    try {
      const res = await getExpensesApi({
        search: searchVal,
        category,
        startDate,
        endDate,
        page: currentPage,
        limit: 10,
      });
      setExpenses(res.expenses);
      setPagination(res.pagination);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [category, startDate, endDate, search]);

  useEffect(() => {
    fetchExpenses(page);
  }, [page, category, startDate, endDate]);

  const handleSearchChange = (val) => {
    setSearch(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      fetchExpenses(1, val);
    }, 300);
  };

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
      fetchExpenses(page);
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

  const handleFilterChange = () => {
    setPage(1);
    fetchExpenses(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = search || category || startDate || endDate;

  const inputStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar
          onSearch={handleSearchChange}
          searchValue={search}
          onAddExpense={() => { setEditExpense(null); setModalOpen(true); }}
        />

        <main className="flex-1 p-4 md:p-6">
          {/* Filters */}
          <div
            className="rounded-2xl border p-4 mb-5"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex flex-wrap gap-3 items-end">
              <div className="w-full sm:hidden relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); handleFilterChange(); }}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name} style={{ background: 'var(--color-surface)' }}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); handleFilterChange(); }}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); handleFilterChange(); }}
                  style={{ ...inputStyle, colorScheme: 'dark' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                />
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-elevated)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {isLoading ? 'Loading...' : `${pagination.total} expense${pagination.total !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl animate-pulse"
                  style={{ background: 'var(--color-surface)' }}
                />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div
              className="rounded-2xl border flex flex-col items-center justify-center py-16"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="text-4xl mb-3">{hasFilters ? '🔍' : '💸'}</div>
              <p className="text-base font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {hasFilters ? 'No expenses match your search' : 'No expenses yet'}
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {hasFilters ? 'Try adjusting your filters' : 'Add your first one!'}
              </p>
              {!hasFilters && (
                <button
                  onClick={() => { setEditExpense(null); setModalOpen(true); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ background: 'var(--color-primary)', color: '#12121A' }}
                >
                  Add Expense
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === expense.id}
                />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.background = 'var(--color-surface)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
                Prev
              </button>

              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Page {page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => { if (page !== pagination.totalPages) e.currentTarget.style.background = 'var(--color-surface)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>

      <BottomNav />

      <ExpenseModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditExpense(null); }}
        onSuccess={() => fetchExpenses(page)}
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

export default Expenses;
