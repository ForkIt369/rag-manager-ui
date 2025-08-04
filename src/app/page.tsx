'use client';

import React, { useState } from 'react';
import { RAGLayout } from '@/components/rag/layout';
import { DocumentUpload } from '@/components/rag/document-upload';
import { KnowledgeBaseBrowser } from '@/components/rag/knowledge-base-browser';
import { QueryInterface } from '@/components/rag/query-interface';
import { AnalyticsDashboard } from '@/components/rag/analytics-dashboard';
import { SettingsPage } from '@/components/rag/settings-page';

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <DocumentUpload 
            onUploadComplete={(documentId) => {
              console.log('Document uploaded:', documentId);
              // Could switch to knowledge base or show success message
            }}
          />
        );
      case 'knowledge-base':
        return (
          <KnowledgeBaseBrowser 
            onDocumentSelect={(document) => {
              console.log('Document selected:', document);
              // Could show document details or switch to query interface
            }}
          />
        );
      case 'query':
        return <QueryInterface />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DocumentUpload />;
    }
  };

  return (
    <RAGLayout 
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </RAGLayout>
  );
}
