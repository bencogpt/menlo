import React from 'react';
import { Receipt } from '../../types';
import { ReceiptCard } from './ReceiptCard';
import { FileText, Inbox } from 'lucide-react';

interface ReceiptsListProps {
  receipts: Receipt[];
  selectedId: string | null;
  onSelect: (receipt: Receipt) => void;
  onToggleStar: (id: string) => void;
  isLoading: boolean;
}

export function ReceiptsList({
  receipts,
  selectedId,
  onSelect,
  onToggleStar,
  isLoading,
}: ReceiptsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Loading receipts from Gmail...</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Inbox className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-600">No receipts found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {receipts.map((receipt) => (
        <ReceiptCard
          key={receipt.id}
          receipt={receipt}
          isSelected={receipt.id === selectedId}
          onSelect={() => onSelect(receipt)}
          onToggleStar={() => onToggleStar(receipt.id)}
        />
      ))}
    </div>
  );
}
