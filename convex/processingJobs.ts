import { v } from "convex/values"
import { mutation, query, internalMutation, internalQuery } from "./_generated/server"

export const create = internalMutation({
  args: {
    documentId: v.id("documents"),
    status: v.string(),
    stage: v.string(),
    progress: v.number(),
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("processingJobs", args)
  },
})

export const updateProgress = internalMutation({
  args: {
    documentId: v.id("documents"),
    stage: v.string(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("processingJobs")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .first()
    
    if (job) {
      await ctx.db.patch(job._id, {
        stage: args.stage,
        progress: args.progress,
      })
    }
  },
})

export const complete = internalMutation({
  args: {
    documentId: v.id("documents"),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("processingJobs")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .first()
    
    if (job) {
      await ctx.db.patch(job._id, {
        status: "completed",
        progress: 100,
        completedAt: args.completedAt,
      })
    }
  },
})

export const setError = internalMutation({
  args: {
    documentId: v.id("documents"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("processingJobs")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .first()
    
    if (job) {
      await ctx.db.patch(job._id, {
        status: "error",
        error: args.error,
        completedAt: Date.now(),
      })
    }
  },
})

export const getByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("processingJobs")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .first()
  },
})

export const getActiveJobs = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("processingJobs")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect()
  },
})