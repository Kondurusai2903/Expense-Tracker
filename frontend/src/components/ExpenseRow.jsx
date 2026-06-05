import React from 'react';
import { formatCurrency, formatRelativeDate, getCategoryConfig } from '../utils/formatters';

const ExpenseRow = ({ expense, onEdit, onDelete, isDeleting }) => {
  const config = getCategoryConfig(expense.category);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border group transition-all"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.background = 'var(--color-surface-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.background = 'var(--color-surface)';
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${config.color}1A` }}
      >
        {config.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {expense.title}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full hidden sm:inline-flex flex-shrink-0"
            style={{
              background: `${config.color}1A`,
              color: config.color,
            }}
          >
            {expense.category}
          </span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {formatRelativeDate(expense.date)}
          {expense.description && (
            <span className="ml-2 hidden sm:inline">· {expense.description.slice(0, 40)}{expense.description.length > 40 ? '...' : ''}</span>
          )}
        </div>
      </div>

      <div className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--color-danger)' }}>
        -{formatCurrency(expense.amount)}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(expense)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary-dim)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          title="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          disabled={isDeleting}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245,102,102,0.12)';
            e.currentTarget.style.color = 'var(--color-danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          title="Delete"
        >
          {isDeleting ? (
            <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-danger)' }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExpenseRow;
