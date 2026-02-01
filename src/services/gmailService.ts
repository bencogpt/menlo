import { Receipt, GmailMessage, ReceiptCategory, Attachment } from '../types';
import { CATEGORY_KEYWORDS, RECEIPT_SEARCH_QUERIES } from '../config/gmail';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export class GmailService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${GMAIL_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async fetchReceipts(maxResults: number = 100): Promise<Receipt[]> {
    // Build search query for receipts
    const query = RECEIPT_SEARCH_QUERIES.join(' OR ');

    // Fetch message IDs
    const listResponse = await this.fetch<{
      messages?: { id: string; threadId: string }[];
      nextPageToken?: string;
    }>(`/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);

    if (!listResponse.messages || listResponse.messages.length === 0) {
      return [];
    }

    // Fetch full message details in batches
    const batchSize = 10;
    const receipts: Receipt[] = [];

    for (let i = 0; i < listResponse.messages.length; i += batchSize) {
      const batch = listResponse.messages.slice(i, i + batchSize);
      const messagePromises = batch.map((msg) =>
        this.fetch<GmailMessage>(`/messages/${msg.id}?format=full`)
      );

      const messages = await Promise.all(messagePromises);

      for (const message of messages) {
        const receipt = this.parseMessageToReceipt(message);
        if (receipt) {
          receipts.push(receipt);
        }
      }
    }

    return receipts.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private parseMessageToReceipt(message: GmailMessage): Receipt | null {
    const headers = message.payload.headers;
    const getHeader = (name: string): string => {
      const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
      return header?.value || '';
    };

    const subject = getHeader('Subject');
    const fromRaw = getHeader('From');
    const dateStr = getHeader('Date');

    // Parse from field
    const fromMatch = fromRaw.match(/^(?:"?([^"<]+)"?\s*)?<?([^>]+)>?$/);
    const fromName = fromMatch?.[1]?.trim() || fromRaw;
    const fromEmail = fromMatch?.[2] || fromRaw;

    // Parse body
    const body = this.extractBody(message.payload);

    // Extract amount from subject or body
    const amount = this.extractAmount(subject, body);

    // Detect category
    const category = this.detectCategory(subject, fromEmail, body);

    // Extract vendor name
    const vendor = this.extractVendor(fromName, fromEmail);

    // Get attachments
    const attachments = this.extractAttachments(message.payload);

    return {
      id: message.id,
      subject,
      from: fromName,
      fromEmail,
      date: new Date(dateStr || parseInt(message.internalDate, 10)),
      amount,
      currency: 'USD',
      category,
      vendor,
      snippet: message.snippet,
      body,
      attachments,
      isRead: !message.labelIds?.includes('UNREAD'),
      starred: message.labelIds?.includes('STARRED') || false,
      labels: message.labelIds || [],
    };
  }

  private extractBody(payload: GmailMessage['payload']): string {
    let body = '';

    if (payload.body?.data) {
      body = this.decodeBase64(payload.body.data);
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          body = this.decodeBase64(part.body.data);
          break;
        } else if (part.mimeType === 'text/html' && part.body.data && !body) {
          body = this.stripHtml(this.decodeBase64(part.body.data));
        } else if (part.parts) {
          // Handle nested parts
          for (const nestedPart of part.parts) {
            if (nestedPart.mimeType === 'text/plain' && nestedPart.body.data) {
              body = this.decodeBase64(nestedPart.body.data);
              break;
            }
          }
        }
      }
    }

    return body;
  }

  private decodeBase64(data: string): string {
    try {
      const decoded = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
      return decodeURIComponent(
        decoded
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return data;
    }
  }

  private stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  private extractAmount(subject: string, body: string): number | null {
    const text = `${subject} ${body}`;

    // Match various currency formats
    const patterns = [
      /\$\s*([\d,]+\.?\d*)/g,           // $123.45 or $1,234.56
      /USD\s*([\d,]+\.?\d*)/gi,         // USD 123.45
      /total[:\s]+\$?\s*([\d,]+\.?\d*)/gi,  // Total: $123.45
      /amount[:\s]+\$?\s*([\d,]+\.?\d*)/gi, // Amount: $123.45
      /charged[:\s]+\$?\s*([\d,]+\.?\d*)/gi, // Charged: $123.45
      /payment[:\s]+\$?\s*([\d,]+\.?\d*)/gi, // Payment: $123.45
    ];

    let maxAmount: number | null = null;

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0 && amount < 100000) {
          if (maxAmount === null || amount > maxAmount) {
            maxAmount = amount;
          }
        }
      }
    }

    return maxAmount;
  }

  private detectCategory(subject: string, fromEmail: string, body: string): ReceiptCategory {
    const text = `${subject} ${fromEmail} ${body}`.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return category as ReceiptCategory;
        }
      }
    }

    return 'other';
  }

  private extractVendor(fromName: string, fromEmail: string): string {
    // Try to get vendor from email domain
    const domainMatch = fromEmail.match(/@([^.]+)/);
    if (domainMatch) {
      const domain = domainMatch[1].toLowerCase();
      // Capitalize first letter
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    // Fall back to from name
    return fromName.split(/[<(]/)[0].trim();
  }

  private extractAttachments(payload: GmailMessage['payload']): Attachment[] {
    const attachments: Attachment[] = [];

    const processPayload = (part: GmailMessage['payload'] | GmailMessage['payload']['parts'][number]) => {
      if ('filename' in part && part.filename && part.body?.attachmentId) {
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
        });
      }

      if ('parts' in part && part.parts) {
        for (const subpart of part.parts) {
          processPayload(subpart);
        }
      }
    };

    processPayload(payload);
    return attachments;
  }

  async downloadAttachment(messageId: string, attachmentId: string): Promise<Blob> {
    const response = await this.fetch<{ data: string; size: number }>(
      `/messages/${messageId}/attachments/${attachmentId}`
    );

    const binaryString = atob(response.data.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes]);
  }
}
