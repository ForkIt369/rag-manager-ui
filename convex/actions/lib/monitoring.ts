"use node"

import pino from 'pino'
import { Counter, Histogram, register } from 'prom-client'

// Logger setup
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
})

// Metrics setup
export const metrics = {
  processedDocuments: new Counter({
    name: 'documents_processed_total',
    help: 'Total documents processed',
    labelNames: ['format', 'status'],
    registers: [register]
  }),
  
  processingDuration: new Histogram({
    name: 'document_processing_duration_seconds',
    help: 'Document processing duration',
    labelNames: ['format', 'stage'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
    registers: [register]
  }),
  
  chunkCount: new Histogram({
    name: 'document_chunk_count',
    help: 'Number of chunks per document',
    labelNames: ['format'],
    buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    registers: [register]
  }),
  
  embeddingDuration: new Histogram({
    name: 'embedding_generation_duration_seconds',
    help: 'Embedding generation duration',
    labelNames: ['model', 'batch_size'],
    buckets: [0.1, 0.25, 0.5, 1, 2, 5, 10],
    registers: [register]
  }),
  
  errors: new Counter({
    name: 'processing_errors_total',
    help: 'Total processing errors',
    labelNames: ['format', 'stage', 'error_type'],
    registers: [register]
  })
}

export class ProcessingTimer {
  private startTime: number
  private stages: Map<string, number>
  
  constructor() {
    this.startTime = Date.now()
    this.stages = new Map()
  }
  
  startStage(stage: string): void {
    this.stages.set(stage, Date.now())
  }
  
  endStage(stage: string, format?: string): number {
    const stageStart = this.stages.get(stage)
    if (!stageStart) {
      logger.warn({ stage }, 'Stage timer not found')
      return 0
    }
    
    const duration = (Date.now() - stageStart) / 1000
    
    if (format) {
      metrics.processingDuration.observe(
        { format, stage },
        duration
      )
    }
    
    logger.info({
      stage,
      duration,
      format
    }, 'Stage completed')
    
    return duration
  }
  
  getTotalTime(): number {
    return (Date.now() - this.startTime) / 1000
  }
}

export function logProcessingStart(
  documentId: string,
  fileName: string,
  fileType: string,
  fileSize: number
): void {
  logger.info({
    documentId,
    fileName,
    fileType,
    fileSize
  }, 'Starting document processing')
}

export function logProcessingComplete(
  documentId: string,
  chunkCount: number,
  processingTime: number
): void {
  logger.info({
    documentId,
    chunkCount,
    processingTime
  }, 'Document processing completed')
}

export function logProcessingError(
  documentId: string,
  stage: string,
  error: Error,
  format?: string
): void {
  logger.error({
    documentId,
    stage,
    error: error.message,
    stack: error.stack
  }, 'Processing error occurred')
  
  if (format) {
    metrics.errors.inc({
      format,
      stage,
      error_type: error.constructor.name
    })
  }
}

export function recordChunkMetrics(
  format: string,
  chunkCount: number
): void {
  metrics.chunkCount.observe({ format }, chunkCount)
}

export function recordEmbeddingMetrics(
  model: string,
  batchSize: number,
  duration: number
): void {
  metrics.embeddingDuration.observe(
    { model, batch_size: batchSize.toString() },
    duration
  )
}

export async function getMetrics(): Promise<string> {
  return register.metrics()
}

export function createJobLogger(jobId: string) {
  return logger.child({ jobId })
}