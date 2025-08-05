# Chunking Strategies

## Overview

Intelligent chunking is critical for RAG performance. This document details advanced chunking strategies that preserve semantic meaning and context.

## Core Chunking Principles

1. **Semantic Boundaries**: Respect natural language boundaries
2. **Context Preservation**: Maintain enough context for understanding
3. **Optimal Size**: Balance between too small (loss of context) and too large (diluted relevance)
4. **Overlap Strategy**: Ensure continuity between chunks
5. **Metadata Enrichment**: Add context through metadata

## Base Chunking Interface

```typescript
interface ChunkingStrategy {
  chunk(content: string, options: ChunkOptions): Chunk[]
}

interface ChunkOptions {
  maxTokens: number      // Maximum tokens per chunk (default: 1000)
  minTokens: number      // Minimum tokens per chunk (default: 100)
  overlap: number        // Token overlap between chunks (default: 200)
  splitter: 'sentence' | 'paragraph' | 'semantic' | 'recursive'
}

interface Chunk {
  content: string
  startIndex: number
  endIndex: number
  tokens: number
  metadata: ChunkMetadata
}

interface ChunkMetadata {
  chunkIndex: number
  totalChunks?: number
  hasCodeBlock?: boolean
  language?: string
  headings?: string[]
  section?: string
  previousChunk?: string  // Last sentence of previous chunk
  nextChunk?: string      // First sentence of next chunk
}
```

## Semantic Chunking

### Implementation

```typescript
import { SentenceTokenizer } from 'natural'
import { encoding_for_model } from '@dqbd/tiktoken'

export class SemanticChunker implements ChunkingStrategy {
  private tokenizer = new SentenceTokenizer()
  private encoder = encoding_for_model('gpt-3.5-turbo')

  chunk(content: string, options: ChunkOptions): Chunk[] {
    const sentences = this.tokenizer.tokenize(content)
    const chunks: Chunk[] = []
    let currentChunk: string[] = []
    let currentTokens = 0
    let startIndex = 0

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      const sentenceTokens = this.countTokens(sentence)

      // Check if adding this sentence exceeds max tokens
      if (currentTokens + sentenceTokens > options.maxTokens && currentChunk.length > 0) {
        // Create chunk
        chunks.push(this.createChunk(
          currentChunk,
          startIndex,
          content.indexOf(currentChunk[currentChunk.length - 1]) + currentChunk[currentChunk.length - 1].length,
          i - 1,
          sentences
        ))

        // Start new chunk with overlap
        currentChunk = this.getOverlapSentences(sentences, i, options.overlap)
        currentTokens = this.countTokens(currentChunk.join(' '))
        startIndex = content.indexOf(sentences[i])
      }

      currentChunk.push(sentence)
      currentTokens += sentenceTokens
    }

    // Add final chunk
    if (currentChunk.length > 0) {
      chunks.push(this.createChunk(
        currentChunk,
        startIndex,
        content.length,
        sentences.length - 1,
        sentences
      ))
    }

    return this.enrichChunksWithMetadata(chunks, content)
  }

  private getOverlapSentences(sentences: string[], currentIndex: number, overlapTokens: number): string[] {
    const overlap: string[] = []
    let tokens = 0
    
    // Go backwards to collect overlap sentences
    for (let i = currentIndex - 1; i >= 0 && tokens < overlapTokens; i--) {
      const sentenceTokens = this.countTokens(sentences[i])
      if (tokens + sentenceTokens <= overlapTokens) {
        overlap.unshift(sentences[i])
        tokens += sentenceTokens
      } else {
        break
      }
    }
    
    return overlap
  }

  private createChunk(
    sentences: string[],
    startIndex: number,
    endIndex: number,
    sentenceEndIndex: number,
    allSentences: string[]
  ): Chunk {
    const content = sentences.join(' ')
    
    return {
      content,
      startIndex,
      endIndex,
      tokens: this.countTokens(content),
      metadata: {
        chunkIndex: 0, // Will be set later
        previousChunk: sentenceEndIndex > 0 ? allSentences[sentenceEndIndex - sentences.length] : undefined,
        nextChunk: sentenceEndIndex < allSentences.length - 1 ? allSentences[sentenceEndIndex + 1] : undefined
      }
    }
  }

  private countTokens(text: string): number {
    return this.encoder.encode(text).length
  }

  private enrichChunksWithMetadata(chunks: Chunk[], fullContent: string): Chunk[] {
    return chunks.map((chunk, index) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        chunkIndex: index,
        totalChunks: chunks.length,
        headings: this.extractHeadings(chunk.content),
        section: this.detectSection(chunk.startIndex, fullContent)
      }
    }))
  }

  private extractHeadings(content: string): string[] {
    const headingPattern = /^#{1,6}\s+(.+)$/gm
    const headings: string[] = []
    let match
    
    while ((match = headingPattern.exec(content)) !== null) {
      headings.push(match[1])
    }
    
    return headings
  }

  private detectSection(startIndex: number, fullContent: string): string {
    // Find the last heading before this chunk
    const contentBefore = fullContent.substring(0, startIndex)
    const headingPattern = /^#{1,6}\s+(.+)$/gm
    const headings = [...contentBefore.matchAll(headingPattern)]
    
    return headings.length > 0 ? headings[headings.length - 1][1] : 'Introduction'
  }
}
```

