import React from 'react';
import { ReceiptCategory } from '../../types';
import { formatCurrency, getCategoryColor, getCategoryLabel } from '../../utils/helpers';

interface CategoryBreakdownProps {
  data: { category: ReceiptCategory; amount: number; count: number }[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>

      {/* Visual breakdown */}
      <div className="flex h-4 rounded-full overflow-hidden mb-4">
        {data.map((item) => {
          const width = total > 0 ? (item.amount / total) * 100 : 0;
          if (width < 1) return null;
          return (
            <div
              key={item.category}
              className="h-full"
              style={{
                width: `${width}%`,
                backgroundColor: getCategoryColor(item.category),
              }}
              title={`${getCategoryLabel(item.category)}: ${formatCurrency(item.amount)}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.slice(0, 6).map((item) => {
          const percentage = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0';
          return (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                />
                <span className="text-sm text-gray-600">
                  {getCategoryLabel(item.category)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{percentage}%</span>
                <span className="text-sm font-medium text-gray-900 w-24 text-right">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
