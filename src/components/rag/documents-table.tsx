'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  Download,
  Trash2,
  MoreVertical,
  Upload,
  Database,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ragApi } from '@/lib/convex';

export function DocumentsTable() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    storageUsed: 0,
    totalQueries: 0,
    lastUpdated: null as Date | null
  });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const result = await ragApi.getDocuments();
      if (result?.documents) {
        setDocuments(result.documents);
      } else if (Array.isArray(result)) {
        setDocuments(result);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const analytics = await ragApi.getAnalytics();
      setStats({
        totalDocuments: analytics.totalDocuments || 0,
        storageUsed: analytics.storageUsed || 0,
        totalQueries: analytics.totalQueries || 0,
        lastUpdated: documents.length > 0 ? new Date(Math.max(...documents.map((d: any) => d.updatedAt || d.createdAt || 0))) : null
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await ragApi.deleteDocument(id);
        await fetchDocuments();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-1">Manage your documents and files</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/upload')}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-xl font-semibold">{stats.totalDocuments}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Database className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-xl font-semibold">{formatFileSize(stats.storageUsed)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Search className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Queries</p>
              <p className="text-xl font-semibold">{stats.totalQueries}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-xl font-semibold">{stats.lastUpdated ? stats.lastUpdated.toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Documents Table */}
      <Card className="border-gray-200">
        {/* Table Header with Search and Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                className="pl-10 border-gray-300"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40 border-gray-300">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">DOC</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="recent">
              <SelectTrigger className="w-full sm:w-40 border-gray-300">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700">Name</TableHead>
                <TableHead className="text-gray-700">Type</TableHead>
                <TableHead className="text-gray-700">Size</TableHead>
                <TableHead className="text-gray-700">Date Added</TableHead>
                <TableHead className="text-gray-700">Queries</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
                <TableHead className="text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      <span className="text-gray-600">Loading documents...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-600">No documents found. Upload your first document to get started.</p>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span>{doc.title || doc.fileName || 'Untitled'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doc.fileType || 'Unknown'}</TableCell>
                    <TableCell>{formatFileSize(doc.fileSize || 0)}</TableCell>
                    <TableCell>{formatDate(doc.createdAt)}</TableCell>
                    <TableCell>{doc.queryCount || 0}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-700' :
                        doc.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.status || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(doc._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {documents.length > 0 ? 1 : 0} to {documents.length} of {documents.length} documents
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}