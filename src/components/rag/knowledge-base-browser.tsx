'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Document, TreeNode, DocumentFilter } from '@/types';
import { ragApi } from '@/lib/convex';

interface KnowledgeBaseBrowserProps {
  onDocumentSelect?: (document: Document) => void;
  className?: string;
}

export function KnowledgeBaseBrowser({ onDocumentSelect, className }: KnowledgeBaseBrowserProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<DocumentFilter>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [filter]);

  useEffect(() => {
    buildTreeStructure();
  }, [documents, searchQuery]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await ragApi.getDocuments(filter);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTreeStructure = () => {
    const filteredDocs = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.metadata.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group documents by status
    const statusGroups: Record<string, Document[]> = {
      completed: [],
      processing: [],
      error: [],
      uploading: []
    };

    filteredDocs.forEach(doc => {
      statusGroups[doc.status].push(doc);
    });

    const tree: TreeNode[] = [];

    Object.entries(statusGroups).forEach(([status, docs]) => {
      if (docs.length > 0) {
        const statusNode: TreeNode = {
          id: `status-${status}`,
          name: `${status.charAt(0).toUpperCase() + status.slice(1)} (${docs.length})`,
          type: 'folder',
          isExpanded: true,
          children: docs.map(doc => ({
            id: doc._id,
            name: doc.title || doc.metadata.filename,
            type: 'document',
            metadata: doc,
            isSelected: selectedNodeId === doc._id
          }))
        };
        tree.push(statusNode);
      }
    });

    setTreeData(tree);
  };

  const toggleNode = (nodeId: string) => {
    setTreeData(prev => 
      prev.map(node => 
        node.id === nodeId 
          ? { ...node, isExpanded: !node.isExpanded }
          : node
      )
    );
  };

  const selectNode = (node: TreeNode) => {
    if (node.type === 'document' && node.metadata) {
      setSelectedNodeId(node.id);
      onDocumentSelect?.(node.metadata as Document);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      await ragApi.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc._id !== documentId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isFolder = node.type === 'folder';
    const isDocument = node.type === 'document';
    const doc = node.metadata as Document;

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer hover:bg-accent/50 transition-colors',
            node.isSelected && 'bg-accent',
            depth > 0 && 'ml-4'
          )}
          onClick={() => isFolder ? toggleNode(node.id) : selectNode(node)}
        >
          {isFolder && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {node.isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}

          {isFolder ? (
            node.isExpanded ? (
              <FolderOpen className="h-4 w-4 text-primary" />
            ) : (
              <Folder className="h-4 w-4 text-primary" />
            )
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}

          <span className="flex-1 text-sm font-medium truncate">
            {node.name}
          </span>

          {isDocument && doc && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {doc.metadata.mimetype.split('/')[1]?.toUpperCase() || 'FILE'}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
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
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteDocument(doc._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {isFolder && node.isExpanded && node.children && (
          <div className="ml-2">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Tree View */}
            <div className="border rounded-md max-h-96 overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading documents...
                </div>
              ) : treeData.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No documents found
                </div>
              ) : (
                <div className="p-2">
                  {treeData.map(node => renderTreeNode(node))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Details Panel */}
      {selectedNodeId && (
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedDoc = documents.find(doc => doc._id === selectedNodeId);
              if (!selectedDoc) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedDoc.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoc.metadata.filename}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File Size:</span>
                      <p className="text-muted-foreground">
                        {formatFileSize(selectedDoc.metadata.filesize)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p className="text-muted-foreground">
                        {selectedDoc.metadata.mimetype}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Uploaded:</span>
                      <p className="text-muted-foreground">
                        {formatDate(selectedDoc.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <Badge variant={selectedDoc.status === 'completed' ? 'success' : 'secondary'}>
                        {selectedDoc.status}
                      </Badge>
                    </div>
                  </div>

                  {selectedDoc.metadata.tags && selectedDoc.metadata.tags.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDoc.metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDoc.sections && (
                    <div>
                      <span className="font-medium text-sm">Sections:</span>
                      <p className="text-muted-foreground text-sm">
                        {selectedDoc.sections.length} sections processed
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}