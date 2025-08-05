"use node"

import { action, internalMutation } from "../_generated/server"
import { internal } from "../_generated/api"
import { v } from "convex/values"

export const uploadAndProcess = action({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    try {
      // Create document record using the documents internal mutation
      const documentId = await ctx.runMutation(internal.documents.create, {
        title: args.fileName,
        fileName: args.fileName,
        fileId: args.storageId,
        fileSize: args.fileSize,
        fileType: args.fileType,
        tags: args.tags || [],
        source: "manual_upload",
      })
      
      // Trigger document processing
      await ctx.scheduler.runAfter(0, internal.actions.documentProcessor.processDocument, {
        documentId
      })
      
      return {
        success: true,
        documentId,
        message: "Document uploaded and queued for processing"
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: error.message
      }
    }
  },
})

