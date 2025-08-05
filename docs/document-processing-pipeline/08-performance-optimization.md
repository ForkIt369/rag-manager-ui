# Performance Optimization

## Overview

This guide covers strategies to optimize the document processing pipeline for scalability, speed, and cost-effectiveness.

## Performance Metrics

### Key Performance Indicators

```typescript
interface PerformanceMetrics {
  // Processing speed
  documentsPerMinute: number
  chunksPerSecond: number
  embeddingsPerSecond: number
  
  // Resource utilization
  cpuUsage: number
  memoryUsage: number
  storageIOPS: number
  
  // Cost efficiency
  costPerDocument: number
  costPerMillionTokens: number
  
  // Quality metrics
  chunkQuality: number
  embeddingAccuracy: number
}
```

## Optimization Strategies

### 1. Parallel Processing

#### Document-Level Parallelization

```typescript
import { Worker } from 'worker_threads'
import pLimit from 'p-limit'

export class ParallelProcessor {
  private workers: Worker[] = []
  private limit = pLimit(10) // Max 10 concurrent documents
  
  async processDocuments(documents: Document[]): Promise<ProcessedDocument[]> {
    // Create worker pool
    const workerCount = Math.min(documents.length, os.cpus().length)
    
    for (let i = 0; i < workerCount; i++) {
      this.workers.push(new Worker('./worker.js'))
    }
    
    // Process documents in parallel
    const results = await Promise.all(
      documents.map(doc => 
        this.limit(() => this.processWithWorker(doc))
      )
    )
    
    // Cleanup workers
    this.workers.forEach(worker => worker.terminate())
    
    return results
  }
  
  private async processWithWorker(document: Document): Promise<ProcessedDocument> {
    const worker = this.getAvailableWorker()
    
    return new Promise((resolve, reject) => {
      worker.postMessage({ type: 'process', document })
      
      worker.once('message', (result) => {
        if (result.error) {
          reject(new Error(result.error))
        } else {
          resolve(result.data)
        }
      })
    })
  }
}
```

#### Chunk-Level Parallelization

```typescript
export class ParallelChunker {
  async chunkInParallel(content: string, options: ChunkOptions): Promise<Chunk[]> {
    // Split content into sections
    const sections = this.splitIntoSections(content)
    
    // Process sections in parallel
    const chunkGroups = await Promise.all(
      sections.map(section => 
        this.chunkSection(section, options)
      )
    )
    
    // Merge and optimize overlaps
    return this.mergeChunkGroups(chunkGroups, options.overlap)
  }
  
  private splitIntoSections(content: string): Section[] {
    // Split by major headings or page breaks
    const sectionBreaks = /\n#{1,2}\s+.+\n|\n\f/g
    const sections: Section[] = []
    let lastIndex = 0
    let match
    
    while ((match = sectionBreaks.exec(content)) !== null) {
      sections.push({
        content: content.substring(lastIndex, match.index),
        startIndex: lastIndex,
        endIndex: match.index
      })
      lastIndex = match.index
    }
    
    // Add final section
    if (lastIndex < content.length) {
      sections.push({
        content: content.substring(lastIndex),
        startIndex: lastIndex,
        endIndex: content.length
      })
    }
    
    return sections
  }
}
```

### 2. Caching Strategy

#### Multi-Level Cache

```typescript
import { LRUCache } from 'lru-cache'
import Redis from 'ioredis'

export class CacheManager {
  private memoryCache: LRUCache<string, any>
  private redisCache: Redis
  
  constructor() {
    // L1 Cache: Memory (fast, limited)
    this.memoryCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5 minutes
      sizeCalculation: (value) => JSON.stringify(value).length
    })
    
    // L2 Cache: Redis (slower, larger)
    this.redisCache = new Redis({
      host: process.env.REDIS_HOST,
      port: 6379,
      maxRetriesPerRequest: 3
    })
  }
  
  async get(key: string): Promise<any> {
    // Check L1
    const memResult = this.memoryCache.get(key)
    if (memResult) return memResult
    
    // Check L2
    const redisResult = await this.redisCache.get(key)
    if (redisResult) {
      const value = JSON.parse(redisResult)
      this.memoryCache.set(key, value) // Promote to L1
      return value
    }
    
    return null
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    // Set in both caches
    this.memoryCache.set(key, value)
    await this.redisCache.setex(key, ttl, JSON.stringify(value))
  }
  
  // Cache embeddings
  async cacheEmbedding(text: string, embedding: number[], model: string): Promise<void> {
    const key = `embed:${model}:${this.hashText(text)}`
    await this.set(key, embedding, 86400) // 24 hours
  }
  
  private hashText(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex')
  }
}
```

