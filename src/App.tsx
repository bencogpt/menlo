import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReceiptsProvider, useReceipts } from './context/ReceiptsContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PitchDownloaderPage } from './pages/PitchDownloaderPage';
import { Receipt, ReceiptCategory } from './types';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { setFilters } = useReceipts();
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setFilters({ search: value });
  };

  // Handle view change
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedReceipt(null);
  };

  // Handle receipt selection
  const handleSelectReceipt = (receipt: Receipt | null) => {
    setSelectedReceipt(receipt);
    if (receipt && currentView === 'dashboard') {
      setCurrentView('receipts');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Parse category from view if it's a category view
  const getCategoryFromView = (): ReceiptCategory | undefined => {
    if (currentView.startsWith('category-')) {
      return currentView.replace('category-', '') as ReceiptCategory;
    }
    return undefined;
  };

  // Render current page
  const renderPage = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage onSelectReceipt={handleSelectReceipt} />;
      case 'receipts':
        return (
          <ReceiptsPage
            selectedReceipt={selectedReceipt}
            onSelectReceipt={handleSelectReceipt}
          />
        );
      case 'starred':
        return (
          <ReceiptsPage
            showStarredOnly
            selectedReceipt={selectedReceipt}
            onSelectReceipt={handleSelectReceipt}
          />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'pitch-downloader':
        return <PitchDownloaderPage />;
      default:
        if (currentView.startsWith('category-')) {
          return (
            <ReceiptsPage
              filterCategory={getCategoryFromView()}
              selectedReceipt={selectedReceipt}
              onSelectReceipt={handleSelectReceipt}
            />
          );
        }
        return <DashboardPage onSelectReceipt={handleSelectReceipt} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header searchValue={searchValue} onSearchChange={handleSearchChange} />

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ReceiptsProvider>
        <AppContent />
      </ReceiptsProvider>
    </AuthProvider>
  );
}

export default App;
