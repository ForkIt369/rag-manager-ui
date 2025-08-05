# Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common issues in the document processing pipeline.

## Common Issues and Solutions

### 1. Document Processing Failures

#### Issue: "Failed to extract text from PDF"

**Symptoms:**
- PDFs show as "error" status
- Empty chunks despite successful upload
- Error message: "Cannot read properties of undefined"

**Solutions:**

```typescript
// Solution 1: Add robust PDF detection
async function detectPDFType(file: Blob): Promise<PDFType> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  
  // Check PDF header
  const header = String.fromCharCode(...bytes.slice(0, 5))
  if (header !== '%PDF-') {
    throw new Error('Invalid PDF file')
  }
  
  // Check for encryption
  const pdfData = await pdfjsLib.getDocument(buffer).promise
  if (pdfData.isEncrypted) {
    throw new Error('Encrypted PDFs not supported')
  }
  
  // Check for forms
  const hasForm = await checkForForms(pdfData)
  
  return {
    isValid: true,
    isEncrypted: false,
    hasForm,
    version: header
  }
}

// Solution 2: Fallback processing
async function processWithFallback(file: Blob): Promise<ProcessedContent> {
  try {
    // Try visual processing first
    return await processVisual(file)
  } catch (visualError) {
    logger.warn('Visual processing failed, trying text extraction', visualError)
    
    try {
      // Fallback to text extraction
      return await processText(file)
    } catch (textError) {
      logger.warn('Text extraction failed, trying OCR', textError)
      
      // Last resort: OCR
      return await processWithOCR(file)
    }
  }
}
```

#### Issue: "Token limit exceeded"

**Symptoms:**
- Large documents fail to process
- Error: "Request too large"
- Voyage API returns 413 error

**Solutions:**

```typescript
// Solution: Implement progressive chunking
class ProgressiveChunker {
  async chunkLargeDocument(content: string): Promise<Chunk[]> {
    const chunks: Chunk[] = []
    const maxChunkTokens = 8000 // Conservative limit
    
    // First pass: Split by major sections
    const sections = this.splitByHeadings(content)
    
    for (const section of sections) {
      const sectionTokens = await this.countTokens(section.content)
      
      if (sectionTokens <= maxChunkTokens) {
        chunks.push(this.createChunk(section))
      } else {
        // Second pass: Split large sections
        const subChunks = await this.splitLargeSection(section, maxChunkTokens)
        chunks.push(...subChunks)
      }
    }
    
    return chunks
  }
  
  private async splitLargeSection(
    section: Section,
    maxTokens: number
  ): Promise<Chunk[]> {
    const chunks: Chunk[] = []
    const paragraphs = section.content.split(/\n\n+/)
    
    let currentChunk = ''
    let currentTokens = 0
    
    for (const paragraph of paragraphs) {
      const paragraphTokens = await this.countTokens(paragraph)
      
      if (paragraphTokens > maxTokens) {
        // Split paragraph by sentences
        const sentences = this.splitBySentences(paragraph)
        
        for (const sentence of sentences) {
          const sentenceTokens = await this.countTokens(sentence)
          
          if (currentTokens + sentenceTokens > maxTokens) {
            if (currentChunk) {
              chunks.push(this.createChunk({ content: currentChunk }))
              currentChunk = ''
              currentTokens = 0
            }
          }
          
          currentChunk += sentence + ' '
          currentTokens += sentenceTokens
        }
      } else if (currentTokens + paragraphTokens > maxTokens) {
        // Save current chunk
        chunks.push(this.createChunk({ content: currentChunk }))
        currentChunk = paragraph
        currentTokens = paragraphTokens
      } else {
        currentChunk += '\n\n' + paragraph
        currentTokens += paragraphTokens
      }
    }
    
    // Save final chunk
    if (currentChunk) {
      chunks.push(this.createChunk({ content: currentChunk }))
    }
    
    return chunks
  }
}
```

### 2. Embedding Generation Issues

#### Issue: "Rate limit exceeded"

**Symptoms:**
- 429 errors from Voyage AI
- Processing gets stuck
- Intermittent failures

**Solutions:**

