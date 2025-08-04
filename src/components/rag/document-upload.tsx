'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, BroCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, BroButton } from '@/components/ui/button';
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
        return <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-neon-purple" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-neon-lime" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusBadge = (status: FileUpload['status']) => {
    const statusConfig = {
      pending: { 
        variant: 'secondary' as const,
        className: 'bg-muted/50 text-muted-foreground border-muted/50',
        text: 'PENDING'
      },
      uploading: { 
        variant: 'default' as const,
        className: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 animate-pulse',
        text: 'UPLOADING'
      },
      processing: { 
        variant: 'default' as const,
        className: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30 animate-pulse',
        text: 'PROCESSING'
      },
      completed: { 
        variant: 'secondary' as const,
        className: 'bg-neon-lime/20 text-neon-lime border-neon-lime/30',
        text: 'COMPLETED'
      },
      error: { 
        variant: 'destructive' as const,
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
        text: 'ERROR'
      }
    };

    const config = statusConfig[status];
    
    return (
      <Badge className={cn('font-mono text-xs font-bold', config.className)}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-tech font-bold neon-text">
          Document Upload Center
        </h1>
        <p className="text-lg text-muted-foreground font-cyber">
          Power up your knowledge base with cutting-edge document intelligence
        </p>
      </div>

      <BroCard glowing>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple">
              <Upload className="h-6 w-6 text-background" />
            </div>
            <span className="font-tech">UPLOAD DOCUMENTS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden',
              isDragActive 
                ? 'border-neon-cyan bg-gradient-to-br from-neon-cyan/20 via-neon-purple/10 to-neon-lime/20 shadow-2xl shadow-neon-cyan/20' 
                : 'border-primary/30 hover:border-neon-cyan hover:bg-gradient-to-br hover:from-neon-cyan/10 hover:via-neon-purple/5 hover:to-neon-lime/10 hover:shadow-xl hover:shadow-primary/20'
            )}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="space-y-4">
                <Upload className="mx-auto h-16 w-16 text-neon-cyan animate-bounce" />
                <p className="text-xl font-bold text-neon-cyan font-tech">DROP FILES TO UPLOAD</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <Upload className="mx-auto h-20 w-20 text-neon-cyan/70 floating-element" />
                  <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-xl opacity-50" />
                </div>
                <div className="space-y-3">
                  <p className="text-xl font-bold font-tech text-foreground">
                    DRAG & DROP FILES OR CLICK TO SELECT
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    {['PDF', 'DOCX', 'EPUB', 'XLSX', 'CSV', 'HTML', 'TXT', 'JSON', 'MD'].map((type) => (
                      <Badge key={type} className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-cyber">
                    Maximum file size: <span className="text-neon-lime font-bold">50MB</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </BroCard>

      {uploads.length > 0 && (
        <BroCard>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-lime">
                <Loader2 className="h-5 w-5 text-background animate-spin" />
              </div>
              <span className="font-tech">UPLOAD PROGRESS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {uploads.map((upload, index) => (
                <div key={index} className="space-y-3 p-4 rounded-lg bg-card/50 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/20">
                        {getStatusIcon(upload.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold font-cyber truncate text-foreground">
                          {upload.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(upload.file.size / 1024 / 1024).toFixed(2)} MB • {upload.file.type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(upload.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUpload(index)}
                        disabled={upload.status === 'uploading' || upload.status === 'processing'}
                        className="hover:bg-destructive/20 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <div className="space-y-2">
                      <Progress 
                        value={upload.progress} 
                        className="h-3 bg-muted/50"
                      />
                      <p className="text-xs text-center font-mono text-neon-cyan">
                        {upload.status === 'uploading' ? 'UPLOADING...' : 'PROCESSING...'}
                      </p>
                    </div>
                  )}
                  
                  {upload.status === 'error' && upload.error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-destructive font-cyber">{upload.error}</p>
                    </div>
                  )}

                  {upload.status === 'completed' && (
                    <div className="p-3 rounded-lg bg-neon-lime/10 border border-neon-lime/20 text-center">
                      <p className="text-xs text-neon-lime font-cyber font-bold">UPLOAD COMPLETE</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </BroCard>
      )}
    </div>
  );
}