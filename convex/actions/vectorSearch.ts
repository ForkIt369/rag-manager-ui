"use node"

import { action } from "../_generated/server"
import { internal } from "../_generated/api"
import { v } from "convex/values"
import { VoyageClient } from './lib/voyage'
import { logger } from './lib/monitoring'

export const search = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    documentId: v.optional(v.id("documents")),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now()
    
    try {
      // Validate query
      if (!args.query || args.query.trim().length === 0) {
        return {
          results: [],
          executionTime: 0,
          query: args.query,
        }
      }
      
      logger.info({ query: args.query, documentId: args.documentId }, 'Starting vector search')
      
      // Generate embedding for query
      const voyageClient = new VoyageClient(process.env.VOYAGE_API_KEY!)
      const [queryEmbedding] = await voyageClient.embedTexts([args.query], 'voyage-3')
      
      if (!queryEmbedding || queryEmbedding.length === 0) {
        throw new Error('Failed to generate query embedding')
      }
      
      logger.info({ embeddingDim: queryEmbedding.length }, 'Query embedding generated')
      
      // Perform vector search
      const limit = args.limit || 10
      const threshold = args.threshold || 0.0 // No minimum threshold by default
      
      // Search using Convex's vector index
      const searchResults = await ctx.runQuery(internal.chunks.vectorSearch, {
        embedding: queryEmbedding,
        limit: limit * 2, // Get more results to filter by threshold
        documentId: args.documentId,
      })
      
      // Calculate similarity scores and filter by threshold
      const resultsWithScores = searchResults
        .map(result => {
          // Calculate cosine similarity
          const similarity = cosineSimilarity(queryEmbedding, result.embedding || [])
          return {
            ...result,
            score: similarity,
          }
        })
        .filter(result => result.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
      
      // Save query to history
      const executionTime = Date.now() - startTime
      await ctx.runMutation(internal.queries.internalCreateQuery, {
        queryText: args.query,
        resultCount: resultsWithScores.length,
        topScore: resultsWithScores[0]?.score || 0,
        responseTimeMs: executionTime,
        results: resultsWithScores.slice(0, 10).map(r => ({
          chunkId: r._id,
          documentId: r.documentId,
          score: r.score,
          content: r.content.substring(0, 200),
        })),
      })
      
      logger.info(
        { 
          query: args.query,
          resultCount: resultsWithScores.length,
          executionTime,
        },
        'Vector search completed'
      )
      
      // Format results for frontend
      return {
        results: resultsWithScores.map(result => ({
          id: result._id,
          content: result.content,
          score: result.score,
          documentId: result.documentId,
          document: result.document,
          metadata: result.metadata,
        })),
        executionTime,
        query: args.query,
        totalResults: resultsWithScores.length,
      }
      
    } catch (error: any) {
      logger.error({ error, query: args.query }, 'Vector search failed')
      
      // Return empty results on error
      return {
        results: [],
        executionTime: Date.now() - startTime,
        query: args.query,
        error: error.message,
      }
    }
  },
})

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    return 0
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)
  
  if (normA === 0 || normB === 0) {
    return 0
  }
  
  return dotProduct / (normA * normB)
}

// Hybrid search combining vector and keyword search
export const hybridSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    documentId: v.optional(v.id("documents")),
    alpha: v.optional(v.number()), // Weight for vector search (0-1)
  },
  handler: async (ctx, args) => {
    const startTime = Date.now()
    const alpha = args.alpha ?? 0.7 // Default 70% vector, 30% keyword
    
    try {
      // Perform vector search
      const vectorResults = await ctx.runAction(internal.vectorSearch.search, {
        query: args.query,
        limit: args.limit,
        documentId: args.documentId,
      })
      
      // Perform keyword search
      const keywordResults = await ctx.runQuery(internal.chunks.keywordSearch, {
        query: args.query,
        limit: args.limit,
        documentId: args.documentId,
      })
      
      // Combine and re-rank results
      const combinedResults = combineSearchResults(
        vectorResults.results,
        keywordResults,
        alpha
      )
      
      return {
        results: combinedResults.slice(0, args.limit || 10),
        executionTime: Date.now() - startTime,
        query: args.query,
        searchType: 'hybrid',
        alpha,
      }
      
    } catch (error: any) {
      logger.error({ error, query: args.query }, 'Hybrid search failed')
      
      return {
        results: [],
        executionTime: Date.now() - startTime,
        query: args.query,
        error: error.message,
      }
    }
  },
})

// Combine vector and keyword search results
function combineSearchResults(
  vectorResults: any[],
  keywordResults: any[],
  alpha: number
): any[] {
  const resultMap = new Map<string, any>()
  
  // Add vector results with weighted scores
  vectorResults.forEach((result, index) => {
    const rankScore = 1 / (index + 1)
    resultMap.set(result.id, {
      ...result,
      finalScore: alpha * result.score,
      vectorRank: index + 1,
    })
  })
  
  // Add or update with keyword results
  keywordResults.forEach((result, index) => {
    const rankScore = 1 / (index + 1)
    const existing = resultMap.get(result._id)
    
    if (existing) {
      existing.finalScore += (1 - alpha) * rankScore
      existing.keywordRank = index + 1
    } else {
      resultMap.set(result._id, {
        ...result,
        id: result._id,
        score: rankScore,
        finalScore: (1 - alpha) * rankScore,
        keywordRank: index + 1,
      })
    }
  })
  
  // Sort by final score
  return Array.from(resultMap.values())
    .sort((a, b) => b.finalScore - a.finalScore)
}