import { mutation } from "./_generated/server"
import { v } from "convex/values"

// Simple document upload that stores the file and creates a document record
export const generateUploadUrl = mutation(async (ctx) => {
  // Generate a storage upload URL
  const uploadUrl = await ctx.storage.generateUploadUrl()
  return uploadUrl
})

export const saveDocument = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    title: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    
    // Create document record
    const documentId = await ctx.db.insert("documents", {
      title: args.title || args.fileName,
      fileName: args.fileName,
      fileId: args.storageId,
      fileSize: args.fileSize,
      fileType: args.fileType,
      metadata: {},
      tags: args.tags || [],
      source: "manual_upload",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    
    // For now, mark as completed immediately
    // In production, this would trigger the processing pipeline
    await ctx.db.patch(documentId, {
      status: "completed",
      processedAt: now,
      chunkCount: 1,
    })
    
    // Create a simple chunk for testing
    await ctx.db.insert("chunks", {
      documentId,
      content: `Content from ${args.fileName}`,
      chunkIndex: 0,
      tokens: 10,
      embeddingModel: "voyage-3",
      embeddingDimension: 1024,
      metadata: {},
      createdAt: now,
    })
    
    return { 
      success: true,
      documentId,
      message: "Document uploaded successfully"
    }
  },
})