'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Search,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  Plus,
  Database,
  Users,
  Shield,
  Zap,
  Globe,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  badge?: string | number;
  active?: boolean;
}

export function Sidebar({ className, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['inventory']);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Documents',
      icon: FileText,
      children: [
        { label: 'All Documents', href: '/documents', icon: Package },
        { label: 'Upload New', href: '/documents/upload', icon: Plus },
        { label: 'Recent', href: '/documents/recent', icon: FileText },
      ],
    },
    {
      label: 'Knowledge Base',
      icon: Database,
      children: [
        { label: 'Browse', href: '/knowledge', icon: Search },
        { label: 'Categories', href: '/knowledge/categories', icon: Package },
        { label: 'Tags', href: '/knowledge/tags', icon: Globe },
      ],
    },
    {
      label: 'Query',
      href: '/query',
      icon: Search,
      badge: 'New',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      children: [
        { label: 'Overview', href: '/analytics', icon: BarChart3 },
        { label: 'Usage Stats', href: '/analytics/usage', icon: Zap },
        { label: 'Performance', href: '/analytics/performance', icon: Shield },
      ],
    },
    {
      label: 'Team',
      href: '/team',
      icon: Users,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = item.href === pathname;
    const isExpanded = expandedItems.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.label}>
        {item.href && !hasChildren ? (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              isActive && 'bg-gray-100 dark:bg-gray-800 text-primary',
              !isActive && 'text-gray-600 dark:text-gray-400',
              depth > 0 && 'ml-6'
            )}
          >
            <item.icon className="h-4 w-4" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    typeof item.badge === 'string' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-600 dark:text-gray-400',
              depth > 0 && 'ml-6'
            )}
          >
            <item.icon className="h-4 w-4" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </>
            )}
          </button>
        )}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1">
            {item.children!.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center">
              <span className="text-white font-bold text-sm">BR</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold">BroVerse</h1>
                <p className="text-xs text-gray-500">RAG Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map(item => renderNavItem(item))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <HelpCircle className="h-4 w-4" />
            {!collapsed && <span>Help & Support</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}