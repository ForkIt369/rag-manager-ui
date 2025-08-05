import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all files
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    const files = await ctx.db
      .query("files")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
    
    return files;
  },
});

// Get a single file
export const get = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a file record
export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      createdAt: Date.now(),
    });
    
    return { fileId };
  },
});

// Delete a file
export const deleteFile = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Delete from storage
    await ctx.storage.delete(file.storageId);
    
    // Delete from database
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});