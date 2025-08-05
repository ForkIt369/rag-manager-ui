# Embedding Pipeline

## Overview

The embedding pipeline efficiently generates vector representations for chunks using Voyage AI's state-of-the-art models, with intelligent batching, rate limiting, and error handling.

## Pipeline Architecture

```typescript
interface EmbeddingPipeline {
  // Main embedding flow
  generateEmbeddings(chunks: Chunk[]): Promise<EmbeddedChunk[]>
  
  // Sub-processes
  selectModel(chunk: Chunk): VoyageModel
  batchChunks(chunks: Chunk[]): Chunk[][]
  handleRateLimit(error: RateLimitError): Promise<void>
  validateEmbeddings(embeddings: number[][]): boolean
}
```

## Model Selection Strategy

### Dynamic Model Selection

```typescript
export class ModelSelector {
  selectModel(chunk: Chunk): VoyageModel {
    // Multimodal content
    if (chunk.metadata.isMultimodal || chunk.metadata.hasImage) {
      return {
        name: 'voyage-multimodal-3',
        contextLength: 32000,
        dimension: 1024
      }
    }
    
    // Code content
    if (chunk.metadata.hasCodeBlock || chunk.metadata.language) {
      return {
        name: 'voyage-code-3',
        contextLength: 32000,
        dimension: 1024
      }
    }
    
    // General text content
    return {
      name: 'voyage-3.5',
      contextLength: 32000,
      dimension: 1024
    }
  }

  selectInputType(purpose: 'indexing' | 'querying'): 'document' | 'query' {
    return purpose === 'indexing' ? 'document' : 'query'
  }
}
```

## Batch Processing Implementation

### Intelligent Batching

```typescript
import { chunk as lodashChunk } from 'lodash'
import PQueue from 'p-queue'

export class BatchProcessor {
  private queue: PQueue
  private modelLimits = {
    'voyage-3.5': {
      batchSize: 128,
      tokensPerMinute: 8000000,
      requestsPerMinute: 2000
    },
    'voyage-multimodal-3': {
      batchSize: 8,  // Limited by image processing
      tokensPerMinute: 2000000,
      requestsPerMinute: 2000
    },
    'voyage-code-3': {
      batchSize: 128,
      tokensPerMinute: 3000000,
      requestsPerMinute: 2000
    }
  }

  constructor() {
    this.queue = new PQueue({
      concurrency: 5,
      interval: 60000, // 1 minute
      intervalCap: 100 // Max 100 operations per minute
    })
  }

  async batchEmbed(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
    // Group chunks by model
    const modelGroups = this.groupByModel(chunks)
    const allEmbeddings: EmbeddedChunk[] = []

    for (const [model, modelChunks] of Object.entries(modelGroups)) {
      const batches = this.createBatches(modelChunks, model)
      
      // Process batches with rate limiting
      const batchResults = await Promise.all(
        batches.map(batch => 
          this.queue.add(() => this.processBatch(batch, model))
        )
      )
      
      allEmbeddings.push(...batchResults.flat())
    }

    return allEmbeddings
  }

  private groupByModel(chunks: Chunk[]): Record<string, Chunk[]> {
    const groups: Record<string, Chunk[]> = {}
    const selector = new ModelSelector()

    for (const chunk of chunks) {
      const model = selector.selectModel(chunk).name
      if (!groups[model]) {
        groups[model] = []
      }
      groups[model].push(chunk)
    }

    return groups
  }

  private createBatches(chunks: Chunk[], model: string): Chunk[][] {
    const limits = this.modelLimits[model]
    const batches: Chunk[][] = []
    let currentBatch: Chunk[] = []
    let currentTokens = 0

    for (const chunk of chunks) {
      const chunkTokens = chunk.tokens

      // Check if adding this chunk exceeds limits
      if (currentBatch.length >= limits.batchSize ||
          currentTokens + chunkTokens > 100000) { // Conservative token limit per batch
        if (currentBatch.length > 0) {
          batches.push(currentBatch)
          currentBatch = []
          currentTokens = 0
        }
      }

      currentBatch.push(chunk)
      currentTokens += chunkTokens
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch)
    }

    return batches
  }

  private async processBatch(
    batch: Chunk[],
    model: string
  ): Promise<EmbeddedChunk[]> {
    try {
      const texts = batch.map(chunk => chunk.content)
      
      // Handle multimodal content
      if (model === 'voyage-multimodal-3') {
        return this.processMultimodalBatch(batch)
      }

      // Regular text embedding
      const result = await voyageClient.embed(texts, {
        model,
        inputType: 'document',
        truncation: true
      })

      return batch.map((chunk, index) => ({
        ...chunk,
        embedding: result.embeddings[index],
        embeddingModel: model,
        embeddingDimension: result.embeddings[index].length
      }))

    } catch (error) {
      if (error.status === 429) {
        // Rate limit hit, retry with exponential backoff
        await this.handleRateLimit(error)
        return this.processBatch(batch, model)
      }
      throw error
    }
  }

  private async processMultimodalBatch(
    batch: Chunk[]
  ): Promise<EmbeddedChunk[]> {
    const multimodalInputs = batch.map(chunk => {
      if (chunk.metadata.imagePath) {
        // Load image for multimodal embedding
        const image = PIL.Image.open(chunk.metadata.imagePath)
        return [chunk.content, image]
      }
      return [chunk.content]
    })

    const result = await voyageClient.multimodalEmbed(multimodalInputs, {
      model: 'voyage-multimodal-3',
      inputType: 'document'
    })

    return batch.map((chunk, index) => ({
      ...chunk,
      embedding: result.embeddings[index],
      embeddingModel: 'voyage-multimodal-3',
      embeddingDimension: 1024,
      multimodalMetadata: {
        textTokens: result.textTokens,
        imagePixels: result.imagePixels,
        totalTokens: result.totalTokens
      }
    }))
  }
}
```

