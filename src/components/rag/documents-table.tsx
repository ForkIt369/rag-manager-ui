'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'processed' | 'processing' | 'pending' | 'failed';
  tags: string[];
  vectorCount: number;
  lastAccessed: string;
}

const mockDocuments: Document[] = [
  {
    id: 'DOC-00001',
    name: 'Q4 Financial Report.pdf',
    type: 'PDF',
    uploadDate: 'Feb 02, 2025',
    size: '5.36 MB',
    status: 'processed',
    tags: ['finance', 'quarterly'],
    vectorCount: 324,
    lastAccessed: '24 Feb, 2025',
  },
  {
    id: 'DOC-00002',
    name: 'Product Roadmap 2025.docx',
    type: 'DOCX',
    uploadDate: 'Feb 03, 2025',
    size: '8.32 MB',
    status: 'processed',
    tags: ['product', 'strategy'],
    vectorCount: 512,
    lastAccessed: '25 Feb, 2025',
  },
  {
    id: 'DOC-00003',
    name: 'Marketing Analysis.xlsx',
    type: 'XLSX',
    uploadDate: 'Feb 05, 2025',
    size: '4.05 MB',
    status: 'processing',
    tags: ['marketing', 'data'],
    vectorCount: 0,
    lastAccessed: '26 Feb, 2025',
  },
  {
    id: 'DOC-00004',
    name: 'Legal Contract Template.pdf',
    type: 'PDF',
    uploadDate: 'Feb 06, 2025',
    size: '736 KB',
    status: 'processed',
    tags: ['legal', 'template'],
    vectorCount: 156,
    lastAccessed: '27 Feb, 2025',
  },
  {
    id: 'DOC-00005',
    name: 'User Research Notes.md',
    type: 'MD',
    uploadDate: 'Feb 07, 2025',
    size: '725 KB',
    status: 'processed',
    tags: ['research', 'users'],
    vectorCount: 89,
    lastAccessed: '28 Feb, 2025',
  },
  {
    id: 'DOC-00006',
    name: 'API Documentation.html',
    type: 'HTML',
    uploadDate: 'Feb 07, 2025',
    size: '425 KB',
    status: 'processed',
    tags: ['technical', 'api'],
    vectorCount: 234,
    lastAccessed: '26 Feb, 2025',
  },
  {
    id: 'DOC-00007',
    name: 'Sales Presentation.pptx',
    type: 'PPTX',
    uploadDate: 'Feb 08, 2025',
    size: '746 KB',
    status: 'failed',
    tags: ['sales'],
    vectorCount: 0,
    lastAccessed: '27 Feb, 2025',
  },
  {
    id: 'DOC-00008',
    name: 'Customer Database Export.csv',
    type: 'CSV',
    uploadDate: 'Feb 09, 2025',
    size: '538 KB',
    status: 'pending',
    tags: ['customers', 'data'],
    vectorCount: 0,
    lastAccessed: '28 Feb, 2025',
  },
];

const statusColors = {
  processed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function DocumentsTable() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">All Documents</h2>
          <p className="text-gray-500 mt-1">
            Manage and search through all your uploaded documents
          </p>
        </div>
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          Add New Document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Documents</p>
              <p className="text-2xl font-semibold">{mockDocuments.length}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 23% last week</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Processed</p>
              <p className="text-2xl font-semibold">
                {mockDocuments.filter(d => d.status === 'processed').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Ready for queries</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Processing</p>
              <p className="text-2xl font-semibold">
                {mockDocuments.filter(d => d.status === 'processing').length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">In progress</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Storage Used</p>
              <p className="text-2xl font-semibold">28.4 GB</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">of 100 GB</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vectors</TableHead>
              <TableHead>Last Accessed</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex gap-1 mt-1">
                      {doc.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.uploadDate}</TableCell>
                <TableCell>{doc.size}</TableCell>
                <TableCell>
                  <Badge className={cn('capitalize', statusColors[doc.status])}>
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {doc.vectorCount > 0 ? doc.vectorCount.toLocaleString() : '-'}
                </TableCell>
                <TableCell>{doc.lastAccessed}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}