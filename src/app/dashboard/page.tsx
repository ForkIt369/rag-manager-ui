'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  Search, 
  Database,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to RAG Manager
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">-</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Queries</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">-</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Search className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">-</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Query Time</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">-</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button className="w-full justify-start gap-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" asChild>
              <Link href="/dashboard/upload">
                <Upload className="h-4 w-4" />
                Upload Document
              </Link>
            </Button>
            <Button className="w-full justify-start gap-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" asChild>
              <Link href="/dashboard/query">
                <Search className="h-4 w-4" />
                New Query
              </Link>
            </Button>
            <Button className="w-full justify-start gap-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" asChild>
              <Link href="/dashboard/documents">
                <FileText className="h-4 w-4" />
                Browse Documents
              </Link>
            </Button>
            <Button className="w-full justify-start gap-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 border-gray-200 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">-</p>
                  <p className="text-xs text-gray-500">-</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}