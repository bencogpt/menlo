import { ReceiptCategory } from '../types';

export function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getCategoryColor(category: ReceiptCategory): string {
  const colors: Record<ReceiptCategory, string> = {
    utilities: '#ef4444',     // red
    subscriptions: '#8b5cf6', // purple
    shopping: '#3b82f6',      // blue
    food: '#f97316',          // orange
    travel: '#06b6d4',        // cyan
    entertainment: '#ec4899', // pink
    health: '#22c55e',        // green
    insurance: '#6366f1',     // indigo
    other: '#6b7280',         // gray
  };
  return colors[category];
}

export function getCategoryLabel(category: ReceiptCategory): string {
  const labels: Record<ReceiptCategory, string> = {
    utilities: 'Utilities',
    subscriptions: 'Subscriptions',
    shopping: 'Shopping',
    food: 'Food & Dining',
    travel: 'Travel',
    entertainment: 'Entertainment',
    health: 'Health',
    insurance: 'Insurance',
    other: 'Other',
  };
  return labels[category];
}

export function getCategoryIcon(category: ReceiptCategory): string {
  const icons: Record<ReceiptCategory, string> = {
    utilities: 'Zap',
    subscriptions: 'Repeat',
    shopping: 'ShoppingBag',
    food: 'UtensilsCrossed',
    travel: 'Plane',
    entertainment: 'Film',
    health: 'Heart',
    insurance: 'Shield',
    other: 'FileText',
  };
  return icons[category];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
