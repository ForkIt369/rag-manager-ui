# API Documentation

## Voyage AI Integration

### Authentication

```typescript
// Environment variable
VOYAGE_API_KEY=pa-R02PH3qx5COlTDPTuKCoh2aQCsBsacXBrECRJGWZI_P

// Client initialization
import voyageai from 'voyageai'

const voyageClient = new voyageai.Client({
  apiKey: process.env.VOYAGE_API_KEY,
  maxRetries: 3,
  timeout: 30000
})
```

### Available Models

#### Text Embeddings

```typescript
interface VoyageTextModels {
  "voyage-3.5": {
    contextLength: 32000,
    embeddingDimension: 1024, // default, supports 256, 512, 2048
    description: "Optimized for general-purpose and multilingual retrieval",
    rateLimit: {
      tpm: 8000000, // tokens per minute
      rpm: 2000     // requests per minute
    }
  },
  "voyage-3-large": {
    contextLength: 32000,
    embeddingDimension: 1024,
    description: "Best general-purpose and multilingual retrieval quality",
    rateLimit: {
      tpm: 3000000,
      rpm: 2000
    }
  },
  "voyage-code-3": {
    contextLength: 32000,
    embeddingDimension: 1024,
    description: "Optimized for code retrieval",
    rateLimit: {
      tpm: 3000000,
      rpm: 2000
    }
  }
}
```

#### Multimodal Embeddings

```typescript
interface VoyageMultimodalModels {
  "voyage-multimodal-3": {
    contextLength: 32000,
    embeddingDimension: 1024,
    description: "Rich multimodal embedding for text and images",
    imageConstraints: {
      maxPixels: 16000000,  // 16 million pixels
      maxSize: 20 * 1024 * 1024, // 20MB
      pixelsPerToken: 560
    },
    rateLimit: {
      tpm: 2000000,
      rpm: 2000
    }
  }
}
```

### Embedding API

#### Text Embedding

```typescript
// Single text embedding
const result = await voyageClient.embed(
  ["Your text here"],
  {
    model: "voyage-3.5",
    inputType: "document", // or "query"
    truncation: true,
    outputDimension: 1024,
    outputDtype: "float"
  }
)

// Batch embedding (up to 128 texts)
const batchResult = await voyageClient.embed(
  texts, // array of strings
  {
    model: "voyage-3.5",
    inputType: "document"
  }
)

// Response structure
interface EmbeddingResponse {
  embeddings: number[][]  // Array of embedding vectors
  usage: {
    totalTokens: number
  }
}
```

#### Multimodal Embedding

```typescript
// For PDFs converted to images
import { Image } from 'PIL'

const multimodalResult = await voyageClient.multimodalEmbed(
  [
    ["Page 1 text", Image.open('page1.png')],
    ["Page 2 text", Image.open('page2.png')]
  ],
  {
    model: "voyage-multimodal-3",
    inputType: "document",
    truncation: true
  }
)

// Response structure
interface MultimodalEmbeddingResponse {
  embeddings: number[][]
  textTokens: number
  imagePixels: number
  totalTokens: number
}
```

### Utility APIs

#### Token Counting

```typescript
// Count tokens before embedding
const tokenCount = await voyageClient.countTokens(
  texts,
  { model: "voyage-3.5" }
)

// Count multimodal usage
const usage = await voyageClient.countUsage(
  multimodalInputs,
  { model: "voyage-multimodal-3" }
)
```

#### Tokenization

```typescript
// Tokenize text for analysis
const tokenized = await voyageClient.tokenize(
  texts,
  { model: "voyage-3.5" }
)

// Access tokens
tokenized.forEach(encoding => {
  console.log(encoding.tokens) // ['The', 'Ġquick', 'Ġbrown', ...]
})
```

### Rate Limiting Strategy

```typescript
// Exponential backoff implementation
import { retry } from 'tenacity'

const embedWithRetry = retry(
  async (texts: string[]) => {
    return await voyageClient.embed(texts, {
      model: "voyage-3.5",
      inputType: "document"
    })
  },
  {
    wait: exponentialBackoff({ multiplier: 1, max: 60 }),
    stop: stopAfterAttempt(6),
    retry: retryIf(error => error.status === 429)
  }
)

// Batch processing with rate limiting
class RateLimitedEmbedder {
  private queue = new PQueue({ 
    concurrency: 5,
    interval: 60000, // 1 minute
    intervalCap: 100 // 100 requests per minute
  })

  async embedBatch(texts: string[]) {
    const batches = chunk(texts, 128) // Max batch size
    
    return Promise.all(
      batches.map(batch => 
        this.queue.add(() => embedWithRetry(batch))
      )
    )
  }
}
```

### Error Handling

```typescript
interface VoyageAPIError {
  status: number
  message: string
  type: 'rate_limit' | 'invalid_request' | 'server_error'
}

// Error handler
async function handleVoyageError(error: VoyageAPIError) {
  switch (error.status) {
    case 429: // Rate limit
      const retryAfter = error.headers?.['retry-after'] || 60
      await sleep(retryAfter * 1000)
      break
    case 400: // Invalid request
      logger.error('Invalid request:', error.message)
      throw error
    case 500: // Server error
      logger.error('Voyage AI server error:', error.message)
      throw error
  }
}
```

