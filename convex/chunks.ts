import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

// Get all chunks (limited for analytics)
export const getAllChunks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 1000;
    const chunks = await ctx.db
      .query("chunks")
      .take(limit);
    
    return { chunks };
  },
});

// Get all chunks for a document
export const getDocumentChunks = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("asc")
      .collect();
    
    return { chunks };
  },
});

// Create a new chunk
export const createChunk = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    chunkIndex: v.number(),
    embedding: v.optional(v.array(v.float64())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const chunkId = await ctx.db.insert("chunks", {
      documentId: args.documentId,
      content: args.content,
      chunkIndex: args.chunkIndex,
      embedding: args.embedding,
      metadata: args.metadata || {},
      createdAt: Date.now(),
    });
    
    return { chunkId };
  },
});

// Update chunk embedding
export const updateChunkEmbedding = mutation({
  args: {
    id: v.id("chunks"),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      embedding: args.embedding,
    });
  },
});

// Delete chunks for a document
export const deleteDocumentChunks = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
    
    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }
    
    return { deleted: chunks.length };
  },
});

// Internal mutation for creating chunks from document processor
export const create = internalMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    embedding: v.array(v.float64()),
    embeddingModel: v.string(),
    embeddingDimension: v.number(),
    chunkIndex: v.number(),
    tokens: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chunks", args);
  },
});

// Vector search across chunks (internal)
export const vectorSearch = internalQuery({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Use Convex's vector search with correct syntax
    let results;
    if (args.documentId) {
      // Search within a specific document
      results = await ctx.db
        .query("chunks")
        .withIndex("vector_search", (q) => 
          q.vectorSearch("embedding", args.embedding)
           .filter((q) => q.eq(q.field("documentId"), args.documentId))
        )
        .take(limit);
    } else {
      // Search across all documents
      results = await ctx.db
        .query("chunks")
        .withIndex("vector_search", (q) => 
          q.vectorSearch("embedding", args.embedding)
        )
        .take(limit);
    }
    
    // Enhance results with document information
    const enhancedResults = await Promise.all(
      results.map(async (chunk) => {
        const document = await ctx.db.get(chunk.documentId);
        return {
          ...chunk,
          document: document ? {
            title: document.title,
            fileName: document.fileName,
            fileType: document.fileType,
          } : null,
        };
      })
    );
    
    return enhancedResults;
  },
});

// Keyword search across chunks
export const keywordSearch = internalQuery({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const query = args.query.toLowerCase();
    
    // Get chunks to search
    let chunks;
    if (args.documentId) {
      chunks = await ctx.db
        .query("chunks")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .collect();
    } else {
      chunks = await ctx.db
        .query("chunks")
        .take(1000); // Limit for performance
    }
    
    // Simple keyword matching
    const results = chunks
      .filter(chunk => chunk.content.toLowerCase().includes(query))
      .slice(0, limit);
    
    // Enhance with document info
    const enhancedResults = await Promise.all(
      results.map(async (chunk) => {
        const document = await ctx.db.get(chunk.documentId);
        return {
          ...chunk,
          document: document ? {
            title: document.title,
            fileName: document.fileName,
            fileType: document.fileType,
          } : null,
        };
      })
    );
    
    return enhancedResults;
  },
});