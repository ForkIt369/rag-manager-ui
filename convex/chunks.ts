import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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