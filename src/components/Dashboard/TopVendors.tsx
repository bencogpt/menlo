import React from 'react';
import { Store } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface TopVendorsProps {
  data: { vendor: string; amount: number; count: number }[];
}

export function TopVendors({ data }: TopVendorsProps) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors</h3>
      <div className="space-y-4">
        {data.map((vendor, index) => {
          const width = (vendor.amount / maxAmount) * 100;
          return (
            <div key={vendor.vendor}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}.
                  </span>
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{vendor.vendor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{vendor.count} receipts</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(vendor.amount)}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No vendor data available</p>
        )}
      </div>
    </div>
  );
}
