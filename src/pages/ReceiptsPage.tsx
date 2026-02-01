import React, { useMemo } from 'react';
import { useReceipts } from '../context/ReceiptsContext';
import { Receipt, ReceiptCategory } from '../types';
import { ReceiptsList } from '../components/Receipts/ReceiptsList';
import { ReceiptFilters } from '../components/Receipts/ReceiptFilters';
import { ReceiptDetail } from '../components/Receipts/ReceiptDetail';

interface ReceiptsPageProps {
  filterCategory?: ReceiptCategory;
  showStarredOnly?: boolean;
  selectedReceipt: Receipt | null;
  onSelectReceipt: (receipt: Receipt | null) => void;
}

export function ReceiptsPage({
  filterCategory,
  showStarredOnly,
  selectedReceipt,
  onSelectReceipt,
}: ReceiptsPageProps) {
  const {
    receipts,
    filteredReceipts,
    isLoading,
    filters,
    setFilters,
    toggleStarred,
  } = useReceipts();

  // Apply additional filters based on props
  const displayReceipts = useMemo(() => {
    let result = filteredReceipts;

    if (filterCategory) {
      result = result.filter((r) => r.category === filterCategory);
    }

    if (showStarredOnly) {
      result = result.filter((r) => r.starred);
    }

    return result;
  }, [filteredReceipts, filterCategory, showStarredOnly]);

  // Get unique vendors for filter dropdown
  const vendors = useMemo(() => {
    const vendorSet = new Set(receipts.map((r) => r.vendor));
    return Array.from(vendorSet).sort();
  }, [receipts]);

  // Get page title
  const getTitle = () => {
    if (showStarredOnly) return 'Starred Receipts';
    if (filterCategory) {
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
      return labels[filterCategory];
    }
    return 'All Receipts';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
        <p className="text-gray-500">
          {displayReceipts.length} receipt{displayReceipts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Filters */}
      {!filterCategory && !showStarredOnly && (
        <ReceiptFilters
          filters={filters}
          onFilterChange={setFilters}
          vendors={vendors}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Receipts list */}
        <div className="flex-1 overflow-y-auto">
          <ReceiptsList
            receipts={displayReceipts}
            selectedId={selectedReceipt?.id || null}
            onSelect={onSelectReceipt}
            onToggleStar={toggleStarred}
            isLoading={isLoading}
          />
        </div>

        {/* Receipt detail panel */}
        {selectedReceipt && (
          <div className="w-96 flex-shrink-0">
            <ReceiptDetail
              receipt={selectedReceipt}
              onClose={() => onSelectReceipt(null)}
              onToggleStar={() => toggleStarred(selectedReceipt.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
