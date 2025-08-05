'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  FileText, 
  RefreshCw,
  Search,
  AlertCircle,
  Info
} from 'lucide-react';
import { convex } from '@/lib/convex';

interface DiagnosticData {
  timestamp: string;
  summary: {
    totalDocuments: number;
    totalChunks: number;
    totalFiles: number;
    totalQueries: number;
    totalStorageUsed: number;
    documentsWithoutChunks: number;
    orphanedChunks: number;
    stuckDocuments: number;
  };
  documentStatuses: {
    pending: number;
    processing: number;
    completed: number;
    error: number;
    unknown: number;
  };
  embeddingStatus: {
    chunksWithEmbeddings: number;
    chunksWithoutEmbeddings: number;
    embeddingCoverage: string;
  };
  recentDocuments: Array<{
    id: string;
    title: string;
    fileName: string;
    status: string;
    fileSize: number;
    fileType: string;
    createdAt: string;
    updatedAt: string;
    hasContent: boolean;
    hasFileId: boolean;
    tags: string[];
    source: string;
  }>;
  documentsWithoutChunks: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
  orphanedChunks: Array<{
    chunkId: string;
    documentId: string;
    chunkIndex: number;
  }>;
  stuckDocuments: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    hoursStuck: number;
  }>;
  issues: string[];
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await convex.query("diagnostics:systemDiagnostics" as any);
      setDiagnostics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
      console.error('Diagnostics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'error': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Diagnostics Error</h2>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <Button 
              onClick={runDiagnostics}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Diagnostics</h1>
          <p className="text-gray-600 mt-1">Check the status of document uploads and processing</p>
        </div>
        <Button 
          onClick={runDiagnostics}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && !diagnostics && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Running diagnostics...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {diagnostics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Documents</p>
                    <p className="text-xl font-semibold">{diagnostics.summary.totalDocuments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Chunks</p>
                    <p className="text-xl font-semibold">{diagnostics.summary.totalChunks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Search className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Queries</p>
                    <p className="text-xl font-semibold">{diagnostics.summary.totalQueries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Storage Used</p>
                    <p className="text-xl font-semibold">{formatFileSize(diagnostics.summary.totalStorageUsed)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Document Processing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(diagnostics.documentStatuses).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                      {status.toUpperCase()}
                    </div>
                    <p className="text-2xl font-bold mt-2">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Embedding Status */}
          <Card>
            <CardHeader>
              <CardTitle>Embedding Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Chunks with Embeddings</p>
                  <p className="text-2xl font-bold text-green-600">{diagnostics.embeddingStatus.chunksWithEmbeddings}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Chunks without Embeddings</p>
                  <p className="text-2xl font-bold text-red-600">{diagnostics.embeddingStatus.chunksWithoutEmbeddings}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Coverage</p>
                  <p className="text-2xl font-bold text-blue-600">{diagnostics.embeddingStatus.embeddingCoverage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          {diagnostics.issues.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Issues Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diagnostics.issues.map((issue, index) => (
                    <li key={index} className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnostics.recentDocuments.length > 0 ? (
                  diagnostics.recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-gray-600">
                          {doc.fileName} • {formatFileSize(doc.fileSize)} • {doc.fileType}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(doc.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        <div className="flex gap-1">
                          {doc.hasContent && (
                            <Badge variant="outline" className="text-xs">
                              Content
                            </Badge>
                          )}
                          {doc.hasFileId && (
                            <Badge variant="outline" className="text-xs">
                              File
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No documents found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stuck Documents */}
          {diagnostics.stuckDocuments.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Clock className="h-5 w-5" />
                  Stuck Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {diagnostics.stuckDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <p className="font-medium text-red-900">{doc.title}</p>
                        <p className="text-sm text-red-700">Status: {doc.status}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800 border-red-300">
                        {doc.hoursStuck}h stuck
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamp */}
          <div className="text-center text-sm text-gray-500">
            Last updated: {new Date(diagnostics.timestamp).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}