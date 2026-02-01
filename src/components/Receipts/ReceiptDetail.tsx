import React from 'react';
import {
  X,
  Star,
  Download,
  ExternalLink,
  Calendar,
  DollarSign,
  Tag,
  Mail,
  Paperclip,
} from 'lucide-react';
import { Receipt } from '../../types';
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCategoryLabel,
  classNames,
} from '../../utils/helpers';

interface ReceiptDetailProps {
  receipt: Receipt;
  onClose: () => void;
  onToggleStar: () => void;
}

export function ReceiptDetail({ receipt, onClose, onToggleStar }: ReceiptDetailProps) {
  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStar}
            className={classNames(
              'p-1 rounded transition-colors',
              receipt.starred
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-300 hover:text-gray-400'
            )}
          >
            <Star className={classNames('w-5 h-5', receipt.starred && 'fill-current')} />
          </button>
          <h2 className="font-semibold text-gray-900">Receipt Details</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Vendor & Amount */}
        <div className="text-center py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{receipt.vendor}</h3>
          {receipt.amount !== null && (
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {formatCurrency(receipt.amount, receipt.currency)}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(receipt.date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Tag className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <span
                className="inline-block px-2 py-0.5 text-xs rounded-full text-white mt-1"
                style={{ backgroundColor: getCategoryColor(receipt.category) }}
              >
                {getCategoryLabel(receipt.category)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">From</p>
              <p className="text-sm font-medium text-gray-900">{receipt.from}</p>
              <p className="text-xs text-gray-500 truncate">{receipt.fromEmail}</p>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Subject</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {receipt.subject}
          </p>
        </div>

        {/* Email Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Email Preview</h4>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap">
            {receipt.body || receipt.snippet}
          </div>
        </div>

        {/* Attachments */}
        {receipt.attachments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Attachments ({receipt.attachments.length})
            </h4>
            <div className="space-y-2">
              {receipt.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <a
          href={`https://mail.google.com/mail/u/0/#inbox/${receipt.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Gmail
        </a>
      </div>
    </div>
  );
}
