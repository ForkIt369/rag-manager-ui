'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  FileText, 
  Search, 
  Database, 
  Clock,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AnalyticsData } from '@/types';
import { ragApi } from '@/lib/convex';

interface AnalyticsDashboardProps {
  className?: string;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analytics = await ragApi.getAnalytics();
      
      // Mock data for demonstration
      const mockData: AnalyticsData = {
        totalDocuments: 45,
        totalSections: 892,
        totalQueries: 1234,
        storageUsed: 2.4 * 1024 * 1024 * 1024, // 2.4GB
        avgQueryTime: 125,
        topQueries: [
          { query: 'What is machine learning?', count: 87, avgScore: 0.92 },
          { query: 'Neural network architecture', count: 64, avgScore: 0.88 },
          { query: 'Deep learning algorithms', count: 52, avgScore: 0.91 },
          { query: 'Natural language processing', count: 41, avgScore: 0.85 },
          { query: 'Computer vision techniques', count: 38, avgScore: 0.89 }
        ],
        documentStats: [
          { documentId: '1', title: 'AI Fundamentals.pdf', queryCount: 156, avgScore: 0.91 },
          { documentId: '2', title: 'Machine Learning Guide.docx', queryCount: 134, avgScore: 0.88 },
          { documentId: '3', title: 'Neural Networks.epub', queryCount: 98, avgScore: 0.93 },
          { documentId: '4', title: 'Data Science Handbook.pdf', queryCount: 87, avgScore: 0.86 },
          { documentId: '5', title: 'Python Programming.txt', queryCount: 76, avgScore: 0.84 }
        ],
        timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          queries: Math.floor(Math.random() * 50) + 10,
          uploads: Math.floor(Math.random() * 5)
        }))
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(1) + '%';
  };

  if (loading || !data) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Insights into your RAG system performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Badge
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalSections} sections processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalQueries.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(data.storageUsed)}</div>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgQueryTime}ms</div>
            <p className="text-xs text-muted-foreground">
              -8ms from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  name="Queries"
                />
                <Line 
                  type="monotone" 
                  dataKey="uploads" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Uploads"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Most Queried Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.documentStats} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip />
                <Bar dataKey="queryCount" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Queries and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Queries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Top Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topQueries.map((query, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{query.query}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {query.count} queries
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatScore(query.avgScore)} avg score
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Query Success Rate</span>
                  <span>94.2%</span>
                </div>
                <Progress value={94.2} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Relevance Score</span>
                  <span>89.1%</span>
                </div>
                <Progress value={89.1} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>System Uptime</span>
                  <span>99.9%</span>
                </div>
                <Progress value={99.9} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Processing Speed</span>
                  <span>87.3%</span>
                </div>
                <Progress value={87.3} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}