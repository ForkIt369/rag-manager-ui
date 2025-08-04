'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  Search, 
  Activity,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Clock,
  Zap,
  Database,
  Brain
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down';
}

const stats: StatCard[] = [
  {
    title: 'Total Documents',
    value: '1,234',
    change: '+12%',
    icon: FileText,
    color: 'bg-blue-500',
    trend: 'up',
  },
  {
    title: 'Queries Today',
    value: '89',
    change: '+23%',
    icon: Search,
    color: 'bg-green-500',
    trend: 'up',
  },
  {
    title: 'Active Users',
    value: '42',
    change: '+5%',
    icon: Users,
    color: 'bg-purple-500',
    trend: 'up',
  },
  {
    title: 'Processing Speed',
    value: '0.8s',
    change: '-15%',
    icon: Zap,
    color: 'bg-orange-500',
    trend: 'down',
  },
];

const recentActivities = [
  {
    icon: Upload,
    title: 'Q4 Financial Report.pdf uploaded',
    time: '2 hours ago',
    user: 'John Doe',
  },
  {
    icon: Search,
    title: 'Query: "What are our Q3 revenue figures?"',
    time: '3 hours ago',
    user: 'Jane Smith',
  },
  {
    icon: FileText,
    title: 'Marketing Strategy 2025.docx processed',
    time: '5 hours ago',
    user: 'System',
  },
  {
    icon: Brain,
    title: 'Knowledge base index updated',
    time: '1 day ago',
    user: 'System',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's what's happening with your knowledge base today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className={cn(
                      'text-sm mt-1',
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {stat.change} from last month
                    </p>
                  )}
                </div>
                <div className={cn('p-3 rounded-lg', stat.color)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activity">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start gap-2" variant="outline" asChild>
                <Link href="/documents/upload">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" asChild>
                <Link href="/query">
                  <Search className="h-4 w-4" />
                  New Query
                </Link>
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" asChild>
                <Link href="/documents">
                  <FileText className="h-4 w-4" />
                  Browse Documents
                </Link>
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" asChild>
                <Link href="/analytics">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Performance</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/analytics/performance">
                View details
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-500">Vector Database</p>
              <p className="text-lg font-semibold">98.5% Uptime</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm text-gray-500">AI Processing</p>
              <p className="text-lg font-semibold">0.8s Avg</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-gray-500">API Response</p>
              <p className="text-lg font-semibold">124ms</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm text-gray-500">Queue Time</p>
              <p className="text-lg font-semibold">2.1s</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}