```typescript
// Solution 1: Implement adaptive rate limiting
class AdaptiveRateLimiter {
  private requestTimes: number[] = []
  private rateLimitInfo = {
    limit: 100,
    window: 60000, // 1 minute
    current: 0
  }
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    const windowStart = now - this.rateLimitInfo.window
    
    // Clean old requests
    this.requestTimes = this.requestTimes.filter(time => time > windowStart)
    
    // Check if we're at limit
    if (this.requestTimes.length >= this.rateLimitInfo.limit) {
      const oldestRequest = this.requestTimes[0]
      const waitTime = oldestRequest + this.rateLimitInfo.window - now
      
      if (waitTime > 0) {
        logger.info(`Rate limit reached, waiting ${waitTime}ms`)
        await this.sleep(waitTime)
      }
    }
    
    // Record this request
    this.requestTimes.push(now)
  }
  
  updateFromResponse(headers: Headers): void {
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0')
    const limit = parseInt(headers.get('x-ratelimit-limit') || '100')
    const reset = parseInt(headers.get('x-ratelimit-reset') || '0')
    
    this.rateLimitInfo = {
      limit,
      window: reset * 1000 - Date.now(),
      current: limit - remaining
    }
  }
}

// Solution 2: Circuit breaker pattern
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > 60000) { // 1 minute
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    
    try {
      const result = await fn()
      if (this.state === 'half-open') {
        this.state = 'closed'
        this.failures = 0
      }
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }
  
  private recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= 5) {
      this.state = 'open'
      logger.error('Circuit breaker opened due to repeated failures')
    }
  }
}
```

#### Issue: "Invalid embedding dimension"

**Symptoms:**
- Vector search returns no results
- Dimension mismatch errors
- Database insert failures

**Solutions:**

```typescript
// Solution: Validate and normalize embeddings
class EmbeddingValidator {
  private expectedDimensions = {
    'voyage-3.5': 1024,
    'voyage-multimodal-3': 1024,
    'voyage-code-3': 1024
  }
  
  validateAndNormalize(
    embeddings: number[][],
    model: string
  ): ValidatedEmbeddings {
    const expectedDim = this.expectedDimensions[model]
    const issues: ValidationIssue[] = []
    
    const validated = embeddings.map((embedding, index) => {
      // Check dimension
      if (embedding.length !== expectedDim) {
        issues.push({
          index,
          type: 'dimension_mismatch',
          expected: expectedDim,
          actual: embedding.length
        })
        
        // Pad or truncate
        if (embedding.length < expectedDim) {
          // Pad with zeros
          embedding = [...embedding, ...new Array(expectedDim - embedding.length).fill(0)]
        } else {
          // Truncate
          embedding = embedding.slice(0, expectedDim)
        }
      }
      
      // Check for NaN or Infinity
      const hasInvalid = embedding.some(val => !isFinite(val))
      if (hasInvalid) {
        issues.push({
          index,
          type: 'invalid_values'
        })
        
        // Replace invalid values
        embedding = embedding.map(val => isFinite(val) ? val : 0)
      }
      
      // Normalize
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
      if (Math.abs(magnitude - 1.0) > 0.01) {
        embedding = embedding.map(val => val / magnitude)
      }
      
      return embedding
    })
    
    return {
      embeddings: validated,
      issues,
      isValid: issues.length === 0
    }
  }
}
```

### 3. Memory and Performance Issues

#### Issue: "JavaScript heap out of memory"

**Symptoms:**
- Process crashes with memory error
- Slow processing for large documents
- Memory usage keeps growing

**Solutions:**

