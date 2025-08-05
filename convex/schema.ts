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
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error")
    ),
    error: v.optional(v.string()),
    chunkCount: v.optional(v.number()),
    processingTime: v.optional(v.number()),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "fileType"]
    }),

  chunks: defineTable({
    documentId: v.id("documents"),
    content: v.string(),
    embedding: v.optional(v.array(v.float64())),
    embeddingModel: v.optional(v.string()),
    embeddingDimension: v.optional(v.number()),
    chunkIndex: v.number(),
    tokens: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_document", ["documentId"])
    .index("by_embedding", ["embedding"])
    .vectorIndex("vector_search", {
      vectorField: "embedding",
      dimensions: 1024,
      filterFields: ["documentId"]
    }),

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

  processingJobs: defineTable({
    documentId: v.id("documents"),
    status: v.string(),
    stage: v.string(),
    progress: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    metadata: v.optional(v.any())
  })
    .index("by_document", ["documentId"])
    .index("by_status", ["status"]),
});