## Rate Limiting and Retry Logic

### Exponential Backoff Implementation

```typescript
import { retry } from '@lifeomic/attempt'

export class RateLimitHandler {
  private retryOptions = {
    maxAttempts: 6,
    delay: 1000,
    factor: 2,
    maxDelay: 60000,
    handleError: (error: any, context: any) => {
      // Only retry on rate limit errors
      if (error.status !== 429) {
        context.abort()
      }
    }
  }

  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    return retry(operation, this.retryOptions)
  }

  async handleRateLimit(error: RateLimitError): Promise<void> {
    const retryAfter = error.headers?.['retry-after']
    const delayMs = retryAfter 
      ? parseInt(retryAfter) * 1000 
      : this.calculateBackoff(error.attempt || 0)

    logger.warn(`Rate limit hit, waiting ${delayMs}ms before retry`)
    await this.sleep(delayMs)
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = Math.min(1000 * Math.pow(2, attempt), 60000)
    const jitter = Math.random() * 0.3 * baseDelay
    return Math.floor(baseDelay + jitter)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

## Embedding Validation

### Quality Assurance

```typescript
export class EmbeddingValidator {
  validate(embeddings: number[][], expectedDimension: number = 1024): boolean {
    for (const embedding of embeddings) {
      if (!this.validateSingle(embedding, expectedDimension)) {
        return false
      }
    }
    return true
  }

  private validateSingle(embedding: number[], expectedDimension: number): boolean {
    // Check dimension
    if (embedding.length !== expectedDimension) {
      logger.error(`Invalid embedding dimension: ${embedding.length}, expected ${expectedDimension}`)
      return false
    }

    // Check for NaN or Infinity
    if (embedding.some(val => !isFinite(val))) {
      logger.error('Embedding contains invalid values (NaN or Infinity)')
      return false
    }

    // Check normalization (Voyage embeddings are normalized)
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    )
    if (Math.abs(magnitude - 1.0) > 0.01) {
      logger.warn(`Embedding not properly normalized: magnitude=${magnitude}`)
    }

    return true
  }

  validateBatch(batch: EmbeddedChunk[]): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: string[] = []

    for (const chunk of batch) {
      if (!chunk.embedding) {
        errors.push({
          chunkId: chunk.id,
          error: 'Missing embedding'
        })
        continue
      }

      if (!this.validateSingle(chunk.embedding, chunk.embeddingDimension)) {
        errors.push({
          chunkId: chunk.id,
          error: 'Invalid embedding format'
        })
      }

      // Check for duplicate embeddings (exact match)
      const duplicate = batch.find(
        other => other.id !== chunk.id && 
        this.embeddingsEqual(chunk.embedding, other.embedding)
      )
      if (duplicate) {
        warnings.push(`Duplicate embedding found: chunks ${chunk.id} and ${duplicate.id}`)
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  private embeddingsEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false
    return a.every((val, i) => Math.abs(val - b[i]) < 1e-6)
  }
}
```

## Embedding Storage

### Efficient Storage Strategy

```typescript
export class EmbeddingStorage {
  async storeEmbeddings(chunks: EmbeddedChunk[]): Promise<void> {
    // Batch insert for efficiency
    const batchSize = 100
    const batches = lodashChunk(chunks, batchSize)

    for (const batch of batches) {
      await this.storeBatch(batch)
    }
  }

  private async storeBatch(chunks: EmbeddedChunk[]): Promise<void> {
    const chunkRecords = chunks.map(chunk => ({
      documentId: chunk.documentId,
      content: chunk.content,
      embedding: chunk.embedding,
      embeddingModel: chunk.embeddingModel,
      embeddingDimension: chunk.embeddingDimension,
      chunkIndex: chunk.metadata.chunkIndex,
      metadata: {
        ...chunk.metadata,
        tokens: chunk.tokens,
        multimodal: chunk.multimodalMetadata
      },
      createdAt: Date.now()
    }))

    await ctx.runMutation(internal.chunks.createBatch, {
      chunks: chunkRecords
    })
  }
}
```

## Embedding Pipeline Orchestration

### Complete Pipeline

```typescript
export class EmbeddingPipeline {
  private batchProcessor = new BatchProcessor()
  private rateLimitHandler = new RateLimitHandler()
  private validator = new EmbeddingValidator()
  private storage = new EmbeddingStorage()

