'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Upload, 
  Database, 
  Search, 
  BarChart3, 
  Settings,
  Brain,
  FileText,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';

interface RAGLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function RAGLayout({ children, activeTab = 'upload', onTabChange }: RAGLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const navItems: NavItem[] = [
    {
      title: 'Upload Documents',
      href: 'upload',
      icon: 'Upload',
      badge: undefined
    },
    {
      title: 'Knowledge Base',
      href: 'knowledge-base',
      icon: 'Database',
      badge: undefined
    },
    {
      title: 'Query Interface',
      href: 'query',
      icon: 'Search',
      badge: undefined
    },
    {
      title: 'Analytics',
      href: 'analytics',
      icon: 'BarChart3',
      badge: undefined
    },
    {
      title: 'Settings',
      href: 'settings',
      icon: 'Settings',
      badge: undefined
    }
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      Upload,
      Database,
      Search,
      BarChart3,
      Settings,
      FileText,
      Brain
    };
    const IconComponent = icons[iconName as keyof typeof icons] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const toggleTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // In a real app, you'd apply the theme to the document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center gap-4 px-6">
          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">RAG Manager</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Retrieval Augmented Generation System
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === 'light' && <Sun className="h-5 w-5" />}
                  {theme === 'dark' && <Moon className="h-5 w-5" />}
                  {theme === 'system' && <Monitor className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleTheme('light')}>
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTheme('dark')}>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTheme('system')}>
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
            sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
            'lg:w-64 lg:block'
          )}
        >
          <div className="h-full py-6">
            <div className="px-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleTabChange(item.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
                    activeTab === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {getIcon(item.icon)}
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            <Separator className="my-6" />

            {/* System Status */}
            <div className="px-3">
              <div className="text-xs font-medium text-muted-foreground mb-3">
                System Status
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Convex</span>
                  <Badge variant="outline" className="text-xs">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vector DB</span>
                  <Badge variant="outline" className="text-xs">
                    Ready
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Embeddings</span>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}