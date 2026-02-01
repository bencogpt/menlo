import React from 'react';
import { Filter, X } from 'lucide-react';
import { FilterOptions, ReceiptCategory } from '../../types';
import { getCategoryLabel } from '../../utils/helpers';

interface ReceiptFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  vendors: string[];
}

const categories: (ReceiptCategory | 'all')[] = [
  'all',
  'shopping',
  'subscriptions',
  'food',
  'utilities',
  'travel',
  'entertainment',
  'health',
  'insurance',
  'other',
];

export function ReceiptFilters({ filters, onFilterChange, vendors }: ReceiptFiltersProps) {
  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.minAmount !== null ||
    filters.maxAmount !== null ||
    filters.vendor !== null ||
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null;

  const clearFilters = () => {
    onFilterChange({
      category: 'all',
      minAmount: null,
      maxAmount: null,
      vendor: null,
      dateRange: { start: null, end: null },
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category filter */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              onFilterChange({ category: e.target.value as ReceiptCategory | 'all' })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : getCategoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor filter */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Vendor
          </label>
          <select
            value={filters.vendor || ''}
            onChange={(e) =>
              onFilterChange({ vendor: e.target.value || null })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Min Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="$0.00"
            value={filters.minAmount ?? ''}
            onChange={(e) =>
              onFilterChange({
                minAmount: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Max Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="$999.99"
            value={filters.maxAmount ?? ''}
            onChange={(e) =>
              onFilterChange({
                maxAmount: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={
              filters.dateRange.start
                ? filters.dateRange.start.toISOString().split('T')[0]
                : ''
            }
            onChange={(e) =>
              onFilterChange({
                dateRange: {
                  ...filters.dateRange,
                  start: e.target.value ? new Date(e.target.value) : null,
                },
              })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={
              filters.dateRange.end
                ? filters.dateRange.end.toISOString().split('T')[0]
                : ''
            }
            onChange={(e) =>
              onFilterChange({
                dateRange: {
                  ...filters.dateRange,
                  end: e.target.value ? new Date(e.target.value) : null,
                },
              })
            }
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  );
}
