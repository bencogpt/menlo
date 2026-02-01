import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Receipt, FilterOptions, DashboardStats, ReceiptCategory } from '../types';
import { useAuth } from './AuthContext';
import { GmailService } from '../services/gmailService';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

interface ReceiptsContextType {
  receipts: Receipt[];
  filteredReceipts: Receipt[];
  isLoading: boolean;
  error: string | null;
  filters: FilterOptions;
  stats: DashboardStats | null;
  selectedReceipt: Receipt | null;
  setFilters: (filters: Partial<FilterOptions>) => void;
  refreshReceipts: () => Promise<void>;
  selectReceipt: (receipt: Receipt | null) => void;
  toggleStarred: (receiptId: string) => void;
}

const defaultFilters: FilterOptions = {
  search: '',
  category: 'all',
  dateRange: { start: null, end: null },
  minAmount: null,
  maxAmount: null,
  vendor: null,
};

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

interface ReceiptsProviderProps {
  children: ReactNode;
}

export function ReceiptsProvider({ children }: ReceiptsProviderProps) {
  const { accessToken, isAuthenticated } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<FilterOptions>(defaultFilters);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Load cached receipts from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('cached_receipts');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const receiptsWithDates = parsed.map((r: Receipt) => ({
          ...r,
          date: new Date(r.date),
        }));
        setReceipts(receiptsWithDates);
      } catch {
        console.error('Failed to parse cached receipts');
      }
    }
  }, []);

  const refreshReceipts = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const service = new GmailService(accessToken);
      const fetchedReceipts = await service.fetchReceipts(200);
      setReceipts(fetchedReceipts);
      localStorage.setItem('cached_receipts', JSON.stringify(fetchedReceipts));
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch receipts');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Fetch receipts when authenticated
  useEffect(() => {
    if (isAuthenticated && receipts.length === 0) {
      refreshReceipts();
    }
  }, [isAuthenticated, receipts.length, refreshReceipts]);

  const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const selectReceipt = useCallback((receipt: Receipt | null) => {
    setSelectedReceipt(receipt);
  }, []);

  const toggleStarred = useCallback((receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, starred: !r.starred } : r))
    );
  }, []);

  // Apply filters to receipts
  const filteredReceipts = receipts.filter((receipt) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        receipt.subject.toLowerCase().includes(searchLower) ||
        receipt.vendor.toLowerCase().includes(searchLower) ||
        receipt.from.toLowerCase().includes(searchLower) ||
        receipt.snippet.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category !== 'all' && receipt.category !== filters.category) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start && receipt.date < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && receipt.date > filters.dateRange.end) {
      return false;
    }

    // Amount filters
    if (filters.minAmount !== null && receipt.amount !== null && receipt.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount !== null && receipt.amount !== null && receipt.amount > filters.maxAmount) {
      return false;
    }

    // Vendor filter
    if (filters.vendor && receipt.vendor.toLowerCase() !== filters.vendor.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const stats: DashboardStats | null = receipts.length > 0 ? calculateStats(receipts) : null;

  return (
    <ReceiptsContext.Provider
      value={{
        receipts,
        filteredReceipts,
        isLoading,
        error,
        filters,
        stats,
        selectedReceipt,
        setFilters,
        refreshReceipts,
        selectReceipt,
        toggleStarred,
      }}
    >
      {children}
    </ReceiptsContext.Provider>
  );
}

function calculateStats(receipts: Receipt[]): DashboardStats {
  const receiptsWithAmount = receipts.filter((r) => r.amount !== null);
  const totalSpent = receiptsWithAmount.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Top vendors
  const vendorMap = new Map<string, { amount: number; count: number }>();
  for (const receipt of receiptsWithAmount) {
    const existing = vendorMap.get(receipt.vendor) || { amount: 0, count: 0 };
    vendorMap.set(receipt.vendor, {
      amount: existing.amount + (receipt.amount || 0),
      count: existing.count + 1,
    });
  }
  const topVendors = Array.from(vendorMap.entries())
    .map(([vendor, data]) => ({ vendor, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Category breakdown
  const categoryMap = new Map<ReceiptCategory, { amount: number; count: number }>();
  for (const receipt of receiptsWithAmount) {
    const existing = categoryMap.get(receipt.category) || { amount: 0, count: 0 };
    categoryMap.set(receipt.category, {
      amount: existing.amount + (receipt.amount || 0),
      count: existing.count + 1,
    });
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend (last 6 months)
  const monthlyTrend: DashboardStats['monthlyTrend'] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthReceipts = receiptsWithAmount.filter(
      (r) => r.date >= monthStart && r.date <= monthEnd
    );
    const byCategory: Record<ReceiptCategory, number> = {
      utilities: 0,
      subscriptions: 0,
      shopping: 0,
      food: 0,
      travel: 0,
      entertainment: 0,
      health: 0,
      insurance: 0,
      other: 0,
    };
    for (const receipt of monthReceipts) {
      byCategory[receipt.category] += receipt.amount || 0;
    }
    monthlyTrend.push({
      month: format(date, 'MMM yyyy'),
      total: monthReceipts.reduce((sum, r) => sum + (r.amount || 0), 0),
      count: monthReceipts.length,
      byCategory,
    });
  }

  return {
    totalSpent,
    totalReceipts: receipts.length,
    averagePerReceipt: receiptsWithAmount.length > 0 ? totalSpent / receiptsWithAmount.length : 0,
    topVendors,
    monthlyTrend,
    categoryBreakdown,
  };
}

export function useReceipts(): ReceiptsContextType {
  const context = useContext(ReceiptsContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
}
