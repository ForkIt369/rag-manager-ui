import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    metadata: v.optional(v.any()),
    tags: v.array(v.string()),
    source: v.string(),
    status: v.string(), // 'pending', 'processing', 'completed', 'error'
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  chunks: defineTable({
    documentId: v.id("documents"),
    content: v.string(),
    embedding: v.optional(v.array(v.float64())),
    chunkIndex: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_document", ["documentId"])
    .index("by_embedding", ["embedding"]),

  queries: defineTable({
    queryText: v.string(),
    resultCount: v.number(),
    topScore: v.float64(),
    responseTimeMs: v.number(),
    results: v.array(v.any()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  files: defineTable({
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});