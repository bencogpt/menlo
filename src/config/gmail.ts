// Gmail API configuration
// To use this app, you need to:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the Gmail API
// 4. Create OAuth 2.0 credentials (Web application)
// 5. Add http://localhost:3000 to authorized JavaScript origins
// 6. Add http://localhost:3000 to authorized redirect URIs
// 7. Copy your Client ID here

export const GMAIL_CONFIG = {
  // Replace with your actual Google OAuth Client ID
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

  // Gmail API scopes needed for reading emails
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' '),

  // Discovery doc for Gmail API
  discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
};

// Search queries to find receipts and invoices in Gmail
export const RECEIPT_SEARCH_QUERIES = [
  'subject:(receipt OR invoice OR order confirmation OR payment)',
  'from:(noreply OR no-reply OR receipt OR billing OR invoice)',
  'subject:(your order OR order confirmed OR payment received)',
];

// Common receipt senders to look for
export const KNOWN_RECEIPT_SENDERS = [
  'amazon',
  'paypal',
  'apple',
  'google',
  'netflix',
  'spotify',
  'uber',
  'lyft',
  'doordash',
  'grubhub',
  'instacart',
  'walmart',
  'target',
  'costco',
  'bestbuy',
  'ebay',
  'etsy',
  'shopify',
  'square',
  'stripe',
  'venmo',
];

// Category detection keywords
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  utilities: ['electric', 'gas', 'water', 'utility', 'power', 'energy', 'comcast', 'verizon', 'at&t', 'internet', 'phone bill'],
  subscriptions: ['subscription', 'membership', 'netflix', 'spotify', 'hulu', 'disney+', 'hbo', 'youtube premium', 'amazon prime', 'adobe', 'microsoft 365'],
  shopping: ['amazon', 'walmart', 'target', 'ebay', 'etsy', 'bestbuy', 'costco', 'order', 'purchase', 'shipped'],
  food: ['doordash', 'ubereats', 'grubhub', 'instacart', 'restaurant', 'food', 'grocery', 'whole foods', 'trader joe'],
  travel: ['flight', 'hotel', 'airbnb', 'booking', 'expedia', 'uber', 'lyft', 'airline', 'rental car', 'travel'],
  entertainment: ['ticket', 'concert', 'movie', 'game', 'steam', 'playstation', 'xbox', 'nintendo', 'eventbrite'],
  health: ['pharmacy', 'cvs', 'walgreens', 'medical', 'doctor', 'hospital', 'health', 'dental', 'vision'],
  insurance: ['insurance', 'geico', 'progressive', 'allstate', 'state farm', 'policy', 'premium'],
};
