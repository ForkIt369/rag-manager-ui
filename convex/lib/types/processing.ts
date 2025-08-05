export interface ProcessedContent {
  content: string
  metadata: DocumentMetadata
  chunks?: ProcessedChunk[]
  images?: ProcessedImage[]
  tables?: ProcessedTable[]
}

export interface ProcessedChunk {
  content: string
  startIndex: number
  endIndex: number
  tokens: number
  metadata: ChunkMetadata
}

export interface ProcessedImage {
  url?: string
  base64?: string
  description?: string
  pageNumber?: number
  metadata?: Record<string, any>
}

export interface ProcessedTable {
  headers: string[]
  rows: string[][]
  pageNumber?: number
  metadata?: Record<string, any>
}

export interface DocumentMetadata {
  title?: string
  author?: string
  createdDate?: Date
  modifiedDate?: Date
  pageCount?: number
  language?: string
  wordCount?: number
  [key: string]: any
}

export interface ChunkMetadata {
  pageNumber?: number
  section?: string
  type?: 'text' | 'code' | 'table' | 'list'
  [key: string]: any
}

export interface ProcessingOptions {
  chunkSize: number
  chunkOverlap: number
  embeddingModel: string
  includeImages: boolean
  extractTables: boolean
  ocrEnabled: boolean
  language?: string
}

export interface FileProcessor {
  canProcess(fileType: string): boolean
  process(
    fileBuffer: Buffer,
    options: ProcessingOptions
  ): Promise<ProcessedContent>
}

export interface ChunkingStrategy {
  chunk(
    content: string,
    options: ProcessingOptions
  ): Promise<ProcessedChunk[]>
}

export interface EmbeddingProvider {
  generateEmbeddings(
    texts: string[],
    model: string
  ): Promise<number[][]>
}

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'error'

export interface ProcessingJob {
  documentId: string
  status: string
  stage: string
  progress: number
  startedAt: number
  completedAt?: number
  error?: string
  metadata?: any
}