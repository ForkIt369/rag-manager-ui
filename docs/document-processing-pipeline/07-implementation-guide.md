# Implementation Guide

## Step-by-Step Implementation

This guide walks through implementing the complete document processing pipeline in your Convex RAG system.

## Phase 1: Setup and Dependencies

### 1.1 Install Required Packages

```bash
# Core processing libraries
npm install pdf2pic pdfjs-dist pdf-parse mammoth xlsx csv-parse epub2 sharp tesseract.js marked cheerio iconv-lite file-type p-limit p-queue lodash voyageai @xenova/transformers pino prom-client

# Development dependencies
npm install -D @types/pdfjs-dist @types/lodash @types/node vitest tsx

# System dependencies (macOS)
brew install graphicsmagick tesseract poppler
```

### 1.2 Environment Configuration

```bash
# .env.local
VOYAGE_API_KEY=pa-R02PH3qx5COlTDPTuKCoh2aQCsBsacXBrECRJGWZI_P
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Processing Configuration
MAX_FILE_SIZE=104857600  # 100MB
PROCESSING_TIMEOUT=300000  # 5 minutes
DEFAULT_CHUNK_SIZE=1000
DEFAULT_CHUNK_OVERLAP=200
EMBEDDING_BATCH_SIZE=128
TEMP_DIR=/tmp/document-processing
```

### 1.3 Update Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    fileName: v.string(),
    fileId: v.id("_storage"),
    fileSize: v.number(),
    fileType: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error")
    ),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
    tags: v.array(v.string()),
    source: v.string(),
    chunkCount: v.optional(v.number()),
    processingTime: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    processedAt: v.optional(v.number())
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "fileType"]
    }),

  chunks: defineTable({
    documentId: v.id("documents"),
    content: v.string(),
    embedding: v.optional(v.array(v.float64())),
    embeddingModel: v.optional(v.string()),
    embeddingDimension: v.optional(v.number()),
    chunkIndex: v.number(),
    tokens: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number()
  })
    .index("by_document", ["documentId"])
    .index("by_embedding", ["embedding"])
    .vectorIndex("vector_search", {
      vectorField: "embedding",
      dimensions: 1024,
      filterFields: ["documentId"]
    }),

  processingJobs: defineTable({
    documentId: v.id("documents"),
    status: v.string(),
    stage: v.string(),
    progress: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    metadata: v.optional(v.any())
  })
    .index("by_document", ["documentId"])
    .index("by_status", ["status"])
})
```

## Phase 2: Core Processing Infrastructure

### 2.1 Create Base Processor Types

```typescript
// convex/lib/types/processing.ts
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

export interface DocumentMetadata {
  title?: string
  author?: string
  createdDate?: Date
  pageCount?: number
  language?: string
  [key: string]: any
}

export interface ProcessingOptions {
  chunkSize: number
  chunkOverlap: number
  embeddingModel: string
  includeImages: boolean
  extractTables: boolean
}
```

### 2.2 Implement File Storage Handler

```typescript
// convex/actions/fileHandler.ts
"use node"

import { action } from "../_generated/server"
import { v } from "convex/values"

export const uploadAndStore = action({
  args: {
    file: v.bytes(),
    metadata: v.object({
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.number()
    })
  },
  handler: async (ctx, args) => {
    // Store file in Convex storage
    const storageId = await ctx.storage.store(args.file)
    
    // Create document record
    const documentId = await ctx.runMutation(internal.documents.create, {
      title: args.metadata.fileName,
      fileName: args.metadata.fileName,
      fileId: storageId,
      fileSize: args.metadata.fileSize,
      fileType: args.metadata.fileType,
      status: "pending",
      tags: [],
      source: "manual_upload",
      createdAt: Date.now()
    })
    
    // Queue for processing
    await ctx.scheduler.runAfter(0, internal.processor.processDocument, {
      documentId
    })
    
    return { documentId, storageId }
  }
})
```

### 2.3 Create Document Processor Action

```typescript
// convex/actions/documentProcessor.ts
"use node"

import { action } from "../_generated/server"
import { v } from "convex/values"
import { ProcessingRouter } from "../lib/processors/router"
import { ChunkingOrchestrator } from "../lib/chunkers/orchestrator"
import { EmbeddingPipeline } from "../lib/embeddings/pipeline"

