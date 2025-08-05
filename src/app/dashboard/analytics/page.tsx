'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Documents</p>
          <p className="text-3xl font-semibold text-gray-900">-</p>
        </Card>
        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Queries</p>
          <p className="text-3xl font-semibold text-gray-900">-</p>
        </Card>
        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Storage Used</p>
          <p className="text-3xl font-semibold text-gray-900">-</p>
        </Card>
        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Avg Query Time</p>
          <p className="text-3xl font-semibold text-gray-900">-</p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Over Time</h2>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart Area</p>
            </div>
          </Card>
        </div>

        {/* Top Queries */}
        <Card className="p-6 border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Queries</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">-</span>
                <span className="text-sm font-medium text-gray-900">-</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Most Queried Documents */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Queried Documents</h2>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart Area</p>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="p-6 border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-gray-900">-%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="text-sm font-medium text-gray-900">-%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">System Load</span>
                <span className="text-sm font-medium text-gray-900">-%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}