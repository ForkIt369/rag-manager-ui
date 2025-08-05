'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2, Cloud, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/types';
import { ragApi } from '@/lib/convex';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
  className?: string;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/epub+zip': ['.epub'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
  'text/html': ['.html'],
  'text/plain': ['.txt'],
  'application/json': ['.json'],
  'text/markdown': ['.md']
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function CleanDocumentUpload({ onUploadComplete, className }: DocumentUploadProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: FileUpload[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Process each file
    for (let i = 0; i < newUploads.length; i++) {
      const upload = newUploads[i];
      const uploadIndex = uploads.length + i;

      try {
        // Update status to uploading
        setUploads(prev => 
          prev.map((u, idx) => 
            idx === uploadIndex ? { ...u, status: 'uploading' } : u
          )
        );

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploads(prev => 
            prev.map((u, idx) => 
              idx === uploadIndex ? { ...u, progress } : u
            )
          );
        }

        // Upload to Convex
        const result = await ragApi.uploadDocument(upload.file, {
          tags: [],
          source: 'manual_upload'
        });

        // Update status to processing
        setUploads(prev => 
          prev.map((u, idx) => 
            idx === uploadIndex 
              ? { ...u, status: 'processing', documentId: result.documentId }
              : u
          )
        );

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update status to completed
        setUploads(prev => 
          prev.map((u, idx) => 
            idx === uploadIndex ? { ...u, status: 'completed' } : u
          )
        );

        if (onUploadComplete && result.documentId) {
          onUploadComplete(result.documentId);
        }

      } catch (error: any) {
        setUploads(prev => 
          prev.map((u, idx) => 
            idx === uploadIndex 
              ? { ...u, status: 'error', error: error.message }
              : u
          )
        );
      }
    }
  }, [uploads.length, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'pending':
        return <File className="h-4 w-4 text-gray-400" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'processing':
        return <Cloud className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: FileUpload['status']) => {
    const statusConfig = {
      pending: { 
        className: 'bg-gray-100 text-gray-600',
        text: 'Pending'
      },
      uploading: { 
        className: 'bg-blue-100 text-blue-600',
        text: 'Uploading'
      },
      processing: { 
        className: 'bg-blue-100 text-blue-600',
        text: 'Processing'
      },
      completed: { 
        className: 'bg-green-100 text-green-600',
        text: 'Completed'
      },
      error: { 
        className: 'bg-red-100 text-red-600',
        text: 'Error'
      }
    };

    const config = statusConfig[status];
    
    return (
      <Badge className={cn('text-xs', config.className)}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="space-y-3">
                <Upload className="mx-auto h-12 w-12 text-blue-500" />
                <p className="text-base font-medium text-gray-900">Drop files here to upload</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-gray-900">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: PDF, DOCX, EPUB, XLSX, CSV, HTML, TXT, JSON, MD (max 50MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploads.map((upload, index) => (
                <div key={index} className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(upload.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {upload.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(upload.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpload(index)}
                        disabled={upload.status === 'uploading' || upload.status === 'processing'}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <Progress 
                      value={upload.progress} 
                      className="h-2"
                    />
                  )}
                  
                  {upload.status === 'error' && upload.error && (
                    <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}