export const processDocument = action({
  args: {
    documentId: v.id("documents")
  },
  handler: async (ctx, args) => {
    const logger = getLogger("documentProcessor")
    
    try {
      // Update status to processing
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId: args.documentId,
        status: "processing",
        metadata: { startedAt: Date.now() }
      })
      
      // Get document and file
      const document = await ctx.runQuery(internal.documents.get, {
        id: args.documentId
      })
      
      if (!document) {
        throw new Error("Document not found")
      }
      
      // Get file from storage
      const file = await ctx.storage.get(document.fileId)
      if (!file) {
        throw new Error("File not found in storage")
      }
      
      // Create processing job
      const jobId = await ctx.runMutation(internal.jobs.create, {
        documentId: args.documentId,
        status: "running",
        stage: "extraction",
        progress: 0,
        startedAt: Date.now()
      })
      
      // Process document
      const router = new ProcessingRouter()
      const processed = await router.process(file, {
        fileName: document.fileName,
        fileType: document.fileType
      })
      
      // Update progress
      await ctx.runMutation(internal.jobs.updateProgress, {
        jobId,
        stage: "chunking",
        progress: 30
      })
      
      // Chunk content
      const chunker = new ChunkingOrchestrator()
      const chunks = await chunker.chunkDocument(processed, {
        maxTokens: 1000,
        minTokens: 100,
        overlap: 200,
        splitter: 'semantic'
      })
      
      // Update progress
      await ctx.runMutation(internal.jobs.updateProgress, {
        jobId,
        stage: "embedding",
        progress: 60
      })
      
      // Generate embeddings
      const pipeline = new EmbeddingPipeline()
      const embeddedChunks = await pipeline.processDocument(
        args.documentId,
        chunks
      )
      
      // Store chunks
      await ctx.runMutation(internal.chunks.createBatch, {
        chunks: embeddedChunks.map((chunk, index) => ({
          documentId: args.documentId,
          content: chunk.content,
          embedding: chunk.embedding,
          embeddingModel: chunk.embeddingModel,
          embeddingDimension: chunk.embeddingDimension,
          chunkIndex: index,
          tokens: chunk.tokens,
          metadata: chunk.metadata,
          createdAt: Date.now()
        }))
      })
      
      // Update document status
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId: args.documentId,
        status: "completed",
        metadata: {
          chunkCount: embeddedChunks.length,
          processingTime: Date.now() - document.createdAt,
          processedAt: Date.now()
        }
      })
      
      // Complete job
      await ctx.runMutation(internal.jobs.complete, {
        jobId,
        metadata: {
          chunks: embeddedChunks.length,
          processingTime: Date.now() - document.createdAt
        }
      })
      
      return {
        success: true,
        chunks: embeddedChunks.length
      }
      
    } catch (error) {
      logger.error("Document processing failed:", error)
      
      // Update document status
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId: args.documentId,
        status: "error",
        error: error.message
      })
      
      throw error
    }
  }
})
```

## Phase 3: Format-Specific Processors

### 3.1 PDF Processor Implementation

```typescript
// convex/lib/processors/pdfProcessor.ts
import { fromPath } from 'pdf2pic'
import * as pdfParse from 'pdf-parse'
import { ProcessedContent } from '../types/processing'

export class PDFProcessor {
  async process(file: Blob, options: ProcessingOptions): Promise<ProcessedContent> {
    // Save file temporarily
    const tempPath = await this.saveTempFile(file)
    
    try {
      // Detect if visual processing needed
      const useVisual = await this.shouldUseVisual(file)
      
      if (useVisual && options.includeImages) {
        return await this.processVisual(tempPath, options)
      } else {
        return await this.processText(file, options)
      }
    } finally {
      // Cleanup
      await this.cleanupTempFile(tempPath)
    }
  }
  
  private async processVisual(path: string, options: ProcessingOptions) {
    const pdf2pic = fromPath(path, {
      density: 300,
      saveFilename: 'page',
      savePath: process.env.TEMP_DIR,
      format: 'png',
      width: 2550,
      height: 3300
    })
    
    // Get page count
    const info = await this.getPDFInfo(path)
    const pages = []
    
    for (let i = 1; i <= info.pages; i++) {
      const imagePath = await pdf2pic(i)
      
      // Extract text with OCR
      const text = await this.extractTextFromImage(imagePath.path)
      
      pages.push({
        pageNumber: i,
        content: text,
        imagePath: imagePath.path,
        type: 'visual'
      })
    }
    
    return {
      content: pages.map(p => p.content).join('\n\n'),
      metadata: {
        ...info,
        processingType: 'visual'
      },
      images: pages.map(p => ({
        path: p.imagePath,
        pageNumber: p.pageNumber,
        extractedText: p.content
      }))
    }
  }
}
```

### 3.2 DOCX Processor Implementation

```typescript
// convex/lib/processors/docxProcessor.ts
import * as mammoth from 'mammoth'
import * as cheerio from 'cheerio'