#### Document Processing Cache

```typescript
export class ProcessingCache {
  private cache = new CacheManager()
  
  async getCachedChunks(documentHash: string): Promise<Chunk[] | null> {
    return this.cache.get(`chunks:${documentHash}`)
  }
  
  async cacheChunks(documentHash: string, chunks: Chunk[]): Promise<void> {
    await this.cache.set(`chunks:${documentHash}`, chunks, 604800) // 7 days
  }
  
  async getCachedEmbeddings(chunkHashes: string[]): Promise<Map<string, number[]>> {
    const cached = new Map<string, number[]>()
    
    await Promise.all(
      chunkHashes.map(async (hash) => {
        const embedding = await this.cache.get(`embedding:${hash}`)
        if (embedding) {
          cached.set(hash, embedding)
        }
      })
    )
    
    return cached
  }
}
```

### 3. Batch Optimization

#### Dynamic Batching

```typescript
export class DynamicBatcher {
  private pendingItems: Map<string, PendingItem[]> = new Map()
  private batchTimeout = 100 // ms
  private maxBatchSize = 128
  
  async addToBatch(
    model: string,
    text: string,
    callback: (result: number[]) => void
  ): Promise<void> {
    if (!this.pendingItems.has(model)) {
      this.pendingItems.set(model, [])
      
      // Schedule batch processing
      setTimeout(() => this.processBatch(model), this.batchTimeout)
    }
    
    const items = this.pendingItems.get(model)!
    items.push({ text, callback })
    
    // Process immediately if batch is full
    if (items.length >= this.maxBatchSize) {
      this.processBatch(model)
    }
  }
  
  private async processBatch(model: string): Promise<void> {
    const items = this.pendingItems.get(model) || []
    if (items.length === 0) return
    
    this.pendingItems.delete(model)
    
    try {
      // Batch embedding request
      const texts = items.map(item => item.text)
      const result = await voyageClient.embed(texts, { model })
      
      // Distribute results
      items.forEach((item, index) => {
        item.callback(result.embeddings[index])
      })
    } catch (error) {
      // Handle errors
      items.forEach(item => {
        item.callback(null)
      })
    }
  }
}
```

#### Optimal Batch Sizing

```typescript
export class BatchOptimizer {
  private performanceHistory: BatchPerformance[] = []
  
  calculateOptimalBatchSize(model: string): number {
    const modelConfig = {
      'voyage-3.5': {
        maxBatch: 128,
        maxTokens: 320000,
        optimalUtilization: 0.8
      },
      'voyage-multimodal-3': {
        maxBatch: 8,
        maxTokens: 320000,
        optimalUtilization: 0.7
      }
    }
    
    const config = modelConfig[model]
    const avgTokensPerItem = this.getAverageTokensPerItem()
    
    // Calculate based on token limits
    const tokenBasedSize = Math.floor(
      (config.maxTokens * config.optimalUtilization) / avgTokensPerItem
    )
    
    // Return minimum of token-based and max batch size
    return Math.min(tokenBasedSize, config.maxBatch)
  }
  
  private getAverageTokensPerItem(): number {
    if (this.performanceHistory.length === 0) return 500 // Default estimate
    
    const totalTokens = this.performanceHistory.reduce(
      (sum, h) => sum + h.totalTokens, 0
    )
    const totalItems = this.performanceHistory.reduce(
      (sum, h) => sum + h.itemCount, 0
    )
    
    return Math.ceil(totalTokens / totalItems)
  }
}
```

### 4. Memory Management

#### Streaming Processing

```typescript
import { Transform } from 'stream'

export class StreamingProcessor extends Transform {
  private buffer = ''
  private chunkSize = 1000
  
  _transform(chunk: Buffer, encoding: string, callback: Function) {
    this.buffer += chunk.toString()
    
    // Process complete chunks
    while (this.buffer.length >= this.chunkSize) {
      const processChunk = this.buffer.substring(0, this.chunkSize)
      this.buffer = this.buffer.substring(this.chunkSize)
      
      this.processChunk(processChunk)
        .then(result => this.push(JSON.stringify(result) + '\n'))
        .catch(err => this.emit('error', err))
    }
    
    callback()
  }
  
  _flush(callback: Function) {
    if (this.buffer.length > 0) {
      this.processChunk(this.buffer)
        .then(result => {
          this.push(JSON.stringify(result) + '\n')
          callback()
        })
        .catch(callback)
    } else {
      callback()
    }
  }
  
  private async processChunk(text: string): Promise<ProcessedChunk> {
    // Process individual chunk
    return {
      content: text,
      tokens: this.countTokens(text),
      metadata: {}
    }
  }
}
```