## Recursive Character Text Splitter

### Implementation

```typescript
export class RecursiveCharacterTextSplitter implements ChunkingStrategy {
  private separators = [
    '\n\n',    // Double newline (paragraphs)
    '\n',      // Single newline
    '. ',      // Sentence end
    ', ',      // Clause separator
    ' ',       // Word separator
    ''         // Character separator
  ]

  chunk(content: string, options: ChunkOptions): Chunk[] {
    return this.recursiveSplit(content, options, 0)
  }

  private recursiveSplit(
    text: string,
    options: ChunkOptions,
    separatorIndex: number
  ): Chunk[] {
    if (separatorIndex >= this.separators.length) {
      // Last resort: split by character count
      return this.splitByCharacterCount(text, options)
    }

    const separator = this.separators[separatorIndex]
    const parts = text.split(separator)
    const chunks: Chunk[] = []
    let currentChunk = ''
    let currentTokens = 0

    for (const part of parts) {
      const partTokens = this.countTokens(part)
      
      if (currentTokens + partTokens > options.maxTokens && currentChunk) {
        // Current chunk is full
        if (currentTokens >= options.minTokens) {
          chunks.push(this.createChunk(currentChunk.trim()))
          currentChunk = this.getOverlap(currentChunk, options.overlap)
          currentTokens = this.countTokens(currentChunk)
        } else {
          // Chunk too small, try next separator
          const subChunks = this.recursiveSplit(
            currentChunk + separator + part,
            options,
            separatorIndex + 1
          )
          chunks.push(...subChunks)
          currentChunk = ''
          currentTokens = 0
          continue
        }
      }

      currentChunk += (currentChunk ? separator : '') + part
      currentTokens += partTokens + (currentChunk ? this.countTokens(separator) : 0)
    }

    // Handle remaining content
    if (currentChunk) {
      if (currentTokens >= options.minTokens) {
        chunks.push(this.createChunk(currentChunk.trim()))
      } else if (chunks.length > 0) {
        // Merge with previous chunk if too small
        const lastChunk = chunks[chunks.length - 1]
        lastChunk.content += separator + currentChunk
        lastChunk.tokens = this.countTokens(lastChunk.content)
      } else {
        // Force create chunk even if small
        chunks.push(this.createChunk(currentChunk.trim()))
      }
    }

    return chunks
  }

  private getOverlap(chunk: string, overlapTokens: number): string {
    const words = chunk.split(' ')
    let overlap = ''
    let tokens = 0

    // Take words from the end until we reach overlap token count
    for (let i = words.length - 1; i >= 0 && tokens < overlapTokens; i--) {
      const word = words[i]
      const wordTokens = this.countTokens(word)
      
      if (tokens + wordTokens <= overlapTokens) {
        overlap = word + (overlap ? ' ' + overlap : '')
        tokens += wordTokens
      } else {
        break
      }
    }

    return overlap
  }
}
```

## Code-Aware Chunking

### Implementation