  async processDocument(
    documentId: string,
    chunks: Chunk[]
  ): Promise<ProcessingResult> {
    const startTime = Date.now()
    let processedChunks = 0
    const errors: Error[] = []

    try {
      // Pre-validation
      const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0)
      logger.info(`Processing ${chunks.length} chunks with ${totalTokens} total tokens`)

      // Generate embeddings with retry logic
      const embeddedChunks = await this.rateLimitHandler.withRetry(
        () => this.batchProcessor.batchEmbed(chunks)
      )

      // Validate embeddings
      const validation = this.validator.validateBatch(embeddedChunks)
      if (!validation.valid) {
        throw new Error(`Embedding validation failed: ${JSON.stringify(validation.errors)}`)
      }

      // Store embeddings
      await this.storage.storeEmbeddings(embeddedChunks)
      processedChunks = embeddedChunks.length

      // Update document status
      await this.updateDocumentStatus(documentId, 'completed', {
        chunks: processedChunks,
        processingTime: Date.now() - startTime
      })

      return {
        success: true,
        chunks: processedChunks,
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      logger.error('Embedding pipeline error:', error)
      errors.push(error)

      await this.updateDocumentStatus(documentId, 'error', {
        error: error.message,
        processedChunks,
        processingTime: Date.now() - startTime
      })

      return {
        success: false,
        chunks: processedChunks,
        processingTime: Date.now() - startTime,
        errors
      }
    }
  }

  private async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
    metadata: any
  ): Promise<void> {
    await ctx.runMutation(internal.documents.updateStatus, {
      documentId,
      status,
      metadata,
      updatedAt: Date.now()
    })
  }
}
```

## Monitoring and Analytics

### Performance Tracking

```typescript
export class EmbeddingMetrics {
  private metrics = {
    embeddingsGenerated: new Counter({
      name: 'embeddings_generated_total',
      help: 'Total embeddings generated',
      labelNames: ['model', 'status']
    }),
    embeddingDuration: new Histogram({
      name: 'embedding_duration_seconds',
      help: 'Embedding generation duration',
      labelNames: ['model'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
    }),
    tokenUsage: new Counter({
      name: 'voyage_tokens_used_total',
      help: 'Total tokens used for embeddings',
      labelNames: ['model']
    }),
    rateLimitHits: new Counter({
      name: 'rate_limit_hits_total',
      help: 'Rate limit hits',
      labelNames: ['model']
    })
  }

  trackEmbedding(model: string, duration: number, tokens: number): void {
    this.metrics.embeddingsGenerated.inc({ model, status: 'success' })
    this.metrics.embeddingDuration.observe({ model }, duration / 1000)
    this.metrics.tokenUsage.inc({ model }, tokens)
  }

  trackRateLimit(model: string): void {
    this.metrics.rateLimitHits.inc({ model })
  }
}
```

## Best Practices

### 1. Token Management

```typescript
// Pre-calculate tokens to avoid exceeding limits
async function preflightCheck(chunks: Chunk[]): Promise<boolean> {
  const tokenCounts = await voyageClient.countTokens(
    chunks.map(c => c.content),
    { model: 'voyage-3.5' }
  )
  
  const limits = {
    'voyage-3.5': 320000,
    'voyage-multimodal-3': 320000,
    'voyage-code-3': 120000
  }
  
  // Group by model and check limits
  const modelGroups = groupByModel(chunks)
  for (const [model, modelChunks] of Object.entries(modelGroups)) {
    const modelTokens = modelChunks.reduce((sum, c) => sum + c.tokens, 0)
    if (modelTokens > limits[model]) {
      logger.error(`Token limit exceeded for ${model}: ${modelTokens} > ${limits[model]}`)
      return false
    }
  }
  
  return true
}
```

### 2. Cost Optimization

```typescript
// Use appropriate output dimensions
const dimensionConfig = {
  highPrecision: 1024,  // Default, best quality
  balanced: 512,        // Good quality, lower cost
  efficient: 256        // Acceptable quality, lowest cost
}

// Select dimension based on use case
function selectDimension(documentType: string): number {
  if (documentType === 'technical' || documentType === 'legal') {
    return dimensionConfig.highPrecision
  } else if (documentType === 'general') {
    return dimensionConfig.balanced
  } else {
    return dimensionConfig.efficient
  }
}
```

## Next Steps

Continue to [Implementation Guide](./07-implementation-guide.md) for step-by-step implementation instructions.