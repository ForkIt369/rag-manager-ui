'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/rag/dashboard-layout';
import { SplitViewLayout } from '@/components/rag/split-view-layout';
import { DocumentUpload } from '@/components/rag/document-upload';
import { KnowledgeBaseBrowser } from '@/components/rag/knowledge-base-browser';
import { QueryInterface } from '@/components/rag/query-interface';
import { AnalyticsDashboard } from '@/components/rag/analytics-dashboard';
import { SettingsPage } from '@/components/rag/settings-page';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Database, 
  MessageSquare, 
  FileText,
  Plus,
  LayoutGrid,
  List,
  SplitSquareVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list' | 'split';
type WorkflowMode = 'browse' | 'upload' | 'query' | 'analyze';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('browse');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeQueryTab, setActiveQueryTab] = useState('new');
  
  // Query tabs management
  const [queryTabs, setQueryTabs] = useState([
    { id: 'new', title: 'New Query', content: null }
  ]);

  const addQueryTab = () => {
    const newTab = {
      id: `query-${Date.now()}`,
      title: `Query ${queryTabs.length}`,
      content: null
    };
    setQueryTabs([...queryTabs, newTab]);
    setActiveQueryTab(newTab.id);
  };

  const closeQueryTab = (tabId: string) => {
    if (queryTabs.length > 1) {
      const newTabs = queryTabs.filter(tab => tab.id !== tabId);
      setQueryTabs(newTabs);
      if (activeQueryTab === tabId) {
        setActiveQueryTab(newTabs[0].id);
      }
    }
  };

  const renderWorkflowContent = () => {
    switch (workflowMode) {
      case 'upload':
        return (
          <div className="h-full p-6">
            <DocumentUpload 
              onUploadComplete={(documentId) => {
                console.log('Document uploaded:', documentId);
                setWorkflowMode('browse');
              }}
            />
          </div>
        );

      case 'query':
        return (
          <div className="h-full flex flex-col">
            <Tabs value={activeQueryTab} onValueChange={setActiveQueryTab} className="flex-1">
              <div className="border-b px-4">
                <div className="flex items-center justify-between">
                  <TabsList className="h-12 p-0 bg-transparent">
                    {queryTabs.map((tab) => (
                      <TabsTrigger 
                        key={tab.id} 
                        value={tab.id}
                        className="relative px-4 h-12 data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                      >
                        <span>{tab.title}</span>
                        {queryTabs.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              closeQueryTab(tab.id);
                            }}
                            className="ml-2 hover:bg-muted rounded p-1"
                          >
                            ×
                          </button>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addQueryTab}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {queryTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="flex-1 p-0">
                  <QueryInterface />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        );

      case 'analyze':
        return (
          <div className="h-full p-6">
            <AnalyticsDashboard />
          </div>
        );

      case 'browse':
      default:
        if (viewMode === 'split') {
          return (
            <SplitViewLayout
              leftPanel={
                <KnowledgeBaseBrowser 
                  onDocumentSelect={setSelectedDocument}
                />
              }
              rightPanel={
                selectedDocument ? (
                  <div className="p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                      <div>
                        <h1 className="text-2xl font-bold mb-2">
                          {selectedDocument.title}
                        </h1>
                        <p className="text-muted-foreground">
                          {selectedDocument.metadata?.filename}
                        </p>
                      </div>
                      
                      <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="content">Content</TabsTrigger>
                          <TabsTrigger value="query">Query</TabsTrigger>
                          <TabsTrigger value="metadata">Metadata</TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="space-y-4">
                          <div className="prose dark:prose-invert max-w-none">
                            <p>Document content would be displayed here...</p>
                          </div>
                        </TabsContent>
                        <TabsContent value="query">
                          <QueryInterface documentContext={selectedDocument} />
                        </TabsContent>
                        <TabsContent value="metadata">
                          <pre className="p-4 bg-muted rounded-lg overflow-auto">
                            {JSON.stringify(selectedDocument.metadata, null, 2)}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center space-y-2">
                      <FileText className="h-12 w-12 mx-auto opacity-50" />
                      <p>Select a document to view details</p>
                    </div>
                  </div>
                )
              }
              leftPanelTitle="Knowledge Base"
              rightPanelTitle={selectedDocument?.title || "Document Details"}
              defaultLeftWidth={400}
            />
          );
        }

        return (
          <div className="h-full p-6">
            <KnowledgeBaseBrowser 
              onDocumentSelect={setSelectedDocument}
            />
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        {/* Workflow Navigation */}
        <div className="border-b bg-background">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              {[
                { id: 'browse', label: 'Browse', icon: Database },
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'query', label: 'Query', icon: MessageSquare },
                { id: 'analyze', label: 'Analytics', icon: FileText }
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={workflowMode === mode.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setWorkflowMode(mode.id as WorkflowMode)}
                  className="gap-2"
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                </Button>
              ))}
            </div>

            {workflowMode === 'browse' && (
              <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 w-7 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-7 w-7 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  className="h-7 w-7 p-0"
                >
                  <SplitSquareVertical className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderWorkflowContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}