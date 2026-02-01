import React from 'react';
import { Receipt, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useReceipts } from '../context/ReceiptsContext';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { MonthlyChart } from '../components/Dashboard/MonthlyChart';
import { CategoryBreakdown } from '../components/Dashboard/CategoryBreakdown';
import { TopVendors } from '../components/Dashboard/TopVendors';
import { ReceiptCard } from '../components/Receipts/ReceiptCard';
import { formatCurrency } from '../utils/helpers';

interface DashboardPageProps {
  onSelectReceipt: (receipt: import('../types').Receipt) => void;
}

export function DashboardPage({ onSelectReceipt }: DashboardPageProps) {
  const { receipts, stats, isLoading, toggleStarred } = useReceipts();

  // Get recent receipts (last 5)
  const recentReceipts = receipts.slice(0, 5);

  if (isLoading && receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading your receipts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your billing and receipts</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Spent"
          value={formatCurrency(stats?.totalSpent || 0)}
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Total Receipts"
          value={stats?.totalReceipts.toString() || '0'}
          icon={<Receipt className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Avg. per Receipt"
          value={formatCurrency(stats?.averagePerReceipt || 0)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(stats?.monthlyTrend[stats.monthlyTrend.length - 1]?.total || 0)}
          icon={<Calendar className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.monthlyTrend && <MonthlyChart data={stats.monthlyTrend} />}
        {stats?.categoryBreakdown && <CategoryBreakdown data={stats.categoryBreakdown} />}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        {stats?.topVendors && <TopVendors data={stats.topVendors} />}

        {/* Recent Receipts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Receipts</h3>
          {recentReceipts.length > 0 ? (
            <div className="space-y-2">
              {recentReceipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  isSelected={false}
                  onSelect={() => onSelectReceipt(receipt)}
                  onToggleStar={() => toggleStarred(receipt.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No receipts found</p>
          )}
        </div>
      </div>
    </div>
  );
}
