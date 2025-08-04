'use client';

import React, { useState, useEffect } from 'react';
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
  Monitor,
  Zap,
  Activity,
  Shield,
  Cpu,
  HardDrive,
  Wifi
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
import { BroVerseLogo, CyberParticles } from '@/components/ui/broverse-logo';
import { 
  MatrixRain, 
  ScanlineEffect, 
  CyberButton,
  NeonGlowEffect,
  PulsingOrb
} from '@/components/ui/cyber-effects';
import { CyberSpinner } from '@/components/ui/cyber-loading';

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain className="opacity-5" />
      
      {/* Scanline Effect */}
      <ScanlineEffect className="opacity-[0.02]" />
      
      {/* Cyber Particles Background */}
      <CyberParticles />
      
      {/* Header */}
      <header className="border-b border-primary/20 bg-black/80 backdrop-blur sticky top-0 z-50 cyber-border">
        <div className="flex h-20 items-center gap-4 px-6">
          {/* Menu Toggle */}
          <CyberButton
            variant="ghost"
            size="small"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </CyberButton>

          {/* Logo */}
          <BroVerseLogo size="md" className="flex-shrink-0" />

          <div className="ml-auto flex items-center gap-4">
            {/* System Status Indicator */}
            <div className="hidden md:flex items-center gap-4 text-xs relative">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-neon-lime/30">
                <PulsingOrb size={8} color="lime" className="scale-75" />
                <span className="text-neon-lime font-medium font-tech">SYSTEM ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-neon-cyan animate-pulse" />
                <span className="text-neon-cyan font-mono">99.9%</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-3 w-3 text-neon-purple animate-pulse" />
                <span className="text-neon-purple font-mono">42%</span>
              </div>
            </div>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <CyberButton variant="ghost" size="small" className="relative">
                  {theme === 'light' && <Sun className="h-5 w-5 text-yellow-400" />}
                  {theme === 'dark' && <Moon className="h-5 w-5 text-neon-purple" />}
                  {theme === 'system' && <Monitor className="h-5 w-5 text-neon-cyan" />}
                </CyberButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bro-card border-primary/20">
                <DropdownMenuItem onClick={() => toggleTheme('light')}>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTheme('dark')}>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
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

      <div className="flex relative">
        {/* Sidebar */}
        <aside
          className={cn(
            'border-r border-primary/20 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-500 ease-in-out cyber-border',
            sidebarOpen ? 'w-72' : 'w-0 overflow-hidden',
            'lg:w-72 lg:block relative z-10'
          )}
        >
          <div className="h-full py-6">
            <div className="px-4 space-y-2">
              <div className="text-xs font-tech font-bold text-neon-cyan mb-4 tracking-wider">
                NAVIGATION
              </div>
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleTabChange(item.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 text-left group relative overflow-hidden',
                    activeTab === item.href
                      ? 'bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-neon-lime/20 text-foreground border border-primary/30 shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:border-primary/20 border border-transparent'
                  )}
                >
                  <div className={cn(
                    'transition-all duration-300 relative',
                    activeTab === item.href ? 'text-neon-cyan' : 'group-hover:text-neon-cyan'
                  )}>
                    {activeTab === item.href && (
                      <NeonGlowEffect color="cyan" intensity="medium" className="absolute inset-0">
                        <div className="w-full h-full" />
                      </NeonGlowEffect>
                    )}
                    <div className="relative z-10">
                      {getIcon(item.icon)}
                    </div>
                  </div>
                  <span className="flex-1 font-cyber">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs bg-neon-lime/20 text-neon-lime border-neon-lime/30">
                      {item.badge}
                    </Badge>
                  )}
                  {activeTab === item.href && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-neon-lime/10 rounded-lg -z-10" />
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-lime rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity duration-300 -z-20" />
                    </>
                  )}
                </button>
              ))}
            </div>

            <div className="my-8 mx-4 relative">
              <Separator className="bg-primary/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent animate-slide" />
            </div>

            {/* System Status */}
            <div className="px-4">
              <div className="text-xs font-tech font-bold text-neon-purple mb-4 tracking-wider">
                SYSTEM STATUS
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-black/50 to-black/30 border border-neon-lime/20 hover:border-neon-lime/40 transition-all duration-300 group">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Shield className="h-3 w-3 text-neon-lime relative z-10" />
                      <div className="absolute inset-0 bg-neon-lime/50 blur-sm group-hover:blur-md transition-all duration-300" />
                    </div>
                    <span className="text-neon-lime/80 font-cyber group-hover:text-neon-lime transition-colors duration-300">Convex</span>
                  </div>
                  <Badge className="text-xs bg-neon-lime/20 text-neon-lime border-neon-lime/30 animate-neon-pulse">
                    CONNECTED
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-black/50 to-black/30 border border-neon-cyan/20 hover:border-neon-cyan/40 transition-all duration-300 group">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Database className="h-3 w-3 text-neon-cyan relative z-10" />
                      <div className="absolute inset-0 bg-neon-cyan/50 blur-sm group-hover:blur-md transition-all duration-300" />
                    </div>
                    <span className="text-neon-cyan/80 font-cyber group-hover:text-neon-cyan transition-colors duration-300">Vector DB</span>
                  </div>
                  <Badge className="text-xs bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 animate-neon-pulse">
                    READY
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-black/50 to-black/30 border border-neon-purple/20 hover:border-neon-purple/40 transition-all duration-300 group">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Zap className="h-3 w-3 text-neon-purple relative z-10" />
                      <div className="absolute inset-0 bg-neon-purple/50 blur-sm group-hover:blur-md transition-all duration-300" />
                    </div>
                    <span className="text-neon-purple/80 font-cyber group-hover:text-neon-purple transition-colors duration-300">AI Engine</span>
                  </div>
                  <Badge className="text-xs bg-neon-purple/20 text-neon-purple border-neon-purple/30 animate-neon-pulse">
                    ACTIVE
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 cyber-grid-animated opacity-[0.03]" />
          <div className="h-full p-8 relative z-10">
            <div className="max-w-full">
              {children}
            </div>
          </div>
          
          {/* Corner decorations */}
          <div className="absolute top-4 right-4">
            <PulsingOrb size={40} color="cyan" className="opacity-20" />
          </div>
          <div className="absolute bottom-4 left-4">
            <PulsingOrb size={50} color="purple" className="opacity-15" />
          </div>
        </main>
      </div>
    </div>
  );
}