```typescript
export class CodeChunker implements ChunkingStrategy {
  private languagePatterns = {
    typescript: {
      functionPattern: /(?:export\s+)?(?:async\s+)?function\s+\w+|(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?\(/g,
      classPattern: /(?:export\s+)?class\s+\w+/g,
      importPattern: /import\s+.+from\s+['"].+['"]/g
    },
    python: {
      functionPattern: /def\s+\w+\s*\(|async\s+def\s+\w+\s*\(/g,
      classPattern: /class\s+\w+/g,
      importPattern: /(?:from\s+\S+\s+)?import\s+.+/g
    }
  }

  chunk(content: string, options: ChunkOptions & { language?: string }): Chunk[] {
    const language = options.language || this.detectLanguage(content)
    const codeBlocks = this.extractCodeBlocks(content)
    
    if (codeBlocks.length === 0) {
      // No code blocks, use semantic chunking
      return new SemanticChunker().chunk(content, options)
    }

    const chunks: Chunk[] = []
    
    for (const block of codeBlocks) {
      if (this.countTokens(block.code) <= options.maxTokens) {
        // Code block fits in one chunk
        chunks.push({
          content: block.code,
          startIndex: block.start,
          endIndex: block.end,
          tokens: this.countTokens(block.code),
          metadata: {
            chunkIndex: chunks.length,
            hasCodeBlock: true,
            language: block.language || language,
            codeContext: this.extractCodeContext(block.code, language)
          }
        })
      } else {
        // Split large code block intelligently
        const subChunks = this.splitLargeCodeBlock(block, options, language)
        chunks.push(...subChunks)
      }
    }

    // Process non-code content
    const nonCodeChunks = this.processNonCodeContent(content, codeBlocks, options)
    chunks.push(...nonCodeChunks)

    // Sort by position and reassign indices
    return chunks
      .sort((a, b) => a.startIndex - b.startIndex)
      .map((chunk, index) => ({
        ...chunk,
        metadata: { ...chunk.metadata, chunkIndex: index }
      }))
  }

  private extractCodeBlocks(content: string): CodeBlock[] {
    const blocks: CodeBlock[] = []
    
    // Markdown code blocks
    const mdCodePattern = /```(\w+)?\n([\s\S]*?)```/g
    let match
    
    while ((match = mdCodePattern.exec(content)) !== null) {
      blocks.push({
        code: match[2],
        language: match[1],
        start: match.index,
        end: match.index + match[0].length,
        type: 'markdown'
      })
    }

    // Inline code detection for non-markdown content
    if (blocks.length === 0) {
      const codeIndicators = [
        /function\s+\w+\s*\(/,
        /class\s+\w+/,
        /const\s+\w+\s*=/,
        /import\s+.+from/
      ]
      
      if (codeIndicators.some(pattern => pattern.test(content))) {
        blocks.push({
          code: content,
          language: this.detectLanguage(content),
          start: 0,
          end: content.length,
          type: 'inline'
        })
      }
    }

    return blocks
  }

  private splitLargeCodeBlock(
    block: CodeBlock,
    options: ChunkOptions,
    language: string
  ): Chunk[] {
    const chunks: Chunk[] = []
    const patterns = this.languagePatterns[language] || this.languagePatterns.typescript
    
    // Extract imports (always keep together)
    const imports = this.extractImports(block.code, patterns.importPattern)
    let remainingCode = block.code
    
    if (imports.length > 0) {
      const importSection = imports.join('\n')
      remainingCode = block.code.substring(importSection.length).trim()
    }

    // Split by functions/classes
    const functions = this.extractFunctions(remainingCode, patterns)
    
    for (const func of functions) {
      const funcWithImports = imports.length > 0 
        ? imports.join('\n') + '\n\n' + func.code
        : func.code
        
      if (this.countTokens(funcWithImports) <= options.maxTokens) {
        chunks.push({
          content: funcWithImports,
          startIndex: block.start + func.start,
          endIndex: block.start + func.end,
          tokens: this.countTokens(funcWithImports),
          metadata: {
            chunkIndex: chunks.length,
            hasCodeBlock: true,
            language,
            codeContext: {
              type: func.type,
              name: func.name,
              imports: imports.length > 0
            }
          }
        })
      } else {
        // Function too large, split by logical sections
        const subChunks = this.splitLargeFunction(funcWithImports, options)
        chunks.push(...subChunks)
      }
    }

    return chunks
  }

  private extractImports(code: string, pattern: RegExp): string[] {
    const imports: string[] = []
    const lines = code.split('\n')
    
    for (const line of lines) {
      if (pattern.test(line)) {
        imports.push(line)
      } else if (imports.length > 0 && line.trim() !== '') {
        // Stop when we hit non-import code
        break
      }
    }
    
    return imports
  }

  private detectLanguage(content: string): string {
    const indicators = {
      typescript: [/import.*from\s+['"]/, /export\s+(?:class|function|const)/, /:\s*\w+\s*[=;]/],
      python: [/import\s+\w+/, /from\s+\w+\s+import/, /def\s+\w+.*:/, /class\s+\w+.*:/],
      javascript: [/const\s+\w+\s*=/, /function\s+\w+/, /require\(['"]|.+\)[\s;]*$/]
    }
    
    for (const [lang, patterns] of Object.entries(indicators)) {
      if (patterns.some(pattern => pattern.test(content))) {
        return lang
      }
    }
    
    return 'text'
  }
}
```

