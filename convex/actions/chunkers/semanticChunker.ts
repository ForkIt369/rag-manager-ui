"use node"

import { ProcessedChunk, ProcessingOptions, ChunkingStrategy } from '../../lib/types/processing'

export class SemanticChunker implements ChunkingStrategy {
  async chunk(
    content: string,
    options: ProcessingOptions
  ): Promise<ProcessedChunk[]> {
    const chunks: ProcessedChunk[] = []
    const { chunkSize, chunkOverlap } = options
    
    // Split content into sentences first
    const sentences = this.splitIntoSentences(content)
    
    let currentChunk = ''
    let currentTokens = 0
    let startIndex = 0
    let chunkIndex = 0
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      const sentenceTokens = this.estimateTokens(sentence)
      
      // If adding this sentence would exceed chunk size
      if (currentTokens + sentenceTokens > chunkSize && currentChunk) {
        // Save current chunk
        chunks.push({
          content: currentChunk.trim(),
          startIndex,
          endIndex: startIndex + currentChunk.length,
          tokens: currentTokens,
          metadata: {
            chunkIndex,
            type: 'text'
          }
        })
        
        // Handle overlap
        if (chunkOverlap > 0) {
          const overlapSentences = this.getOverlapSentences(
            sentences,
            i,
            chunkOverlap
          )
          currentChunk = overlapSentences.join(' ') + ' ' + sentence
          currentTokens = this.estimateTokens(currentChunk)
          startIndex = content.indexOf(overlapSentences[0], startIndex)
        } else {
          currentChunk = sentence
          currentTokens = sentenceTokens
          startIndex = content.indexOf(sentence, startIndex + 1)
        }
        
        chunkIndex++
      } else {
        // Add sentence to current chunk
        currentChunk += (currentChunk ? ' ' : '') + sentence
        currentTokens += sentenceTokens
      }
    }
    
    // Add the last chunk if any content remains
    if (currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        startIndex,
        endIndex: content.length,
        tokens: currentTokens,
        metadata: {
          chunkIndex,
          type: 'text'
        }
      })
    }
    
    return chunks
  }
  
  private splitIntoSentences(text: string): string[] {
    // Improved sentence splitting that handles abbreviations
    const sentenceEnders = /([.!?])\s+/g
    const abbreviations = new Set([
      'Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Sr.', 'Jr.',
      'Ph.D.', 'M.D.', 'B.A.', 'M.A.', 'B.S.', 'M.S.',
      'i.e.', 'e.g.', 'etc.', 'vs.', 'Inc.', 'Ltd.', 'Co.'
    ])
    
    const sentences: string[] = []
    let lastIndex = 0
    let match
    
    while ((match = sentenceEnders.exec(text)) !== null) {
      const sentence = text.slice(lastIndex, match.index + 1).trim()
      
      // Check if this is actually an abbreviation
      const lastWord = sentence.split(' ').pop()
      if (lastWord && !abbreviations.has(lastWord)) {
        sentences.push(sentence)
        lastIndex = match.index + match[0].length
      }
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex).trim()
      if (remaining) {
        sentences.push(remaining)
      }
    }
    
    return sentences.filter(s => s.length > 0)
  }
  
  private getOverlapSentences(
    sentences: string[],
    currentIndex: number,
    overlapTokens: number
  ): string[] {
    const overlapSentences: string[] = []
    let tokens = 0
    
    // Go backwards from current position to get overlap
    for (let i = currentIndex - 1; i >= 0 && tokens < overlapTokens; i--) {
      const sentence = sentences[i]
      overlapSentences.unshift(sentence)
      tokens += this.estimateTokens(sentence)
    }
    
    return overlapSentences
  }
  
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English
    // This is a simplified approach; consider using a proper tokenizer
    return Math.ceil(text.length / 4)
  }
}

export function createSemanticChunker(): ChunkingStrategy {
  return new SemanticChunker()
}