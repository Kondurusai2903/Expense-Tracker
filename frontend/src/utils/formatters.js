import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

export const CATEGORIES = [
  { name: 'Food', emoji: '🍔', color: '#FABF54' },
  { name: 'Transport', emoji: '🚗', color: '#63B3F5' },
  { name: 'Shopping', emoji: '🛍️', color: '#C778FA' },
  { name: 'Health', emoji: '💊', color: '#45D49A' },
  { name: 'Entertainment', emoji: '🎮', color: '#F56666' },
  { name: 'Utilities', emoji: '💡', color: '#FA9F54' },
  { name: 'Education', emoji: '📚', color: '#54C8FA' },
  { name: 'Other', emoji: '💼', color: '#8C8CA0' },
];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatRelativeDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  const daysAgo = differenceInDays(new Date(), d);
  if (daysAgo < 7) return `${daysAgo} days ago`;
  return formatDate(d);
};

export const getCategoryColor = (category) => {
  const found = CATEGORIES.find((c) => c.name === category);
  return found?.color ?? '#8C8CA0';
};

export const getCategoryEmoji = (category) => {
  const found = CATEGORIES.find((c) => c.name === category);
  return found?.emoji ?? '💼';
};

export const getCategoryConfig = (category) => {
  return CATEGORIES.find((c) => c.name === category) ?? CATEGORIES[7];
};

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
