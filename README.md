# Billing & Receipts Dashboard

A modern web dashboard to organize and track your billing receipts from Gmail. Connect your Google account to automatically import, categorize, and analyze your receipts and invoices.

## Features

- **Gmail Integration**: Automatically fetch receipts and invoices from your Gmail inbox
- **Smart Categorization**: Auto-categorize receipts (Shopping, Subscriptions, Utilities, Food, Travel, etc.)
- **Amount Extraction**: Automatically extract payment amounts from emails
- **Analytics Dashboard**: Track spending trends with visual charts
- **Filtering & Search**: Find receipts by vendor, date, amount, or category
- **Local Storage**: All data stays in your browser - we never store your emails

## Screenshots

The dashboard includes:
- Overview with spending statistics
- Monthly spending chart
- Category breakdown
- Top vendors
- Receipt list with search and filters
- Detailed receipt view

## Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Enable the **Gmail API**
5. Navigate to **APIs & Services** > **Credentials**
6. Click **Create Credentials** > **OAuth client ID**
7. Select **Web application**
8. Add `http://localhost:3000` to **Authorized JavaScript origins**
9. Add `http://localhost:3000` to **Authorized redirect URIs**
10. Copy your **Client ID**

### 2. Configure the Application

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Client ID:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. Click **Continue with Google** to sign in
2. Grant read-only access to your Gmail
3. The app will automatically fetch and categorize your receipts
4. Use the sidebar to navigate between views:
   - **Dashboard**: Overview with stats and charts
   - **All Receipts**: Browse and filter all receipts
   - **Starred**: View starred/favorite receipts
   - **Analytics**: Detailed spending analysis
   - **Categories**: Filter by spending category
   - **Settings**: Manage account and export data

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **date-fns** for date formatting
- **Google Identity Services** for OAuth
- **Gmail API** for fetching emails

## Privacy

- All data is stored locally in your browser
- We only request read-only access to your Gmail
- No email content is sent to any external server
- You can clear all cached data anytime from Settings

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## License

MIT
