import React from 'react';
import { MonthlyStats } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface MonthlyChartProps {
  data: MonthlyStats[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending</h3>
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((month, index) => {
          const height = (month.total / maxTotal) * 100;
          return (
            <div key={month.month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center justify-end h-40">
                <span className="text-xs text-gray-500 mb-1">
                  {formatCurrency(month.total)}
                </span>
                <div
                  className="w-full max-w-12 bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`${month.month}: ${formatCurrency(month.total)}`}
                />
              </div>
              <span className="text-xs text-gray-500 mt-2 whitespace-nowrap">
                {month.month.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
