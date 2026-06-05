import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

const StatCard = ({
  title,
  value,
  isCurrency = true,
  trend,
  icon,
  iconBg,
  isLoading = false,
  onEdit,
}) => {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');

  const save = () => {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val > 0) {
      onEdit(val);
    }
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-4 border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg animate-pulse" style={{ background: 'var(--color-border)' }} />
          <div className="w-12 h-4 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
        </div>
        <div className="w-24 h-7 rounded animate-pulse mb-1" style={{ background: 'var(--color-border)' }} />
        <div className="w-20 h-4 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
      </div>
    );
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const displayValue = isCurrency ? formatCurrency(numericValue) : value.toString();

  return (
    <div
      className="rounded-xl p-4 border transition-transform hover:scale-[1.01] group relative"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {trend !== undefined && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                background: trend >= 0 ? 'rgba(69,212,154,0.12)' : 'rgba(245,102,102,0.12)',
              }}
            >
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
          {onEdit && !editing && (
            <button
              onClick={() => { setInput(numericValue.toString()); setEditing(true); }}
              className="w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-elevated)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
              title={`Edit ${title}`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>₹</span>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') setEditing(false);
              }}
              autoFocus
              className="flex-1 min-w-0 px-2 py-1 text-sm rounded-lg border outline-none"
              style={{
                background: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={save}
              className="flex-1 py-1 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--color-primary)', color: '#12121A' }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-1 rounded-lg text-xs border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-xl font-bold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
            {displayValue}
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {title}
          </div>
        </>
      )}
    </div>
  );
};

export default StatCard;
