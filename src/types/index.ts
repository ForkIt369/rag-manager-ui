// Document types
export interface Document {
  _id: string;
  title: string;
  content: string;
  metadata: {
    filename: string;
    filesize: number;
    mimetype: string;
    uploadedAt: string;
    tags?: string[];
    author?: string;
    language?: string;
  };
  status: 'uploading' | 'processing' | 'completed' | 'error';
  sections?: DocumentSection[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSection {
  _id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: {
    sectionNumber: number;
    title?: string;
    pageNumber?: number;
    wordCount: number;
  };
}

// Search types
export interface SearchQuery {
  query: string;
  filters?: {
    documentIds?: string[];
    tags?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  options?: {
    limit?: number;
    threshold?: number;
    includeContent?: boolean;
  };
}

export interface SearchResult {
  documentId: string;
  sectionId: string;
  title: string;
  content: string;
  score: number;
  metadata: {
    filename: string;
    sectionNumber: number;
    pageNumber?: number;
  };
}

// Upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

// Analytics types
export interface AnalyticsData {
  totalDocuments: number;
  totalSections: number;
  totalQueries: number;
  storageUsed: number;
  avgQueryTime: number;
  topQueries: Array<{
    query: string;
    count: number;
    avgScore: number;
  }>;
  documentStats: Array<{
    documentId: string;
    title: string;
    queryCount: number;
    avgScore: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    queries: number;
    uploads: number;
  }>;
}

// Settings types
export interface Settings {
  apiKeys: {
    openai?: string;
    anthropic?: string;
    voyageai?: string;
  };
  models: {
    embedding: string;
    chat: string;
  };
  chunking: {
    chunkSize: number;
    chunkOverlap: number;
  };
  search: {
    defaultLimit: number;
    defaultThreshold: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarCollapsed: boolean;
  };
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

// Filter types
export interface DocumentFilter {
  search?: string;
  tags?: string[];
  status?: Document['status'];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'filesize';
  sortOrder?: 'asc' | 'desc';
}

// Tree view types for knowledge base
export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'section';
  children?: TreeNode[];
  metadata?: any;
  isExpanded?: boolean;
  isSelected?: boolean;
}

// Query history types
export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  avgScore: number;
  executionTime: number;
}

// Memory types
export interface Memory {
  _id: string;
  content: string;
  metadata: {
    source?: string;
    tags?: string[];
    importance?: number;
  };
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}