```typescript
// Solution 1: Implement streaming processing
import { pipeline } from 'stream'
import { createReadStream, createWriteStream } from 'fs'

class StreamingDocumentProcessor {
  async processLargeFile(filePath: string): Promise<void> {
    const readStream = createReadStream(filePath, { encoding: 'utf8' })
    const processStream = new ChunkingStream()
    const embedStream = new EmbeddingStream()
    const writeStream = new DatabaseWriteStream()
    
    return new Promise((resolve, reject) => {
      pipeline(
        readStream,
        processStream,
        embedStream,
        writeStream,
        (error) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        }
      )
    })
  }
}

class ChunkingStream extends Transform {
  private buffer = ''
  private chunkSize = 1000
  
  _transform(chunk: Buffer, encoding: string, callback: Function) {
    this.buffer += chunk.toString()
    
    // Process complete sentences
    const sentences = this.buffer.split(/\. /)
    
    // Keep last incomplete sentence in buffer
    this.buffer = sentences.pop() || ''
    
    // Process complete sentences
    for (const sentence of sentences) {
      if (sentence.trim()) {
        this.push({
          content: sentence + '.',
          index: this.chunkIndex++
        })
      }
    }
    
    callback()
  }
}

// Solution 2: Memory leak detection
class MemoryLeakDetector {
  private snapshots: MemorySnapshot[] = []
  private interval: NodeJS.Timer
  
  startMonitoring(): void {
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    this.interval = setInterval(() => {
      const usage = process.memoryUsage()
      
      this.snapshots.push({
        timestamp: Date.now(),
        heapUsed: usage.heapUsed,
        external: usage.external,
        arrayBuffers: usage.arrayBuffers
      })
      
      // Keep only last 100 snapshots
      if (this.snapshots.length > 100) {
        this.snapshots.shift()
      }
      
      // Detect leak
      if (this.detectLeak()) {
        logger.error('Memory leak detected!', {
          trend: this.getMemoryTrend(),
          current: usage
        })
      }
    }, 10000) // Check every 10 seconds
  }
  
  private detectLeak(): boolean {
    if (this.snapshots.length < 10) return false
    
    // Calculate trend
    const recent = this.snapshots.slice(-10)
    const trend = this.calculateTrend(recent.map(s => s.heapUsed))
    
    // Leak if consistent growth > 1MB per minute
    return trend > 1024 * 1024 / 6
  }
}
```

### 4. Database Issues

#### Issue: "Convex function timeout"

**Symptoms:**
- Functions timeout after 60 seconds
- Large batch operations fail
- "Function execution timed out" errors

**Solutions:**

```typescript
// Solution: Break up large operations
class BatchProcessor {
  async processBatchWithTimeout<T>(
    items: T[],
    processor: (batch: T[]) => Promise<void>,
    options: {
      batchSize: number
      timeout: number
    }
  ): Promise<void> {
    const batches = this.createBatches(items, options.batchSize)
    
    for (const batch of batches) {
      await this.processWithTimeout(
        () => processor(batch),
        options.timeout
      )
      
      // Yield to prevent timeout
      await this.sleep(100)
    }
  }
  
  private async processWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ])
  }
}

// In Convex action
export const processLargeDocument = action({
  handler: async (ctx, args) => {
    const chunks = args.chunks
    const BATCH_SIZE = 100
    const TIMEOUT = 50000 // 50 seconds (under 60s limit)
    
    // Process in batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      
      // Create a new action for each batch
      await ctx.scheduler.runAfter(0, internal.processBatch, {
        documentId: args.documentId,
        chunks: batch,
        startIndex: i
      })
    }
    
    return { scheduled: Math.ceil(chunks.length / BATCH_SIZE) }
  }
})
```

### 5. File Format Issues

#### Issue: "Unsupported file format"

**Symptoms:**
- Files rejected despite correct extension
- "Cannot determine file type" errors
- Corrupted file uploads

**Solutions:**

```typescript
// Solution: Robust file type detection
import { fileTypeFromBuffer } from 'file-type'
import * as magic from 'magic-bytes.js'

class FileTypeDetector {
  async detect(file: Blob): Promise<FileType> {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    // Try file-type library
    const detected = await fileTypeFromBuffer(bytes)
    if (detected) {
      return {
        mime: detected.mime,
        ext: detected.ext,
        confidence: 'high'
      }
    }
    
    // Try magic bytes
    const magicResult = magic(bytes)
    if (magicResult.length > 0) {
      return {
        mime: magicResult[0].mime,
        ext: magicResult[0].extension,
        confidence: 'medium'
      }
    }
    
    // Fallback to extension
    const ext = this.getExtension(file.name)
    if (ext) {
      return {
        mime: this.getMimeFromExt(ext),
        ext,
        confidence: 'low'
      }
    }
    
    throw new Error('Unable to determine file type')
  }
  
  async validateFile(file: Blob, expectedType: string): Promise<boolean> {
    const detected = await this.detect(file)
    
    // Check if detected type matches expected
    if (detected.mime !== expectedType) {
      logger.warn('File type mismatch', {
        expected: expectedType,
        detected: detected.mime,
        confidence: detected.confidence
      })
      
      // Allow if low confidence and extension matches
      if (detected.confidence === 'low') {
        const expectedExt = this.getExtFromMime(expectedType)
        return detected.ext === expectedExt
      }
      
      return false
    }
    
    return true
  }
}
```

## Debugging Tools