## Table Chunking

### Implementation

```typescript
export class TableChunker implements ChunkingStrategy {
  chunk(content: string, options: ChunkOptions & { tables?: Table[] }): Chunk[] {
    const chunks: Chunk[] = []
    
    for (const table of options.tables || []) {
      const markdown = this.tableToMarkdown(table)
      const description = this.generateTableDescription(table)
      
      // Keep small tables together
      if (this.countTokens(markdown) <= options.maxTokens) {
        chunks.push({
          content: description + '\n\n' + markdown,
          startIndex: table.startIndex,
          endIndex: table.endIndex,
          tokens: this.countTokens(description + '\n\n' + markdown),
          metadata: {
            chunkIndex: chunks.length,
            isTable: true,
            tableRows: table.rows.length,
            tableColumns: table.rows[0]?.length || 0,
            tableHeaders: table.headers
          }
        })
      } else {
        // Split large tables by rows
        const tableChunks = this.splitLargeTable(table, description, options)
        chunks.push(...tableChunks)
      }
    }
    
    return chunks
  }

  private splitLargeTable(
    table: Table,
    description: string,
    options: ChunkOptions
  ): Chunk[] {
    const chunks: Chunk[] = []
    const headers = table.headers || table.rows[0]
    const dataRows = table.headers ? table.rows : table.rows.slice(1)
    
    let currentRows: string[][] = []
    let currentTokens = this.countTokens(description + '\n\n' + this.rowsToMarkdown([headers]))
    
    for (const row of dataRows) {
      const rowMarkdown = this.rowsToMarkdown([row])
      const rowTokens = this.countTokens(rowMarkdown)
      
      if (currentTokens + rowTokens > options.maxTokens && currentRows.length > 0) {
        // Create chunk
        const chunkTable = {
          headers,
          rows: currentRows
        }
        
        chunks.push({
          content: description + '\n\n' + this.tableToMarkdown(chunkTable),
          startIndex: 0,
          endIndex: 0,
          tokens: currentTokens,
          metadata: {
            chunkIndex: chunks.length,
            isTable: true,
            tableRows: currentRows.length,
            tableColumns: headers.length,
            tableHeaders: headers,
            tablePart: chunks.length + 1
          }
        })
        
        currentRows = []
        currentTokens = this.countTokens(description + '\n\n' + this.rowsToMarkdown([headers]))
      }
      
      currentRows.push(row)
      currentTokens += rowTokens
    }
    
    // Add final chunk
    if (currentRows.length > 0) {
      const chunkTable = {
        headers,
        rows: currentRows
      }
      
      chunks.push({
        content: description + '\n\n' + this.tableToMarkdown(chunkTable),
        startIndex: 0,
        endIndex: 0,
        tokens: currentTokens,
        metadata: {
          chunkIndex: chunks.length,
          isTable: true,
          tableRows: currentRows.length,
          tableColumns: headers.length,
          tableHeaders: headers,
          tablePart: chunks.length + 1
        }
      })
    }
    
    return chunks
  }

  private generateTableDescription(table: Table): string {
    const headers = table.headers || table.rows[0]
    const description = `Table with ${table.rows.length} rows and ${headers.length} columns. `
    const columnDesc = `Columns: ${headers.join(', ')}.`
    
    return description + columnDesc
  }
}
```

