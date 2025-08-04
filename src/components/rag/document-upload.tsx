'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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

export function DocumentUpload({ onUploadComplete, className }: DocumentUploadProps) {
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
        return <File className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: FileUpload['status']) => {
    const variants = {
      pending: 'secondary',
      uploading: 'default',
      processing: 'default',
      completed: 'success',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status] as any}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF, DOCX, EPUB, Excel, CSV, HTML, TXT, JSON, Markdown
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 50MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map((upload, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(upload.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {upload.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(upload.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUpload(index)}
                        disabled={upload.status === 'uploading' || upload.status === 'processing'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <Progress value={upload.progress} className="h-2" />
                  )}
                  
                  {upload.status === 'error' && upload.error && (
                    <p className="text-xs text-destructive">{upload.error}</p>
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