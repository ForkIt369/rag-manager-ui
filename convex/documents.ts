import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// List documents with optional filtering
export const listDocuments = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    let query = ctx.db.query("documents");
    
    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else {
      query = query.withIndex("by_created");
    }

    const documents = await query
      .order("desc")
      .take(limit);
    
    return { documents };
  },
});

// Get a single document by ID
export const getDocument = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new document
export const createDocument = mutation({
  args: {
    title: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    metadata: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const documentId = await ctx.db.insert("documents", {
      title: args.title || args.fileName,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      metadata: args.metadata || {},
      tags: args.tags || [],
      source: args.source || "manual_upload",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    
    return { documentId };
  },
});

// Update document status
export const updateDocumentStatus = mutation({
  args: {
    id: v.id("documents"),
    status: v.string(),
    content: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const updates: Partial<Doc<"documents">> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    
    if (args.content !== undefined) {
      updates.content = args.content;
    }
    
    if (args.fileId !== undefined) {
      updates.fileId = args.fileId;
    }
    
    await ctx.db.patch(args.id, updates);
  },
});

// Update document metadata
export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const updates: Partial<Doc<"documents">> = {
      updatedAt: Date.now(),
    };
    
    if (args.title !== undefined) {
      updates.title = args.title;
    }
    
    if (args.tags !== undefined) {
      updates.tags = args.tags;
    }
    
    if (args.metadata !== undefined) {
      updates.metadata = args.metadata;
    }
    
    await ctx.db.patch(args.id, updates);
  },
});

// Delete a document
export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    // Delete associated chunks
    const chunks = await ctx.db
      .query("chunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.id))
      .collect();
    
    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }
    
    // Delete the document
    await ctx.db.delete(args.id);
  },
});

// Mock upload function for development
export const upload = mutation({
  args: {
    filename: v.string(),
    size: v.number(),
    type: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const documentId = await ctx.db.insert("documents", {
      title: args.filename,
      fileName: args.filename,
      fileSize: args.size,
      fileType: args.type,
      metadata: args.metadata || {},
      tags: [],
      source: "manual_upload",
      status: "completed", // Mock as completed
      createdAt: now,
      updatedAt: now,
    });
    
    return { documentId };
  },
});