### 1. Debug Logger

```typescript
class DebugLogger {
  private debugMode = process.env.DEBUG === 'true'
  
  debug(operation: string, data: any): void {
    if (!this.debugMode) return
    
    console.log(`[DEBUG][${operation}]`, {
      timestamp: new Date().toISOString(),
      data,
      stack: new Error().stack
    })
  }
  
  async traceAsync<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const traceId = this.generateTraceId()
    
    this.debug(`${operation}:start`, { traceId })
    const start = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - start
      
      this.debug(`${operation}:success`, {
        traceId,
        duration,
        result: this.sanitizeResult(result)
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      this.debug(`${operation}:error`, {
        traceId,
        duration,
        error: error.message,
        stack: error.stack
      })
      
      throw error
    }
  }
}
```

### 2. Health Check System

```typescript
class HealthChecker {
  async runHealthChecks(): Promise<HealthReport> {
    const checks = [
      this.checkVoyageAPI(),
      this.checkConvexConnection(),
      this.checkStorageAccess(),
      this.checkMemoryUsage(),
      this.checkDiskSpace()
    ]
    
    const results = await Promise.allSettled(checks)
    
    return {
      timestamp: Date.now(),
      checks: results.map((result, index) => ({
        name: ['voyage_api', 'convex', 'storage', 'memory', 'disk'][index],
        status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        details: result.status === 'fulfilled' ? result.value : result.reason
      })),
      overall: results.every(r => r.status === 'fulfilled') ? 'healthy' : 'unhealthy'
    }
  }
  
  private async checkVoyageAPI(): Promise<CheckResult> {
    try {
      const result = await voyageClient.embed(['test'], {
        model: 'voyage-3.5'
      })
      
      return {
        status: 'healthy',
        latency: result.latency,
        details: 'API responding normally'
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        details: 'Cannot reach Voyage AI API'
      }
    }
  }
}
```

### 3. Test Utilities

```typescript
// Test document generator
class TestDocumentGenerator {
  generateTestPDF(options: {
    pages: number
    hasImages: boolean
    hasText: boolean
  }): Buffer {
    // Generate test PDF
  }
  
  generateEdgeCases(): TestCase[] {
    return [
      {
        name: 'empty_file',
        file: Buffer.alloc(0),
        expectedError: 'File is empty'
      },
      {
        name: 'corrupted_pdf',
        file: Buffer.from('%PDF-1.4\ncorrupted'),
        expectedError: 'Invalid PDF structure'
      },
      {
        name: 'huge_file',
        file: this.generateLargeFile(200 * 1024 * 1024), // 200MB
        expectedError: 'File too large'
      }
    ]
  }
}
```

## Error Recovery Strategies

### 1. Automatic Retry with Backoff

```typescript
class RetryManager {
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      factor = 2,
      jitter = true
    } = options
    
    let lastError: Error
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (!this.isRetryable(error)) {
          throw error
        }
        
        if (attempt < maxAttempts - 1) {
          const delay = this.calculateDelay(
            attempt,
            initialDelay,
            maxDelay,
            factor,
            jitter
          )
          
          logger.info(`Retry attempt ${attempt + 1}/${maxAttempts} after ${delay}ms`)
          await this.sleep(delay)
        }
      }
    }
    
    throw lastError
  }
  
  private isRetryable(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true
    }
    
    // Rate limits
    if (error.status === 429) {
      return true
    }
    
    // Server errors
    if (error.status >= 500) {
      return true
    }
    
    return false
  }
}
```

### 2. Graceful Degradation

```typescript
class GracefulDegradation {
  async processWithFallbacks(document: Document): Promise<ProcessedDocument> {
    const strategies = [
      () => this.processWithMultimodal(document),
      () => this.processWithTextOnly(document),
      () => this.processWithBasicExtraction(document),
      () => this.createMinimalDocument(document)
    ]
    
    let lastError: Error
    
    for (const strategy of strategies) {
      try {
        return await strategy()
      } catch (error) {
        lastError = error
        logger.warn('Strategy failed, trying next', {
          error: error.message,
          remainingStrategies: strategies.length - strategies.indexOf(strategy) - 1
        })
      }
    }
    
    // All strategies failed
    throw new Error(`All processing strategies failed: ${lastError.message}`)
  }
}
```

## Next Steps

For implementation details, refer back to the [Implementation Guide](./07-implementation-guide.md).