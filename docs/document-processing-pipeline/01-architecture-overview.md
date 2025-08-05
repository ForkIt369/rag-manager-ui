# Architecture Overview

## System Design Principles

The document processing pipeline is built on several core principles:

1. **Format-Specific Optimization**: Each file format has unique characteristics requiring specialized handling
2. **Multimodal Processing**: Leverage visual understanding for better content extraction
3. **Semantic Preservation**: Maintain context and meaning during chunking
4. **Scalable Architecture**: Handle high volumes with parallel processing
5. **Fault Tolerance**: Graceful degradation and recovery mechanisms

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT PROCESSING PIPELINE                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   FRONTEND   │    │   CONVEX     │    │  VOYAGE AI   │         │
│  │              │    │   BACKEND    │    │              │         │
│  │ • Upload UI  │───▶│ • Storage    │───▶│ • Embeddings │         │
│  │ • Progress   │    │ • Actions    │    │ • Multimodal │         │
│  │ • Status     │◀───│ • Database   │◀───│ • Reranking  │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Document Ingestion Layer

```typescript
interface DocumentIngestion {
  // File upload and validation
  upload: (file: File) => Promise<StorageId>
  validate: (file: File) => ValidationResult
  
  // Format detection
  detectFormat: (file: File) => DocumentFormat
  routeProcessor: (format: DocumentFormat) => Processor
}
```

### 2. Processing Pipeline

```typescript
interface ProcessingPipeline {
  // Main processing flow
  process: (documentId: Id) => Promise<ProcessingResult>
  
  // Sub-processes
  extract: (file: StorageFile) => ExtractedContent
  chunk: (content: ExtractedContent) => Chunk[]
  embed: (chunks: Chunk[]) => EmbeddedChunk[]
  store: (embedded: EmbeddedChunk[]) => Promise<void>
}
```

### 3. Format Processors

```typescript
interface FormatProcessor {
  // Common interface for all processors
  canProcess: (mimeType: string) => boolean
  extract: (file: StorageFile) => Promise<ExtractedContent>
  
  // Format-specific implementations
  PDFProcessor: VisualProcessor
  EPUBProcessor: StructuredTextProcessor
  DocxProcessor: RichTextProcessor
  SpreadsheetProcessor: TabularDataProcessor
  ImageProcessor: MultimodalProcessor
  TextProcessor: PlainTextProcessor
}
```

## Data Flow Architecture

### 1. Upload Flow

```
User Upload → Validation → Storage → Queue → Processing
     │                                           │
     └─────────── Status Updates ───────────────┘
```

### 2. Processing Flow

```
Document → Format Detection → Content Extraction → Chunking
    │                                                  │
    └──────────────── Metadata ───────────────────────┤
                                                       ▼
                                                  Embedding
                                                       │
                                                       ▼
                                                Vector Storage
```

### 3. Query Flow

```
User Query → Embedding → Vector Search → Reranking → Results
                 │                           │
                 └──────── Voyage AI ────────┘
```

## Processing Strategies

### Visual Processing (PDFs, Images)

```
PDF Document → Page Rendering (300 DPI) → Image Array
                                              │
                                              ▼
                                    Voyage Multimodal-3
                                              │
                                              ▼
                                    Visual Embeddings
```

### Text Processing (DOCX, TXT, MD)

```
Text Document → Content Extraction → Semantic Chunking
                                           │
                                           ▼
                                    Voyage 3.5
                                           │
                                           ▼
                                    Text Embeddings
```

### Structured Data (XLSX, CSV, JSON)

```
Structured File → Schema Detection → Table/JSON Processing
                                              │
                                              ▼
                                    Markdown Conversion
                                              │
                                              ▼
                                    Contextual Chunks
```

## Convex Integration Architecture

### 1. Storage Layer

```typescript
// Convex file storage
interface StorageArchitecture {
  files: {
    upload: (blob: Blob) => Promise<StorageId>
    get: (id: StorageId) => Promise<Blob>
    delete: (id: StorageId) => Promise<void>
  }
}
```

### 2. Action Layer

```typescript
// Convex actions for processing
interface ActionArchitecture {
  "documents:process": {
    input: { documentId: Id<"documents"> }
    output: { status: "success" | "error", chunks?: number }
  }
  
  "embeddings:generate": {
    input: { texts: string[], model: string }
    output: { embeddings: number[][] }
  }
}
```

### 3. Database Schema

```typescript
// Optimized schema design
interface DatabaseSchema {
  documents: {
    _id: Id<"documents">
    title: string
    fileId: Id<"_storage">
    status: "pending" | "processing" | "completed" | "error"
    metadata: DocumentMetadata
    createdAt: number
    processedAt?: number
  }
  
  chunks: {
    _id: Id<"chunks">
    documentId: Id<"documents">
    content: string
    embedding: number[]
    chunkIndex: number
    metadata: ChunkMetadata
  }
}
```

## Scalability Considerations

### 1. Parallel Processing

- Process multiple documents concurrently
- Batch embedding operations (128 items max)
- Async file operations with streaming

### 2. Resource Management

- Memory-efficient file streaming
- Temporary file cleanup
- Connection pooling for API calls

### 3. Performance Optimization

- Caching parsed content
- Incremental processing
- Efficient vector indexing

## Security Architecture

### 1. API Security

```typescript
// Secure API key management
interface SecurityLayer {
  voyageKey: EnvironmentVariable
  encryption: AES256
  rateLimit: TokenBucket
}
```

### 2. File Security

- Virus scanning on upload
- File type validation
- Secure temporary storage
- Automatic cleanup

### 3. Data Privacy

- No permanent file storage
- Encrypted embeddings
- User data isolation
- GDPR compliance

## Monitoring & Observability

### 1. Processing Metrics

- Document processing time
- Chunk generation rate
- Embedding API latency
- Error rates by format

### 2. System Health

- Queue depth monitoring
- API rate limit tracking
- Storage usage metrics
- Performance benchmarks

### 3. User Analytics

- Upload patterns
- Format distribution
- Query performance
- Usage trends

## Error Handling Strategy

### 1. Graceful Degradation

```typescript
// Fallback strategies
interface ErrorRecovery {
  pdfFallback: TextExtraction
  embeddingRetry: ExponentialBackoff
  chunkRecovery: PartialProcessing
}
```

### 2. Error Types

- Format errors → Alternative processors
- API errors → Retry with backoff
- Storage errors → Cleanup and retry
- Processing errors → Partial success

## Next Steps

Continue to [Technical Requirements](./02-technical-requirements.md) for detailed setup instructions.