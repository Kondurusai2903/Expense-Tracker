import React, { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, getDaysInMonth } from 'date-fns';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import BottomNav from '../components/Layout/BottomNav';
import { getExpensesApi } from '../api/expense.api';
import { formatCurrency, getCategoryConfig, CATEGORIES } from '../utils/formatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg border text-xs"
        style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
        <div className="font-semibold mt-0.5">{formatCurrency(payload[0].value)}</div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg border text-xs"
        style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>{payload[0].name}</div>
        <div className="font-semibold mt-0.5">{formatCurrency(payload[0].value)}</div>
      </div>
    );
  }
  return null;
};

const selectStyle = {
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
  borderRadius: '10px',
  padding: '9px 36px 9px 12px',
  fontSize: '14px',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  cursor: 'pointer',
  width: '100%',
};

const Analytics = () => {
  const now = new Date();

  const [allExpenses, setAllExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const selectedMonthKey = useMemo(
    () => `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
    [selectedYear, selectedMonth]
  );

  const selectedMonthLabel = `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;

  const availableYears = useMemo(() => {
    const years = new Set([now.getFullYear()]);
    for (const e of allExpenses) {
      years.add(new Date(e.date).getFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [allExpenses]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getExpensesApi({ limit: 5000 });
      setAllExpenses(res.expenses);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const key = `${selectedYear}-${String(monthNum).padStart(2, '0')}`;
      const filtered = allExpenses.filter(
        (e) => format(new Date(e.date), 'yyyy-MM') === key
      );
      return {
        key,
        month: MONTH_SHORT[i],
        fullLabel: `${MONTH_NAMES[i]} ${selectedYear}`,
        total: filtered.reduce((s, e) => s + e.amount, 0),
        count: filtered.length,
      };
    });
  }, [allExpenses, selectedYear]);

  const categoryData = useMemo(() => {
    const filtered = allExpenses.filter(
      (e) => format(new Date(e.date), 'yyyy-MM') === selectedMonthKey
    );
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const catMap = {};
    for (const e of filtered) {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    }
    return Object.entries(catMap)
      .map(([cat, amt]) => {
        const config = getCategoryConfig(cat);
        return {
          category: cat,
          total: amt,
          percentage: total > 0 ? Math.round((amt / total) * 100) : 0,
          color: config.color,
          emoji: config.emoji,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [allExpenses, selectedMonthKey]);

  const daysInSelectedMonth = getDaysInMonth(new Date(selectedYear, selectedMonth - 1));

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar />

        <main className="flex-1 p-4 md:p-6 space-y-6">

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Analytics
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Understand your spending patterns
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={selectStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i + 1} value={i + 1} style={{ background: 'var(--color-surface)' }}>
                      {name}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </div>

              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{ ...selectStyle, width: 'auto', minWidth: '90px' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                >
                  {isLoading
                    ? <option value={now.getFullYear()}>{now.getFullYear()}</option>
                    : availableYears.map((yr) => (
                        <option key={yr} value={yr} style={{ background: 'var(--color-surface)' }}>
                          {yr}
                        </option>
                      ))
                  }
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Monthly Spending
                </h3>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {selectedYear}
                </span>
              </div>

              {isLoading ? (
                <div className="h-48 flex items-end gap-1 px-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-t animate-pulse"
                      style={{ height: `${20 + (i % 5) * 15}%`, background: 'var(--color-border)' }} />
                  ))}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={monthlyData}
                    barSize={20}
                    onClick={(e) => {
                      if (e?.activePayload?.[0]) {
                        const clicked = e.activePayload[0].payload;
                        const m = parseInt(clicked.key.split('-')[1], 10);
                        setSelectedMonth(m);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomBarTooltip />} cursor={false} />
                    <Bar dataKey="total" radius={[5, 5, 0, 0]}>
                      {monthlyData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={entry.key === selectedMonthKey ? 'var(--color-primary)' : 'var(--color-surface-elevated)'}
                          stroke={entry.key === selectedMonthKey ? 'var(--color-primary)' : 'var(--color-border)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <p className="text-xs mt-1 text-center" style={{ color: 'var(--color-text-muted)' }}>
                Click a bar to inspect that month
              </p>
            </div>

            {/* Pie chart */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Category Distribution
                </h3>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {selectedMonthLabel}
              </p>

              {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full animate-pulse" style={{ background: 'var(--color-border)' }} />
                </div>
              ) : categoryData.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    No expenses in {selectedMonthLabel}
                  </p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="total" nameKey="category"
                        cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={2}>
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
                    {categoryData.map((item) => (
                      <div key={item.category} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {item.emoji} {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Category breakdown */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                Category Breakdown
              </h3>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}
              >
                {selectedMonthLabel}
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="w-24 h-4 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
                      <div className="w-16 h-4 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
                    </div>
                    <div className="w-full h-2 rounded-full animate-pulse" style={{ background: 'var(--color-border)' }} />
                  </div>
                ))}
              </div>
            ) : categoryData.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
                No expenses in {selectedMonthLabel}.
              </p>
            ) : (
              <div className="space-y-4">
                {CATEGORIES.filter((c) => categoryData.find((d) => d.category === c.name)).map((cat) => {
                  const item = categoryData.find((d) => d.category === cat.name);
                  if (!item) return null;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.emoji}</span>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {item.percentage}%
                          </span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ background: 'var(--color-surface-elevated)' }}>
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{ width: `${item.percentage}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly summary table */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                Monthly Summary
              </h3>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {selectedYear}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--color-surface-elevated)' }}>
                    <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Month</th>
                    <th className="text-right px-5 py-3 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Spent</th>
                    <th className="text-right px-5 py-3 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Transactions</th>
                    <th className="text-right px-5 py-3 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Avg/Day</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                        {Array.from({ length: 4 }).map((__, j) => (
                          <td key={j} className="px-5 py-3">
                            <div className="h-4 rounded animate-pulse"
                              style={{ background: 'var(--color-border)', width: j === 0 ? '80px' : '60px', marginLeft: j === 0 ? '0' : 'auto' }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    [...monthlyData].reverse().map((m) => {
                      const isSelected = m.key === selectedMonthKey;
                      return (
                        <tr
                          key={m.key}
                          className="border-t transition-colors cursor-pointer"
                          style={{
                            borderColor: 'var(--color-border)',
                            background: isSelected ? 'var(--color-primary-dim)' : 'transparent',
                          }}
                          onClick={() => {
                            const month = parseInt(m.key.split('-')[1], 10);
                            setSelectedMonth(month);
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = 'var(--color-surface-elevated)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isSelected
                              ? 'var(--color-primary-dim)'
                              : 'transparent';
                          }}
                        >
                          <td className="px-5 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ background: 'var(--color-primary)' }} />
                              )}
                              <span style={{
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                              }}>
                                {m.fullLabel}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-right font-medium"
                            style={{ color: m.total > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                            {m.total > 0 ? formatCurrency(m.total) : '—'}
                          </td>
                          <td className="px-5 py-3 text-sm text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            {m.count > 0 ? m.count : '—'}
                          </td>
                          <td className="px-5 py-3 text-sm text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            {m.total > 0 ? formatCurrency(m.total / daysInSelectedMonth) : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Analytics;