export class DOCXProcessor {
  async process(file: Blob, options: ProcessingOptions): Promise<ProcessedContent> {
    const buffer = await file.arrayBuffer()
    
    // Extract HTML with styles
    const result = await mammoth.convertToHtml({
      arrayBuffer: buffer,
      options: {
        includeDefaultStyleMap: true,
        convertImage: mammoth.images.imgElement(image => {
          return image.read("base64").then(imageBuffer => ({
            src: `data:${image.contentType};base64,${imageBuffer}`
          }))
        })
      }
    })
    
    // Extract plain text
    const textResult = await mammoth.extractRawText({
      arrayBuffer: buffer
    })
    
    // Parse structure
    const $ = cheerio.load(result.value)
    const structure = this.parseStructure($)
    
    return {
      content: textResult.value,
      metadata: {
        hasImages: result.value.includes('<img'),
        warnings: result.messages,
        ...structure
      },
      tables: structure.tables
    }
  }
  
  private parseStructure($: CheerioStatic) {
    const headings = []
    const tables = []
    
    // Extract headings
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      headings.push({
        level: parseInt(el.tagName[1]),
        text: $(el).text(),
        index: i
      })
    })
    
    // Extract tables
    $('table').each((i, el) => {
      const rows = []
      $(el).find('tr').each((j, tr) => {
        const cells = []
        $(tr).find('td, th').each((k, td) => {
          cells.push($(td).text())
        })
        rows.push(cells)
      })
      tables.push({ rows, index: i })
    })
    
    return { headings, tables }
  }
}
```

## Phase 4: Intelligent Chunking

### 4.1 Semantic Chunker Implementation

```typescript
// convex/lib/chunkers/semanticChunker.ts
import { SentenceTokenizer } from 'natural'
import { encoding_for_model } from '@dqbd/tiktoken'

export class SemanticChunker {
  private tokenizer = new SentenceTokenizer()
  private encoder = encoding_for_model('gpt-3.5-turbo')
  
  chunk(content: string, options: ChunkOptions): Chunk[] {
    const sentences = this.tokenizer.tokenize(content)
    const chunks: Chunk[] = []
    
    let currentChunk: string[] = []
    let currentTokens = 0
    let startIdx = 0
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      const tokens = this.countTokens(sentence)
      
      if (currentTokens + tokens > options.maxTokens && currentChunk.length > 0) {
        // Save current chunk
        chunks.push(this.createChunk(
          currentChunk,
          startIdx,
          content.indexOf(currentChunk[currentChunk.length - 1]) + 
          currentChunk[currentChunk.length - 1].length
        ))
        
        // Start new chunk with overlap
        const overlapSentences = this.getOverlap(sentences, i, options.overlap)
        currentChunk = [...overlapSentences]
        currentTokens = this.countTokens(currentChunk.join(' '))
        startIdx = content.indexOf(sentence)
      }
      
      currentChunk.push(sentence)
      currentTokens += tokens
    }
    
    // Add final chunk
    if (currentChunk.length > 0) {
      chunks.push(this.createChunk(
        currentChunk,
        startIdx,
        content.length
      ))
    }
    
    return chunks
  }
  
  private countTokens(text: string): number {
    return this.encoder.encode(text).length
  }
  
  private createChunk(sentences: string[], start: number, end: number): Chunk {
    const content = sentences.join(' ')
    return {
      content,
      startIndex: start,
      endIndex: end,
      tokens: this.countTokens(content),
      metadata: {
        sentenceCount: sentences.length
      }
    }
  }
  
  private getOverlap(
    sentences: string[],
    currentIdx: number,
    overlapTokens: number
  ): string[] {
    const overlap: string[] = []
    let tokens = 0
    
    for (let i = currentIdx - 1; i >= 0 && tokens < overlapTokens; i--) {
      const sentence = sentences[i]
      const sentTokens = this.countTokens(sentence)
      
      if (tokens + sentTokens <= overlapTokens) {
        overlap.unshift(sentence)
        tokens += sentTokens
      } else {
        break
      }
    }
    
    return overlap
  }
}
```

## Phase 5: Embedding Generation

### 5.1 Voyage AI Integration

```typescript
// convex/lib/embeddings/voyageClient.ts
import { VoyageAIClient } from 'voyageai'

export class VoyageEmbedder {
  private client: VoyageAIClient
  
  constructor() {
    this.client = new VoyageAIClient({
      apiKey: process.env.VOYAGE_API_KEY,
      maxRetries: 3,
      timeout: 30000
    })
  }
  
  async embedBatch(
    chunks: Chunk[],
    model: string = 'voyage-3.5'
  ): Promise<EmbeddedChunk[]> {
    const texts = chunks.map(c => c.content)
    
    // Batch by token count
    const batches = this.createBatches(chunks, 100000) // 100k tokens per batch
    const results = []
    
    for (const batch of batches) {
      const response = await this.client.embed(
        batch.map(c => c.content),
        {
          model,
          inputType: 'document',
          truncation: true
        }
      )
      
      const embeddedBatch = batch.map((chunk, idx) => ({
        ...chunk,
        embedding: response.embeddings[idx],
        embeddingModel: model,
        embeddingDimension: response.embeddings[idx].length
      }))
      
      results.push(...embeddedBatch)
    }
    
    return results
  }
  
