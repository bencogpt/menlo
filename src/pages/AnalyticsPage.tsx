import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { useReceipts } from '../context/ReceiptsContext';
import { MonthlyChart } from '../components/Dashboard/MonthlyChart';
import { CategoryBreakdown } from '../components/Dashboard/CategoryBreakdown';
import { TopVendors } from '../components/Dashboard/TopVendors';
import { formatCurrency, getCategoryColor, getCategoryLabel } from '../utils/helpers';
import { ReceiptCategory } from '../types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export function AnalyticsPage() {
  const { receipts, stats, isLoading } = useReceipts();

  // Calculate month-over-month change
  const monthlyChange = useMemo(() => {
    if (!stats?.monthlyTrend || stats.monthlyTrend.length < 2) return null;

    const currentMonth = stats.monthlyTrend[stats.monthlyTrend.length - 1];
    const lastMonth = stats.monthlyTrend[stats.monthlyTrend.length - 2];

    if (lastMonth.total === 0) return null;

    const change = ((currentMonth.total - lastMonth.total) / lastMonth.total) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
      currentTotal: currentMonth.total,
      lastTotal: lastMonth.total,
    };
  }, [stats]);

  // Calculate category trends
  const categoryTrends = useMemo(() => {
    if (!stats?.monthlyTrend || stats.monthlyTrend.length < 2) return [];

    const currentMonth = stats.monthlyTrend[stats.monthlyTrend.length - 1];
    const lastMonth = stats.monthlyTrend[stats.monthlyTrend.length - 2];

    const categories: ReceiptCategory[] = [
      'shopping', 'subscriptions', 'food', 'utilities', 'travel', 'entertainment', 'health', 'insurance', 'other'
    ];

    return categories.map((category) => {
      const current = currentMonth.byCategory[category];
      const last = lastMonth.byCategory[category];
      const change = last > 0 ? ((current - last) / last) * 100 : current > 0 ? 100 : 0;

      return {
        category,
        current,
        last,
        change,
        isPositive: change >= 0,
      };
    }).filter((t) => t.current > 0 || t.last > 0).sort((a, b) => b.current - a.current);
  }, [stats]);

  // Get high-value receipts
  const highValueReceipts = useMemo(() => {
    return receipts
      .filter((r) => r.amount !== null)
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 10);
  }, [receipts]);

  if (isLoading && receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Detailed insights into your spending patterns</p>
      </div>

      {/* Month over month comparison */}
      {monthlyChange && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Month-over-Month</h3>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500">Last Month</p>
              <p className="text-2xl font-bold text-gray-700">
                {formatCurrency(monthlyChange.lastTotal)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  monthlyChange.isPositive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {monthlyChange.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-semibold">{monthlyChange.value}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyChange.currentTotal)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.monthlyTrend && <MonthlyChart data={stats.monthlyTrend} />}
        {stats?.categoryBreakdown && <CategoryBreakdown data={stats.categoryBreakdown} />}
      </div>

      {/* Category trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryTrends.map((trend) => (
            <div
              key={trend.category}
              className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(trend.category) }}
                  />
                  <span className="font-medium text-gray-900">
                    {getCategoryLabel(trend.category)}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    trend.isPositive ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(trend.change).toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(trend.current)}
              </p>
              <p className="text-sm text-gray-500">
                vs {formatCurrency(trend.last)} last month
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top vendors and high-value receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.topVendors && <TopVendors data={stats.topVendors} />}

        {/* High-value receipts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Highest Expenses</h3>
          <div className="space-y-3">
            {highValueReceipts.slice(0, 5).map((receipt, index) => (
              <div
                key={receipt.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-6">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{receipt.vendor}</p>
                    <p className="text-xs text-gray-500">
                      {format(receipt.date, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(receipt.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
