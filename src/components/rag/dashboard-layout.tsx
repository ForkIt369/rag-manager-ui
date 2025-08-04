'use client';

import React, { useState, useEffect } from 'react';
import { 
  Command,
  Search,
  FileText,
  Upload,
  Database,
  BarChart3,
  Settings,
  ChevronRight,
  Home,
  Clock,
  Star,
  History,
  Plus,
  FolderOpen,
  MessageSquare,
  Sparkles,
  Brain,
  Zap,
  ArrowRight,
  Grid3x3,
  LayoutDashboard,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command as CommandComponent,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface RecentItem {
  id: string;
  title: string;
  type: 'document' | 'query' | 'upload';
  timestamp: Date;
  icon: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'focused'>('dashboard');
  const [selectedWorkspace, setSelectedWorkspace] = useState('default');
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Home']);
  
  // Mock data for recent items
  const recentItems: RecentItem[] = [
    {
      id: '1',
      title: 'Q4 Financial Report.pdf',
      type: 'document',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'What are the key metrics from last quarter?',
      type: 'query',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'Marketing Strategy 2024.docx',
      type: 'upload',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: <Upload className="h-4 w-4" />
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'upload',
      title: 'Upload Documents',
      description: 'Add new files to your knowledge base',
      icon: <Upload className="h-5 w-5" />,
      action: () => navigateTo('upload'),
      shortcut: '⌘U'
    },
    {
      id: 'query',
      title: 'New Query',
      description: 'Ask questions about your documents',
      icon: <Sparkles className="h-5 w-5" />,
      action: () => navigateTo('query'),
      shortcut: '⌘K'
    },
    {
      id: 'browse',
      title: 'Browse Knowledge',
      description: 'Explore your document library',
      icon: <Database className="h-5 w-5" />,
      action: () => navigateTo('knowledge-base'),
      shortcut: '⌘B'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Check usage and performance metrics',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => navigateTo('analytics'),
      shortcut: '⌘A'
    }
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigateTo = (section: string) => {
    setBreadcrumbs(['Home', section]);
    setCurrentView('focused');
    // In real app, this would trigger navigation
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={() => {
                  action.action();
                  setCommandOpen(false);
                }}
              >
                {action.icon}
                <span className="ml-2">{action.title}</span>
                {action.shortcut && (
                  <CommandShortcut>{action.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent Documents">
            {recentItems.filter(item => item.type === 'document').map((item) => (
              <CommandItem key={item.id}>
                {item.icon}
                <span className="ml-2">{item.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatTimeAgo(item.timestamp)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Top Navigation Bar */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-4">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <button
                  className={cn(
                    "px-2 py-1 rounded-md transition-colors",
                    index === breadcrumbs.length - 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => {
                    if (index === 0) setCurrentView('dashboard');
                  }}
                >
                  {crumb}
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* Center Search */}
          <div className="flex-1 max-w-xl mx-auto">
            <button
              onClick={() => setCommandOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 rounded-md hover:bg-muted/70 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Search or press ⌘K</span>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('dashboard')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'focused' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('focused')}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Focused
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          <div className="p-6 space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground">
                Your intelligent document assistant is ready to help
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="group relative overflow-hidden rounded-lg border bg-card p-6 text-left transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary inline-flex">
                        {action.icon}
                      </div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {action.shortcut && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="text-xs">
                        {action.shortcut}
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Documents */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <Button variant="ghost" size="sm">
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className={cn(
                        "p-2 rounded-md",
                        item.type === 'document' && "bg-blue-500/10 text-blue-500",
                        item.type === 'query' && "bg-purple-500/10 text-purple-500",
                        item.type === 'upload' && "bg-green-500/10 text-green-500"
                      )}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {formatTimeAgo(item.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Quick Stats</h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Documents</p>
                        <p className="text-2xl font-bold">247</p>
                      </div>
                      <FileText className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Queries Today</p>
                        <p className="text-2xl font-bold">18</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Processing</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <Zap className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Workspace Selector */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Workspaces</h2>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Workspace
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Default', 'Research', 'Legal Documents'].map((workspace) => (
                  <button
                    key={workspace}
                    onClick={() => setSelectedWorkspace(workspace.toLowerCase())}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all",
                      selectedWorkspace === workspace.toLowerCase()
                        ? "bg-primary/10 border-primary"
                        : "bg-card hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{workspace}</p>
                        <p className="text-sm text-muted-foreground">
                          {workspace === 'Default' ? '247 documents' : 
                           workspace === 'Research' ? '89 documents' : '156 documents'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">{children}</div>
        )}
      </main>
    </div>
  );
}