  private createBatches(chunks: Chunk[], maxTokens: number): Chunk[][] {
    const batches: Chunk[][] = []
    let currentBatch: Chunk[] = []
    let currentTokens = 0
    
    for (const chunk of chunks) {
      if (currentTokens + chunk.tokens > maxTokens && currentBatch.length > 0) {
        batches.push(currentBatch)
        currentBatch = []
        currentTokens = 0
      }
      
      currentBatch.push(chunk)
      currentTokens += chunk.tokens
    }
    
    if (currentBatch.length > 0) {
      batches.push(currentBatch)
    }
    
    return batches
  }
}
```

## Phase 6: Frontend Integration

### 6.1 Update Document Upload Component

```typescript
// src/components/rag/document-upload.tsx
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"

export function DocumentUpload() {
  const uploadDocument = useAction(api.fileHandler.uploadAndStore)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const handleUpload = async (files: File[]) => {
    setUploading(true)
    
    for (const file of files) {
      try {
        // Convert to blob
        const buffer = await file.arrayBuffer()
        const blob = new Blob([buffer], { type: file.type })
        
        // Upload
        const result = await uploadDocument({
          file: blob,
          metadata: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          }
        })
        
        // Track processing
        trackProcessing(result.documentId)
        
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    setUploading(false)
  }
  
  const trackProcessing = (documentId: string) => {
    // Subscribe to processing updates
    const interval = setInterval(async () => {
      const status = await getDocumentStatus(documentId)
      
      if (status === 'completed') {
        toast.success('Document processed successfully')
        clearInterval(interval)
      } else if (status === 'error') {
        toast.error('Document processing failed')
        clearInterval(interval)
      }
    }, 2000)
  }
}
```

### 6.2 Processing Status Dashboard

```typescript
// src/components/rag/processing-status.tsx
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function ProcessingStatus() {
  const jobs = useQuery(api.jobs.getActive)
  
  return (
    <div className="space-y-4">
      {jobs?.map(job => (
        <div key={job._id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{job.document.title}</h3>
            <span className="text-sm text-gray-500">{job.stage}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {job.status === 'running' ? (
              <span>Processing... {job.progress}%</span>
            ) : (
              <span>Completed in {job.processingTime}ms</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Phase 7: Testing and Deployment

### 7.1 Unit Tests

```typescript
// tests/processors/pdfProcessor.test.ts
import { describe, it, expect } from 'vitest'
import { PDFProcessor } from '@/convex/lib/processors/pdfProcessor'

describe('PDFProcessor', () => {
  it('should extract text from simple PDF', async () => {
    const file = await loadTestFile('simple.pdf')
    const processor = new PDFProcessor()
    
    const result = await processor.process(file, {
      chunkSize: 1000,
      includeImages: false
    })
    
    expect(result.content).toContain('Expected text')
    expect(result.metadata.pageCount).toBe(1)
  })
  
  it('should process visual PDF with images', async () => {
    const file = await loadTestFile('visual.pdf')
    const processor = new PDFProcessor()
    
    const result = await processor.process(file, {
      chunkSize: 1000,
      includeImages: true
    })
    
    expect(result.images).toHaveLength(3)
    expect(result.metadata.processingType).toBe('visual')
  })
})
```

### 7.2 Integration Tests

```typescript
// tests/integration/pipeline.test.ts
import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'

describe('Document Processing Pipeline', () => {
  it('should process document end-to-end', async () => {
    const t = convexTest()
    
    // Upload file
    const file = await loadTestFile('test.pdf')
    const { documentId } = await t.action(api.fileHandler.uploadAndStore, {
      file,
      metadata: {
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: file.size
      }
    })
    
    // Wait for processing
    await t.waitUntil(
      async () => {
        const doc = await t.query(api.documents.get, { id: documentId })
        return doc?.status === 'completed'
      },
      { timeout: 60000 }
    )
    
    // Verify chunks created
    const chunks = await t.query(api.chunks.getByDocument, { documentId })
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks[0].embedding).toBeDefined()
  })
})
```

### 7.3 Deployment Script

```bash
#!/bin/bash
# deploy-pipeline.sh

echo "Deploying Document Processing Pipeline..."

# Install dependencies
npm install

# Run tests
npm test

# Deploy to Convex
npx convex deploy

# Update environment variables
echo "Remember to set VOYAGE_API_KEY in Convex dashboard"

echo "Deployment complete!"
```

## Next Steps

Continue to [Performance Optimization](./08-performance-optimization.md) for scaling strategies.