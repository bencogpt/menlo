import React from 'react';
import { Star, Paperclip } from 'lucide-react';
import { Receipt } from '../../types';
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCategoryLabel,
  truncateText,
  classNames,
} from '../../utils/helpers';

interface ReceiptCardProps {
  receipt: Receipt;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
}

export function ReceiptCard({
  receipt,
  isSelected,
  onSelect,
  onToggleStar,
}: ReceiptCardProps) {
  return (
    <div
      onClick={onSelect}
      className={classNames(
        'p-4 rounded-lg border cursor-pointer transition-all',
        isSelected
          ? 'bg-primary-50 border-primary-200 shadow-sm'
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Star button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className={classNames(
            'p-1 rounded transition-colors',
            receipt.starred
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-300 hover:text-gray-400'
          )}
        >
          <Star className={classNames('w-5 h-5', receipt.starred && 'fill-current')} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4
                className={classNames(
                  'text-sm truncate',
                  !receipt.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                )}
              >
                {receipt.vendor}
              </h4>
              <p className="text-sm text-gray-500 truncate">{receipt.subject}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              {receipt.amount !== null && (
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(receipt.amount, receipt.currency)}
                </span>
              )}
              <span className="text-xs text-gray-400">{formatDate(receipt.date)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {truncateText(receipt.snippet, 100)}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span
              className="px-2 py-0.5 text-xs rounded-full text-white"
              style={{ backgroundColor: getCategoryColor(receipt.category) }}
            >
              {getCategoryLabel(receipt.category)}
            </span>
            {receipt.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Paperclip className="w-3 h-3" />
                {receipt.attachments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
