import React from 'react';
import { format } from 'date-fns';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Topbar = ({ onSearch, searchValue, onAddExpense }) => {
  const { user } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 py-4 border-b"
      style={{
        background: 'var(--color-bg)',
        borderColor: 'var(--color-border)',
        transition: 'background 0.2s ease',
      }}
    >
      <div className="flex-1 min-w-0">
        <h1
          className="text-base md:text-lg font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-xs md:text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {today}
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-4">
        {onSearch !== undefined && (
          <div className="relative hidden sm:block">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchValue ?? ''}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border outline-none w-52"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {onAddExpense && (
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">Add</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
