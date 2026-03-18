import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  Star,
  Inbox,
  Tag,
  FileDown,
} from 'lucide-react';
import { classNames } from '../../utils/helpers';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'receipts', name: 'All Receipts', icon: Receipt },
  { id: 'starred', name: 'Starred', icon: Star },
  { id: 'analytics', name: 'Analytics', icon: PieChart },
  { id: 'pitch-downloader', name: 'Pitch Downloader', icon: FileDown },
];

const categories = [
  { id: 'shopping', name: 'Shopping', color: '#3b82f6' },
  { id: 'subscriptions', name: 'Subscriptions', color: '#8b5cf6' },
  { id: 'food', name: 'Food & Dining', color: '#f97316' },
  { id: 'utilities', name: 'Utilities', color: '#ef4444' },
  { id: 'travel', name: 'Travel', color: '#06b6d4' },
  { id: 'other', name: 'Other', color: '#6b7280' },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Receipts</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Menu
          </p>
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={classNames(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentView === item.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Categories
          </p>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onViewChange(`category-${category.id}`)}
              className={classNames(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentView === `category-${category.id}`
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => onViewChange('settings')}
          className={classNames(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            currentView === 'settings'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </aside>
  );
}
