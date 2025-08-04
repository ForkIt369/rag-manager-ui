'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2, Zap, FileCode, Database } from 'lucide-react';
import { Card, BroCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, BroButton } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/types';
import { ragApi } from '@/lib/convex';
import { 
  HolographicCard, 
  CyberGlitchText, 
  NeonGlowEffect,
  CyberButton,
  FloatingParticles,
  PulsingOrb
} from '@/components/ui/cyber-effects';
import { CyberSpinner, QuantumLoader, GlitchLoader } from '@/components/ui/cyber-loading';

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
        return <CyberSpinner size="small" />;
      case 'processing':
        return <Database className="h-4 w-4 text-neon-purple animate-pulse" />;
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
      {/* Hero Section with Cyber Effects */}
      <div className="text-center space-y-4 mb-8 relative">
        <NeonGlowEffect color="cyan" intensity="high">
          <CyberGlitchText 
            text="Document Upload Center" 
            className="text-4xl font-tech font-bold text-neon-cyan"
            glitchInterval={5000}
          />
        </NeonGlowEffect>
        <p className="text-lg text-muted-foreground font-cyber">
          Power up your knowledge base with cutting-edge document intelligence
        </p>
        <div className="absolute -top-8 -right-8">
          <PulsingOrb size={60} color="purple" className="opacity-50" />
        </div>
        <div className="absolute -bottom-8 -left-8">
          <PulsingOrb size={80} color="lime" className="opacity-30" />
        </div>
      </div>

      <HolographicCard className="p-0">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple relative">
              <Upload className="h-6 w-6 text-background relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple blur-xl opacity-70 animate-pulse" />
            </div>
            <span className="font-tech bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">UPLOAD DOCUMENTS</span>
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
                  <NeonGlowEffect color="cyan" intensity="medium">
                    <Upload className="mx-auto h-20 w-20 text-neon-cyan" />
                  </NeonGlowEffect>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <Zap className="h-8 w-8 text-neon-purple animate-pulse" style={{ animation: 'orbit 4s linear infinite' }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xl font-bold font-tech text-foreground">
                    DRAG & DROP FILES OR CLICK TO SELECT
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    {['PDF', 'DOCX', 'EPUB', 'XLSX', 'CSV', 'HTML', 'TXT', 'JSON', 'MD'].map((type, index) => (
                      <Badge 
                        key={type} 
                        className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 hover:bg-neon-purple/30 hover:scale-110 transition-all duration-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
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
      </HolographicCard>

      {uploads.length > 0 && (
        <HolographicCard className="p-0">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-lime relative">
                <FileCode className="h-5 w-5 text-background relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-lime blur-xl opacity-70 animate-pulse" />
              </div>
              <span className="font-tech bg-gradient-to-r from-neon-purple to-neon-lime bg-clip-text text-transparent">UPLOAD PROGRESS</span>
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
                      <CyberButton
                        variant="ghost"
                        size="small"
                        onClick={() => removeUpload(index)}
                        disabled={upload.status === 'uploading' || upload.status === 'processing'}
                        className="hover:bg-destructive/20 hover:text-destructive p-2"
                      >
                        <X className="h-4 w-4" />
                      </CyberButton>
                    </div>
                  </div>
                  
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <div className="space-y-2">
                      <Progress 
                        value={upload.progress} 
                        className="h-3 bg-muted/50"
                      />
                      <p className="text-xs text-center font-mono text-neon-cyan animate-pulse">
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
                    <div className="p-3 rounded-lg bg-neon-lime/10 border border-neon-lime/20 text-center relative overflow-hidden">
                      <p className="text-xs text-neon-lime font-cyber font-bold animate-neon-pulse">UPLOAD COMPLETE</p>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-lime/20 to-transparent animate-slide" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </HolographicCard>
      )}
      
      {/* Floating particles effect */}
      <FloatingParticles />
    </div>
  );
}