#### Memory Pool

```typescript
export class MemoryPool {
  private pool: ArrayBuffer[] = []
  private inUse: Set<ArrayBuffer> = new Set()
  private bufferSize = 10 * 1024 * 1024 // 10MB
  
  acquire(): ArrayBuffer {
    let buffer = this.pool.pop()
    
    if (!buffer) {
      buffer = new ArrayBuffer(this.bufferSize)
    }
    
    this.inUse.add(buffer)
    return buffer
  }
  
  release(buffer: ArrayBuffer): void {
    if (this.inUse.has(buffer)) {
      this.inUse.delete(buffer)
      
      // Clear buffer before returning to pool
      new Uint8Array(buffer).fill(0)
      
      if (this.pool.length < 10) { // Keep max 10 buffers
        this.pool.push(buffer)
      }
    }
  }
  
  get stats() {
    return {
      poolSize: this.pool.length,
      inUse: this.inUse.size,
      totalMemory: (this.pool.length + this.inUse.size) * this.bufferSize
    }
  }
}
```

### 5. Database Optimization

#### Bulk Operations

```typescript
export class BulkDatabaseOperations {
  async bulkInsertChunks(chunks: Chunk[]): Promise<void> {
    const batchSize = 1000
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      
      await ctx.runMutation(internal.chunks.bulkInsert, {
        chunks: batch.map(chunk => ({
          ...chunk,
          embedding: new Float32Array(chunk.embedding), // Compress
          createdAt: Date.now()
        }))
      })
    }
  }
  
  async optimizedVectorSearch(
    embedding: number[],
    options: SearchOptions
  ): Promise<SearchResult[]> {
    // Use approximate nearest neighbor search
    const results = await ctx.runQuery(internal.search.vectorANN, {
      embedding,
      k: options.limit * 2, // Over-fetch for filtering
      threshold: options.threshold || 0.7
    })
    
    // Post-filter and re-rank
    return this.rerank(results, embedding, options)
  }
}
```

#### Index Optimization

```typescript
// convex/schema.ts
export default defineSchema({
  chunks: defineTable({
    // ... existing fields
  })
    .index("by_document", ["documentId"])
    .index("by_created", ["createdAt"])
    .vectorIndex("vector_search", {
      vectorField: "embedding",
      dimensions: 1024,
      metric: "cosine",
      // ANN configuration
      indexConfig: {
        type: "hnsw",
        m: 16,
        efConstruction: 200,
        ef: 50
      }
    })
})
```

### 6. Cost Optimization

#### Smart Model Selection

```typescript
export class CostOptimizer {
  private modelCosts = {
    'voyage-3.5': 0.00002, // per 1k tokens
    'voyage-3-large': 0.00013,
    'voyage-code-3': 0.00002,
    'voyage-multimodal-3': 0.00012
  }
  
  selectCostEffectiveModel(
    content: string,
    requirements: ModelRequirements
  ): string {
    const candidates = this.getValidModels(requirements)
    
    // Calculate cost for each model
    const costs = candidates.map(model => ({
      model,
      cost: this.estimateCost(content, model),
      quality: this.getModelQuality(model)
    }))
    
    // Select based on cost/quality ratio
    return this.selectOptimal(costs, requirements.qualityThreshold)
  }
  
  private selectOptimal(
    costs: ModelCost[],
    qualityThreshold: number
  ): string {
    // Filter by quality threshold
    const valid = costs.filter(c => c.quality >= qualityThreshold)
    
    // Sort by cost
    valid.sort((a, b) => a.cost - b.cost)
    
    return valid[0].model
  }
}
```

#### Token Optimization

