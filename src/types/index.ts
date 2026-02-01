export interface Receipt {
  id: string;
  subject: string;
  from: string;
  fromEmail: string;
  date: Date;
  amount: number | null;
  currency: string;
  category: ReceiptCategory;
  vendor: string;
  snippet: string;
  body: string;
  attachments: Attachment[];
  isRead: boolean;
  starred: boolean;
  labels: string[];
}

export type ReceiptCategory =
  | 'utilities'
  | 'subscriptions'
  | 'shopping'
  | 'food'
  | 'travel'
  | 'entertainment'
  | 'health'
  | 'insurance'
  | 'other';

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: GmailHeader[];
    body?: {
      data?: string;
      size: number;
    };
    parts?: GmailPart[];
    mimeType: string;
  };
  internalDate: string;
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailPart {
  partId: string;
  mimeType: string;
  filename: string;
  body: {
    attachmentId?: string;
    size: number;
    data?: string;
  };
  parts?: GmailPart[];
}

export interface User {
  email: string;
  name: string;
  picture: string;
}

export interface FilterOptions {
  search: string;
  category: ReceiptCategory | 'all';
  dateRange: DateRange;
  minAmount: number | null;
  maxAmount: number | null;
  vendor: string | null;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface MonthlyStats {
  month: string;
  total: number;
  count: number;
  byCategory: Record<ReceiptCategory, number>;
}

export interface DashboardStats {
  totalSpent: number;
  totalReceipts: number;
  averagePerReceipt: number;
  topVendors: { vendor: string; amount: number; count: number }[];
  monthlyTrend: MonthlyStats[];
  categoryBreakdown: { category: ReceiptCategory; amount: number; count: number }[];
}
