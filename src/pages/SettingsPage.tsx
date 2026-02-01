import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReceipts } from '../context/ReceiptsContext';
import { User, Mail, Trash2, RefreshCw, Download, Shield, Bell } from 'lucide-react';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { receipts, refreshReceipts, isLoading } = useReceipts();
  const [notifications, setNotifications] = useState(true);

  const clearCache = () => {
    localStorage.removeItem('cached_receipts');
    window.location.reload();
  };

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalReceipts: receipts.length,
      receipts: receipts.map((r) => ({
        vendor: r.vendor,
        subject: r.subject,
        amount: r.amount,
        currency: r.currency,
        date: r.date.toISOString(),
        category: r.category,
        from: r.fromEmail,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      {/* Account section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>

        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Shield className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Data section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Cached Receipts</p>
              <p className="text-sm text-gray-500">{receipts.length} receipts stored locally</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshReceipts}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={clearCache}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Clear
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Export Data</p>
              <p className="text-sm text-gray-500">Download all your receipts as JSON</p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Preferences section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Notifications</p>
              <p className="text-sm text-gray-500">Get notified about new receipts</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>
      </div>

      {/* About section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        <div className="text-sm text-gray-500 space-y-2">
          <p>
            <strong>Billing & Receipts Dashboard</strong> v1.0.0
          </p>
          <p>
            This app connects to your Gmail account to automatically organize and
            categorize your billing receipts and invoices.
          </p>
          <p>
            Your data is stored locally in your browser. We never store your emails
            on external servers.
          </p>
        </div>
      </div>
    </div>
  );
}