## Convex API Integration

### Document Processing Actions

```typescript
// convex/actions/documentProcessor.ts
import { action } from "../_generated/server"
import { v } from "convex/values"

export const processDocument = action({
  args: { 
    documentId: v.id("documents"),
    options: v.optional(v.object({
      chunkSize: v.optional(v.number()),
      chunkOverlap: v.optional(v.number()),
      embeddingModel: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    // Processing implementation
  }
})
```

### Storage Operations

```typescript
// File upload
export const uploadFile = action({
  args: { 
    blob: v.bytes(),
    metadata: v.object({
      fileName: v.string(),
      mimeType: v.string(),
      size: v.number()
    })
  },
  handler: async (ctx, args) => {
    const storageId = await ctx.storage.store(args.blob)
    return { storageId }
  }
})

// File retrieval
export const getFile = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const blob = await ctx.storage.get(args.storageId)
    return blob
  }
})
```

### Database Operations

```typescript
// Document mutations
export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error")
    ),
    error: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      status: args.status,
      error: args.error,
      updatedAt: Date.now()
    })
  }
})

// Chunk creation
export const createChunks = mutation({
  args: {
    chunks: v.array(v.object({
      documentId: v.id("documents"),
      content: v.string(),
      embedding: v.array(v.float64()),
      chunkIndex: v.number(),
      metadata: v.any()
    }))
  },
  handler: async (ctx, args) => {
    const chunkIds = await Promise.all(
      args.chunks.map(chunk => 
        ctx.db.insert("chunks", {
          ...chunk,
          createdAt: Date.now()
        })
      )
    )
    return { chunkIds }
  }
})
```

### Real-time Updates

```typescript
// Subscribe to document status
export const watchDocumentStatus = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    return document?.status
  }
})

// Processing progress
export const getProcessingProgress = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_document", q => 
        q.eq("documentId", args.documentId)
      )
      .collect()
    
    return {
      totalChunks: chunks.length,
      processedChunks: chunks.filter(c => c.embedding).length
    }
  }
})
```

## Integration Patterns

### Processing Pipeline

```typescript
// Complete processing flow
export const processDocumentPipeline = action({
  args: { fileId: v.id("_storage"), metadata: v.any() },
  handler: async (ctx, args) => {
    // 1. Create document record
    const documentId = await ctx.runMutation(internal.documents.create, {
      fileId: args.fileId,
      metadata: args.metadata,
      status: "processing"
    })

    try {
      // 2. Extract content
      const content = await extractContent(ctx, args.fileId)
      
      // 3. Chunk content
      const chunks = await chunkContent(content)
      
      // 4. Generate embeddings
      const embeddings = await generateEmbeddings(chunks)
      
      // 5. Store chunks
      await ctx.runMutation(internal.chunks.createBatch, {
        documentId,
        chunks: chunks.map((chunk, i) => ({
          content: chunk.text,
          embedding: embeddings[i],
          chunkIndex: i,
          metadata: chunk.metadata
        }))
      })
      
      // 6. Update status
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId,
        status: "completed"
      })
      
    } catch (error) {
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId,
        status: "error",
        error: error.message
      })
      throw error
    }
  }
})
```

### Error Recovery

```typescript
// Retry failed documents
export const retryFailedDocuments = action({
  handler: async (ctx) => {
    const failed = await ctx.runQuery(internal.documents.getFailed)
    
    for (const doc of failed) {
      await ctx.scheduler.runAfter(0, internal.process.retry, {
        documentId: doc._id
      })
    }
  }
})
```

## Best Practices

### 1. Batch Operations

```typescript
// Efficient batch embedding
async function batchEmbed(texts: string[], model: string) {
  const batches = []
  for (let i = 0; i < texts.length; i += 128) {
    batches.push(texts.slice(i, i + 128))
  }
  
  const results = await Promise.all(
    batches.map(batch => 
      voyageClient.embed(batch, { model, inputType: "document" })
    )
  )
  
  return results.flatMap(r => r.embeddings)
}
```

### 2. Token Management

```typescript
// Pre-flight token check
async function validateTokens(texts: string[]) {
  const count = await voyageClient.countTokens(texts, {
    model: "voyage-3.5"
  })
  
  if (count > 320000) { // voyage-3.5 limit
    throw new Error("Token limit exceeded")
  }
  
  return count
}
```

### 3. Monitoring

```typescript
// API usage tracking
class APIMonitor {
  private metrics = {
    requests: 0,
    tokens: 0,
    errors: 0
  }
  
  async trackEmbedding(result: EmbeddingResponse) {
    this.metrics.requests++
    this.metrics.tokens += result.usage.totalTokens
  }
  
  async trackError(error: Error) {
    this.metrics.errors++
    logger.error('Voyage API error:', error)
  }
}
```

## Next Steps

Continue to [File Format Processors](./04-file-format-processors.md) for format-specific implementation details.