## Multimodal Chunking

### Implementation for Visual Documents

```typescript
export class MultimodalChunker implements ChunkingStrategy {
  chunk(content: any, options: ChunkOptions & { images?: Image[] }): Chunk[] {
    const chunks: Chunk[] = []
    
    // For PDFs with images
    if (options.images) {
      for (const image of options.images) {
        const textContent = image.extractedText || ''
        const description = this.generateImageDescription(image)
        
        chunks.push({
          content: description + (textContent ? '\n\n' + textContent : ''),
          startIndex: image.pageIndex * 1000, // Approximate
          endIndex: (image.pageIndex + 1) * 1000,
          tokens: this.countTokens(description + textContent),
          metadata: {
            chunkIndex: chunks.length,
            isMultimodal: true,
            hasImage: true,
            imagePath: image.path,
            imageSize: {
              width: image.width,
              height: image.height
            },
            pageNumber: image.pageNumber
          }
        })
      }
    }
    
    return chunks
  }

  private generateImageDescription(image: Image): string {
    const parts = [
      `[Image on page ${image.pageNumber}]`,
      image.caption ? `Caption: ${image.caption}` : '',
      image.altText ? `Alt text: ${image.altText}` : '',
      `Dimensions: ${image.width}x${image.height} pixels`
    ]
    
    return parts.filter(Boolean).join('\n')
  }
}
```

## Chunking Orchestrator

### Combining Multiple Strategies

```typescript
export class ChunkingOrchestrator {
  private strategies = {
    semantic: new SemanticChunker(),
    recursive: new RecursiveCharacterTextSplitter(),
    code: new CodeChunker(),
    table: new TableChunker(),
    multimodal: new MultimodalChunker()
  }

  async chunkDocument(
    document: ProcessedDocument,
    options: ChunkOptions
  ): Promise<Chunk[]> {
    const chunks: Chunk[] = []
    
    // Detect content types
    const analysis = this.analyzeContent(document)
    
    // Apply appropriate strategies
    if (analysis.hasCode) {
      const codeChunks = this.strategies.code.chunk(document.content, {
        ...options,
        language: analysis.primaryLanguage
      })
      chunks.push(...codeChunks)
    }
    
    if (analysis.hasTables) {
      const tableChunks = this.strategies.table.chunk(document.content, {
        ...options,
        tables: analysis.tables
      })
      chunks.push(...tableChunks)
    }
    
    if (analysis.hasImages) {
      const multimodalChunks = this.strategies.multimodal.chunk(document.content, {
        ...options,
        images: analysis.images
      })
      chunks.push(...multimodalChunks)
    }
    
    // Process remaining content
    const processedRanges = this.getProcessedRanges(chunks)
    const remainingContent = this.extractUnprocessedContent(
      document.content,
      processedRanges
    )
    
    if (remainingContent.length > 0) {
      const textChunks = this.strategies.semantic.chunk(remainingContent, options)
      chunks.push(...textChunks)
    }
    
    // Final optimization
    return this.optimizeChunks(chunks, options)
  }

  private optimizeChunks(chunks: Chunk[], options: ChunkOptions): Chunk[] {
    // Merge small adjacent chunks
    const optimized: Chunk[] = []
    let currentMerged: Chunk | null = null
    
    for (const chunk of chunks) {
      if (currentMerged && 
          chunk.tokens < options.minTokens &&
          currentMerged.tokens + chunk.tokens <= options.maxTokens) {
        // Merge chunks
        currentMerged = {
          content: currentMerged.content + '\n\n' + chunk.content,
          startIndex: currentMerged.startIndex,
          endIndex: chunk.endIndex,
          tokens: currentMerged.tokens + chunk.tokens,
          metadata: {
            ...currentMerged.metadata,
            merged: true,
            originalChunks: 2
          }
        }
      } else {
        if (currentMerged) {
          optimized.push(currentMerged)
        }
        currentMerged = chunk.tokens < options.minTokens ? chunk : null
        if (!currentMerged) {
          optimized.push(chunk)
        }
      }
    }
    
    if (currentMerged) {
      optimized.push(currentMerged)
    }
    
    return optimized
  }
}
```

## Next Steps

Continue to [Embedding Pipeline](./06-embedding-pipeline.md) for embedding generation and optimization.