```typescript
export class TokenOptimizer {
  optimizeForEmbedding(text: string, maxTokens: number): string {
    // Remove redundant whitespace
    text = text.replace(/\s+/g, ' ').trim()
    
    // Smart truncation
    if (this.countTokens(text) > maxTokens) {
      // Preserve important sections
      const sections = this.extractImportantSections(text)
      text = this.smartTruncate(sections, maxTokens)
    }
    
    return text
  }
  
  private extractImportantSections(text: string): Section[] {
    const sections: Section[] = []
    
    // Extract headings and their content
    const headingRegex = /^#{1,6}\s+(.+)$/gm
    let lastHeadingIndex = 0
    let match
    
    while ((match = headingRegex.exec(text)) !== null) {
      if (lastHeadingIndex > 0) {
        sections.push({
          content: text.substring(lastHeadingIndex, match.index),
          importance: this.calculateImportance(text.substring(lastHeadingIndex, match.index)),
          type: 'content'
        })
      }
      
      sections.push({
        content: match[0],
        importance: 1.0, // Headings are always important
        type: 'heading'
      })
      
      lastHeadingIndex = match.index + match[0].length
    }
    
    // Add final section
    if (lastHeadingIndex < text.length) {
      sections.push({
        content: text.substring(lastHeadingIndex),
        importance: this.calculateImportance(text.substring(lastHeadingIndex)),
        type: 'content'
      })
    }
    
    return sections
  }
  
  private calculateImportance(text: string): number {
    let score = 0.5 // Base score
    
    // Boost for keywords
    const keywords = ['important', 'critical', 'key', 'main', 'primary']
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        score += 0.1
      }
    })
    
    // Boost for structured content
    if (text.includes('```')) score += 0.2 // Code blocks
    if (text.match(/\d+\./)) score += 0.1 // Numbered lists
    if (text.includes('|')) score += 0.1 // Tables
    
    return Math.min(score, 1.0)
  }
}
```

## Monitoring and Profiling

### Performance Monitoring

```typescript
import { performance } from 'perf_hooks'

export class PerformanceMonitor {
  private metrics = new Map<string, Metric[]>()
  
  startTimer(operation: string): () => void {
    const start = performance.now()
    
    return () => {
      const duration = performance.now() - start
      this.recordMetric(operation, duration)
    }
  }
  
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(operation, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(operation, duration, false)
      throw error
    }
  }
  
  private recordMetric(
    operation: string,
    duration: number,
    success: boolean = true
  ): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }
    
    this.metrics.get(operation)!.push({
      duration,
      success,
      timestamp: Date.now()
    })
    
    // Emit metric for real-time monitoring
    this.emitMetric({
      operation,
      duration,
      success
    })
  }
  
  getStats(operation: string): OperationStats {
    const metrics = this.metrics.get(operation) || []
    
    if (metrics.length === 0) {
      return null
    }
    
    const durations = metrics
      .filter(m => m.success)
      .map(m => m.duration)
    
    return {
      count: metrics.length,
      successRate: metrics.filter(m => m.success).length / metrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p50: this.percentile(durations, 0.5),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99)
    }
  }
}
```

### Resource Monitoring

```typescript
export class ResourceMonitor {
  private interval: NodeJS.Timer
  
  startMonitoring(intervalMs: number = 5000): void {
    this.interval = setInterval(() => {
      const usage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()
      
      // Log metrics
      logger.info('Resource usage', {
        memory: {
          rss: usage.rss / 1024 / 1024, // MB
          heapTotal: usage.heapTotal / 1024 / 1024,
          heapUsed: usage.heapUsed / 1024 / 1024,
          external: usage.external / 1024 / 1024
        },
        cpu: {
          user: cpuUsage.user / 1000000, // seconds
          system: cpuUsage.system / 1000000
        }
      })
      
      // Check for memory leaks
      if (usage.heapUsed > 1024 * 1024 * 1024) { // 1GB
        logger.warn('High memory usage detected')
      }
    }, intervalMs)
  }
  
  stopMonitoring(): void {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
}
```

## Best Practices

### 1. Lazy Loading

```typescript
// Load large models only when needed
class LazyModelLoader {
  private models = new Map<string, any>()
  
  async getModel(name: string): Promise<any> {
    if (!this.models.has(name)) {
      const model = await this.loadModel(name)
      this.models.set(name, model)
    }
    return this.models.get(name)
  }
}
```

### 2. Connection Pooling

```typescript
// Reuse connections
class ConnectionPool {
  private pool: Connection[] = []
  private maxSize = 10
  
  async getConnection(): Promise<Connection> {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createConnection()
  }
  
  releaseConnection(conn: Connection): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(conn)
    } else {
      conn.close()
    }
  }
}
```

### 3. Early Exit Strategies

```typescript
// Skip unnecessary processing
async function processWithEarlyExit(doc: Document): Promise<ProcessedDoc> {
  // Check cache first
  const cached = await cache.get(doc.id)
  if (cached) return cached
  
  // Check if already processed
  if (doc.status === 'completed') {
    return doc.processed
  }
  
  // Skip if too large
  if (doc.size > MAX_SIZE) {
    throw new Error('Document too large')
  }
  
  // Process normally
  return process(doc)
}
```

## Next Steps

Continue to [Troubleshooting Guide](./09-troubleshooting.md) for common issues and solutions.